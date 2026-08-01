const blogHeroImages: Record<string, string> = {
  'agent-harness-architecture': '/images/blog/agent-harness-architecture-hero.png',
  'agentic-compute-graphs': '/images/blog/agentic-compute-graphs-hero.png',
  'cctoggle-claude-code': '/images/blog/cctoggle-hero.png',
  'claude-code-skills-wayfinder': '/images/blog/claude-code-skills-wayfinder-hero.png',
  'claude-opus-5-review': '/images/blog/claude-opus-5-review-hero.png',
  'clother-claude-wrappers': '/images/blog/clother-claude-hero.png',
  'cloudflare-resend-email': '/images/blog/cloudflare-resend-hero.png',
  'gigatoken-fast-tokenization': '/images/blog/gigatoken-fast-tokenization-hero.png',
  'gonka-free-tokens': '/images/blog/gonka-hero.png',
  'graphify-claude-code': '/images/blog/graphify-hero.png',
  'harness-not-model': '/images/blog/harness-hero.png',
  'karpathy-loop-ai-arbitrage': '/images/blog/karpathy-loop-ai-arbitrage-hero.png',
  'kimi-k3-open-source-sputnik': '/images/blog/kimi-k3-open-source-sputnik-hero.png',
  'kimi-k3': '/images/blog/kimi-k3-hero.png',
  'knowledge-graphs-algebra': '/images/blog/knowledge-graphs-algebra-hero.png',
  'kv-cache-paged-attention': '/images/blog/kv-cache-paged-attention-hero.png',
  'life-harness': '/images/blog/life-harness-hero.png',
  'liquid-foundation-models': '/images/blog/liquid-foundation-models-hero.png',
  'llm-tool-format-sync': '/images/blog/llm-tool-format-sync-hero.png',
  'model-routing-explained': '/images/blog/model-routing-explained-hero.png',
  'multi-agent-graph-engineering': '/images/blog/multi-agent-graph-engineering-hero.png',
  'muxy-terminal-focus': '/images/blog/muxy-terminal-hero.png',
  'notebooklm-youtube-guide': '/images/blog/notebooklm-youtube-hero.png',
  'openclaude-multi-provider': '/images/blog/openclaude-hero.png',
  'saving-tokens-llm': '/images/blog/saving-tokens-hero.png',
  'self-evolving-knowledge-systems': '/images/blog/self-evolving-knowledge-systems-hero.png',
  'vibe-graphing': '/images/blog/vibe-graphing-hero.png',
};

export function getPostHeroImage(slug: string, heroImage?: string): string | undefined {
  return heroImage || blogHeroImages[slug];
}
