/**
 * Unified Hook Interface
 *
 * Write hooks once, run on both Claude Code and Gemini CLI.
 */

/**
 * Hook lifecycle event mapping between CLIs
 */
const EVENT_MAPPING = {
  // AIOS Event -> { claude: ClaudeEvent, gemini: GeminiEvent }
  sessionStart: { claude: null, gemini: 'SessionStart' },
  beforeAgent: { claude: 'PreToolUse', gemini: 'BeforeAgent' },
  beforeTool: { claude: 'PreToolUse', gemini: 'BeforeTool' },
  afterTool: { claude: 'PostToolUse', gemini: 'AfterTool' },
  sessionEnd: { claude: 'Stop', gemini: 'SessionEnd' },
};

/**
 * Base class for unified hooks
 */
class UnifiedHook {
  /**
   * Create a unified hook
   * @param {Object} config - Hook configuration
   * @param {string} config.name - Hook name
   * @param {string} config.event - AIOS event name
   * @param {string} [config.matcher='*'] - Tool/event matcher pattern
   */
  constructor(config) {
    this.name = config.name;
    this.event = config.event;
    this.matcher = config.matcher || '*';
    this.timeout = config.timeout || 5000;
  }

  /**
   * Execute the hook (override in subclass)
   * @param {HookContext} context - Execution context
   * @returns {Promise<HookResult>} Hook result
   */
  async execute(context) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Get Claude Code hook configuration
   * @returns {Object|null} Claude hook config or null if not supported
   */
  toClaudeConfig() {
    const claudeEvent = EVENT_MAPPING[this.event]?.claude;
    if (!claudeEvent) return null;
    return null;
  }

  /**
   * Get Gemini CLI hook configuration
   * @returns {Object} Gemini hook config
   */
  toGeminiConfig() {
    const geminiEvent = EVENT_MAPPING[this.event]?.gemini;
    return null;
  }
}

/**
 * Create context from environment (works for both CLIs)
 * @param {string} provider - Provider name
 * @returns {HookContext} Execution context
 */
function createContext(provider) {
  const isGemini = provider === 'gemini';

  return {
    projectDir: isGemini
      ? process.env.GEMINI_PROJECT_DIR || process.cwd()
      : process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    sessionId: isGemini
      ? process.env.GEMINI_SESSION_ID || `session-${Date.now()}`
      : process.env.CLAUDE_SESSION_ID || `session-${Date.now()}`,
    provider,
  };
}

/**
 * Format result for CLI consumption
 * @param {HookResult} result - Hook result
 * @param {string} provider - Provider name
 * @returns {string} JSON string
 */
function formatResult(result, provider) {
  if (provider === 'gemini') {
    return JSON.stringify({
      status: result.status === 'block' ? 'block' : 'success',
      message: result.message,
      contextInjection: result.contextInjection,
    });
  }

  // Claude format
  return JSON.stringify({
    continue: result.status !== 'block',
    message: result.message,
    context: result.contextInjection,
  });
}

module.exports = {
  UnifiedHook,
  EVENT_MAPPING,
  createContext,
  formatResult,
};
