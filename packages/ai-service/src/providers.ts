/**
 * Concrete AI providers. The Anthropic provider is the default; the mock is used
 * in tests and offline dev so the platform runs without an API key.
 */
import type { AiProvider, StructuredRequest, StructuredResponse } from './index.js';

/**
 * Anthropic provider seam. Wire `@anthropic-ai/sdk` in deployment and use the
 * Messages API with tool-calling / structured output. Kept dependency-free here
 * so the package builds without network/keys.
 */
export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';
  constructor(private readonly opts: { apiKey?: string } = {}) {}

  async generateStructured(_req: StructuredRequest): Promise<StructuredResponse> {
    if (!this.opts.apiKey) {
      throw new Error(
        'AnthropicProvider needs ANTHROPIC_API_KEY. Install @anthropic-ai/sdk and wire the Messages API.',
      );
    }
    throw new Error('AnthropicProvider.generateStructured not yet wired to the SDK.');
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
