/**
 * @etl/ai-service — provider-agnostic AI layer (Deliverable 11).
 *
 * Responsibilities: structured outputs, tool calling, prompt versioning, token
 * & cost tracking, context retrieval, redaction of sensitive values, tenant AI
 * settings, model selection by task. The layer is DRAFT-ONLY — it never writes
 * production config or processes production records.
 */
import { z } from 'zod';
import { TASK_SCHEMAS, type AiTask, type TaskOutput } from './schemas.js';

export * from './schemas.js';
export * from './providers.js';

// --- Provider abstraction ---------------------------------------------------

export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface StructuredRequest {
  model: string;
  messages: AiMessage[];
  /** JSON schema the response must conform to. */
  jsonSchema: unknown;
  maxOutputTokens?: number;
  /** Deterministic tools the model may call (schema.inspect, sql.run, …). */
  tools?: AiToolSpec[];
}

export interface StructuredResponse {
  /** Parsed JSON matching the requested schema. */
  data: unknown;
  usage: { inputTokens: number; outputTokens: number };
}

/** A deterministic tool the LLM can call; the platform executes it for real. */
export interface AiToolSpec {
  name: string; // e.g. "schema.inspect"
  description: string;
  inputSchema: unknown;
  handler: (input: unknown) => Promise<unknown>;
}

/** Implemented per provider (Anthropic, OpenAI, …). */
export interface AiProvider {
  readonly name: string;
  generateStructured(req: StructuredRequest): Promise<StructuredResponse>;
}

// --- Tenant AI settings & redaction ----------------------------------------

export interface TenantAiSettings {
  provider: string;
  defaultModel: string;
  modelByTask?: Partial<Record<AiTask, string>>;
  redactPii: boolean;
  shareSampleValues: boolean;
}

export interface RedactionResult {
  text: string;
  redactions: number;
}

/** Minimal PII redactor. Real impl uses the profiling PII map + tokenisation. */
export function redact(text: string, settings: TenantAiSettings): RedactionResult {
  if (!settings.redactPii) return { text, redactions: 0 };
  let count = 0;
  const patterns: RegExp[] = [
    /[\w.+-]+@[\w-]+\.[\w.-]+/g, // email
    /\b(?:\d[ -]?){13,19}\b/g, // card-like numbers
  ];
  let out = text;
  for (const p of patterns) {
    out = out.replace(p, () => {
      count += 1;
      return '[redacted]';
    });
  }
  return { text: out, redactions: count };
}

// --- Cost tracking ----------------------------------------------------------

export interface UsageSink {
  record(entry: {
    tenantId: string;
    task: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }): Promise<void>;
}

// --- Prompt versioning ------------------------------------------------------

export interface PromptStore {
  getActive(task: AiTask): Promise<{ id: string; template: string; model?: string } | null>;
}

// --- The orchestrator -------------------------------------------------------

export interface RunTaskOptions<T extends AiTask> {
  task: T;
  tenantId: string;
  settings: TenantAiSettings;
  /** Deterministic context already retrieved (schema, profile, prior mappings). */
  context: string;
  /** The instruction/question for this call. */
  instruction: string;
  tools?: AiToolSpec[];
  maxOutputTokens?: number;
}

export class AiService {
  constructor(
    private readonly provider: AiProvider,
    private readonly deps: { usage?: UsageSink; prompts?: PromptStore } = {},
  ) {}

  /**
   * Runs a task and returns validated, typed structured output. Applies
   * redaction, selects the model per task, validates against the task schema,
   * and records usage. The result is a DRAFT for human review.
   */
  async runTask<T extends AiTask>(opts: RunTaskOptions<T>): Promise<TaskOutput<T>> {
    const schema = TASK_SCHEMAS[opts.task] as z.ZodTypeAny;
    const prompt = await this.deps.prompts?.getActive(opts.task);
    const model =
      prompt?.model ?? opts.settings.modelByTask?.[opts.task] ?? opts.settings.defaultModel;

    const context = redact(opts.context, opts.settings).text;
    const instruction = redact(opts.instruction, opts.settings).text;

    const messages: AiMessage[] = [
      {
        role: 'system',
        content:
          (prompt?.template ??
            'You assist with ETL analysis. Distinguish confirmed facts from inference. ' +
              'Never present guesses as facts. Every conclusion must cite evidence. ' +
              'Return only the requested JSON.') + '',
      },
      { role: 'user', content: `Context:\n${context}\n\nTask:\n${instruction}` },
    ];

    const res = await this.provider.generateStructured({
      model,
      messages,
      jsonSchema: zodToJsonSchemaLike(schema),
      maxOutputTokens: opts.maxOutputTokens,
      tools: opts.tools,
    });

    await this.deps.usage?.record({
      tenantId: opts.tenantId,
      task: opts.task,
      model,
      inputTokens: res.usage.inputTokens,
      outputTokens: res.usage.outputTokens,
    });

    // Validate — reject malformed output rather than passing guesses downstream.
    return schema.parse(res.data) as TaskOutput<T>;
  }
}

/**
 * Placeholder JSON-schema emitter. In the real build, use `zod-to-json-schema`.
 * Kept dependency-light here; providers accept the Zod shape description.
 */
function zodToJsonSchemaLike(schema: z.ZodTypeAny): unknown {
  return { $zodType: schema._def?.typeName ?? 'unknown' };
}
