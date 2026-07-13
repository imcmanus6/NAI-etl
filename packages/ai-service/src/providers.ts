/**
 * Concrete AI providers. Anthropic is the default; the mock is used in tests and
 * offline dev so the platform runs without an API key.
 *
 * Structured output is obtained via forced tool-use: we expose a single tool
 * whose input_schema is the task's JSON schema and force the model to call it,
 * then read the validated tool input as the result.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { AiProvider, StructuredRequest, StructuredResponse } from './index.js';

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';
  private readonly client: Anthropic | null;

  constructor(opts: { apiKey?: string } = {}) {
    this.client = opts.apiKey ? new Anthropic({ apiKey: opts.apiKey }) : null;
  }

  get available(): boolean {
    return this.client !== null;
  }

  async generateStructured(req: StructuredRequest): Promise<StructuredResponse> {
    if (!this.client) {
      throw new Error('AnthropicProvider needs ANTHROPIC_API_KEY.');
    }
    const system = req.messages.find((m) => m.role === 'system')?.content;
    const userTurns = req.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await this.client.messages.create({
      model: req.model,
      max_tokens: req.maxOutputTokens ?? 4096,
      system,
      messages: userTurns.length ? userTurns : [{ role: 'user', content: 'Produce the structured result.' }],
      tools: [
        {
          name: 'emit_result',
          description: 'Return the structured result for this task.',
          input_schema: req.jsonSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: 'tool', name: 'emit_result' },
    });

    const toolUse = response.content.find((c) => c.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('Model did not return structured tool output');
    }
    return {
      data: toolUse.input,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}

/** Deterministic mock: returns a caller-supplied fixture. Great for tests. */
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';
  constructor(private readonly fixture: unknown = {}) {}

  async generateStructured(_req: StructuredRequest): Promise<StructuredResponse> {
    return { data: this.fixture, usage: { inputTokens: 0, outputTokens: 0 } };
  }
}

export function createAiProvider(provider = 'anthropic', env = process.env): AiProvider {
  switch (provider) {
    case 'anthropic':
      return new AnthropicProvider({ apiKey: env.ANTHROPIC_API_KEY });
    case 'mock':
      return new MockAiProvider();
    default:
      throw new Error(`Unknown AI provider "${provider}"`);
  }
}

/** True when the configured provider can actually reach an LLM. */
export function isLlmAvailable(env = process.env): boolean {
  const provider = env.AI_PROVIDER ?? 'anthropic';
  if (provider === 'anthropic') return Boolean(env.ANTHROPIC_API_KEY);
  if (provider === 'mock') return true;
  return false;
}
