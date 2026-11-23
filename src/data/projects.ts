/**
 * Every project on the site, in one place (single source of truth).
 *
 * The /projects page shows the whole archive, the home page shows `featured`,
 * and /algotrading shows the marketmaker.cc products plus the smaller trading
 * projects. Descriptions live in src/i18n/home.ts under projects.descs.
 */
import type { getHome } from '../i18n/home';
import type { Years } from '../i18n/utils';
import projectIcons from './project-icons.json';

type Copy = ReturnType<typeof getHome>['projects'];
export type CategoryKey = keyof Copy['categories'];
export type StatusKey = keyof Copy['status'];
export type DescKey = keyof Copy['descs'];
export type Role = keyof Copy['roles'];

export interface Project {
  name: string;
  descKey: DescKey;
  tags: string[];
  url?: string;
  status: StatusKey;
  private?: boolean;
  years?: Years;
  /** Defaults to 'founder'; set only where I was hired or a partner. */
  role?: Role;
  /** A job title shown instead of the role (CEO, CTO). */
  title?: string;
  /** A product of the marketmaker.cc ecosystem: listed on /algotrading. */
  marketmaker?: boolean;
}

export interface ProjectGroup {
  category: CategoryKey;
  items: Project[];
}

export const projects: ProjectGroup[] = [
  {
    category: 'Trading',
    items: [
      { name: 'Marketmaker.cc', title: 'CEO', marketmaker: true, descKey: 'Marketmaker.cc', tags: ['Go', 'TypeScript', 'QuestDB', 'DuckDB'], url: 'https://marketmaker.cc', status: 'active', years: [2024, 'now'] },
      { name: 'Scalper terminal', marketmaker: true, descKey: 'Scalper terminal', tags: ['Terminal', 'Order books', 'Hotkeys'], url: 'https://scalper.marketmaker.cc/', status: 'wip', years: [2026] },
      { name: 'Arena', marketmaker: true, descKey: 'Arena', tags: ['Competitions', 'AI Agents', 'Leaderboard'], url: 'https://arena.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Insider Warehouse', marketmaker: true, descKey: 'Insider Warehouse', tags: ['Signals', 'Telegram', 'Analytics'], url: 'https://insider-warehouse.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Manipulator Warehouse', marketmaker: true, descKey: 'Manipulator Warehouse', tags: ['Market bots', 'Detection'], url: 'https://manipulators.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Jev Bots Bench', marketmaker: true, descKey: 'Jev Bots Bench', tags: ['Benchmarks', 'Binance', 'Models'], url: 'https://jev-bots-bench.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Trading logos', marketmaker: true, descKey: 'Trading logos', tags: ['Cloudflare R2', 'CDN', 'SVG'], url: 'https://logos.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Trading themes', marketmaker: true, descKey: 'Trading themes', tags: ['CSS', 'JSON', 'Tailwind'], url: 'https://themes.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'ZigBolt', descKey: 'ZigBolt', tags: ['Zig', 'HFT', 'IPC'], url: 'https://github.com/suenot/zigbolt', status: 'active', years: [2026] },
      { name: 'trading-ipc-bench', descKey: 'trading-ipc-bench', tags: ['Go', 'C++', 'Benchmarks'], url: 'https://github.com/suenot/trading-ipc-bench', status: 'active', years: [2026] },
      { name: 'UI for Marketmaker.cc', marketmaker: true, descKey: 'UI for Marketmaker.cc', tags: ['React', 'TypeScript', 'Tailwind CSS'], url: 'https://ui.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Portfolio Optimizer', marketmaker: true, descKey: 'Portfolio Optimizer', tags: ['Next.js', 'Rust'], url: 'https://portfolio-optimizer.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'MarketMaker Sandbox', marketmaker: true, descKey: 'MarketMaker Sandbox', tags: ['REST API', 'Trading', 'Testing'], url: 'https://sandbox.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Trading Events Calendar', marketmaker: true, descKey: 'Trading Events Calendar', tags: ['Trading', 'Events'], url: 'https://events.marketmaker.cc/', status: 'active' },
      { name: 'bingx-leverages', descKey: 'bingx-leverages', tags: ['Python', 'BingX'], url: 'https://github.com/suenot', status: 'active', private: true, years: [2025] },
      { name: 'StockAPIs.com', descKey: 'StockAPIs.com', tags: ['Python', 'QuestDB', 'Parquet', 'Redis'], url: 'https://stockapis.com', status: 'wip', private: true },
      { name: 'Profitmaker.cc', marketmaker: true, descKey: 'Profitmaker.cc', tags: ['TypeScript', 'React', 'Vite'], url: 'https://profitmaker.cc', status: 'wip', years: [2017, 'now'] },
      { name: 'Trender', marketmaker: true, descKey: 'Trender', tags: ['Python', 'Zig', 'DuckDB', 'Numba'], url: 'https://trender.marketmaker.cc', status: 'wip', private: true, years: [2026] },
      { name: 'PolyTracker', descKey: 'PolyTracker', tags: ['TypeScript', 'Python'], url: 'https://github.com/suenot', status: 'concept', private: true },
      { name: 'Avellaneda-Stoikov', descKey: 'Avellaneda-Stoikov', tags: ['Python', 'HFT', 'Market Making'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025] },
      { name: 'Frontrunner', descKey: 'Frontrunner', tags: ['Go', 'Rust', 'fasthttp', 'HFT'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2024, 2026] },
      { name: 'simple-fast-fix-scalper', descKey: 'simple-fast-fix-scalper', tags: ['C++', 'FIX Protocol', 'HFT'], url: 'https://github.com/suenot/simple-fast-fix-scalper', status: 'paused', years: [2025] },
      { name: 'vector-arbitrage', descKey: 'vector-arbitrage', tags: ['C++', 'Arbitrage'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025, 2026] },
      { name: 'solana-arbitrage', descKey: 'solana-arbitrage', tags: ['Rust', 'Solana', 'Arbitrage'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025] },
      { name: 'Listing Monitor', descKey: 'Listing Monitor', tags: ['Rust', 'Zig', 'gRPC', 'Listing'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025, 2026] },
      { name: 'Binance Listing Rocket', descKey: 'Binance Listing Rocket', tags: ['Python', 'Listing', 'Binance'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025, 2026] },
      { name: 'Calculate Listing Profit', descKey: 'Calculate Listing Profit', tags: ['Python', 'Analytics'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025] },
      { name: 'Markowitz Portfolio', descKey: 'Markowitz Portfolio', tags: ['Python', 'Portfolio'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025] },
      { name: 'copytrader', descKey: 'copytrader', tags: ['TypeScript', 'gRPC'], url: 'https://github.com/suenot', status: 'paused', private: true },
      { name: 'Pair Arbitrage (Binance)', descKey: 'Pair Arbitrage (Binance)', tags: ['Python', 'Binance', 'Arbitrage'], url: 'https://github.com/suenot', status: 'paused', private: true },
      { name: 'deep-profitmaker', descKey: 'deep-profitmaker', tags: ['TypeScript', 'Deep.Foundation'], url: 'https://github.com/suenot/deep-profitmaker', status: 'paused', years: [2022, 2023] },
      { name: 'Tinkoff ETF Balancer Bot', descKey: 'Tinkoff ETF Balancer Bot', tags: ['Python', 'Tinkoff'], url: 'https://github.com/suenot/tinkoff-invest-etf-balancer-bot', status: 'paused', years: [2022, 2025] },
      { name: 'candle-trade-visualizer', descKey: 'candle-trade-visualizer', tags: ['TypeScript', 'Charts'], url: 'https://github.com/suenot/candle-trade-visualizer', status: 'paused', years: [2025] },
      { name: 'benchmarks-trading', descKey: 'benchmarks-trading', tags: ['Go', 'Benchmarks', 'HFT'], url: 'https://github.com/suenot', status: 'paused', private: true },
      { name: 'market-manipulator-detection', descKey: 'market-manipulator-detection', tags: ['Rust', 'Analytics'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2025] },
      { name: 'candle_aggregator_benchmark', descKey: 'candle_aggregator_benchmark', tags: ['Rust', 'OHLCV'], url: 'https://github.com/suenot/candle_aggregator_benchmark', status: 'paused', years: [2025] },
      { name: 'hyperliquid-c', descKey: 'hyperliquid-c', tags: ['C', 'HFT', 'Hyperliquid'], url: 'https://github.com/suenot/hyperliquid-c', status: 'paused', years: [2025] },
      { name: 'listingapis.com', marketmaker: true, descKey: 'listingapis.com', tags: ['Next.js', 'Postgres', 'Listing'], url: 'https://listingapis.com', status: 'active', years: [2025, 'now'] },
      { name: 'Warehouse', marketmaker: true, descKey: 'Warehouse', tags: ['Go', 'IPFS', 'Market Data'], url: 'https://warehouse.marketmaker.cc', status: 'active', years: [2024, 'now'] },
      { name: 'Kimchi', marketmaker: true, descKey: 'Kimchi', tags: ['Postgres', 'Arbitrage', 'Spreads'], url: 'https://kimchi.marketmaker.cc', status: 'active' },
      { name: 'Metrics', marketmaker: true, descKey: 'Metrics', tags: ['FastAPI', 'Next.js', 'Indicators'], url: 'https://metrics.marketmaker.cc', status: 'active', private: true },
      { name: 'Visual', marketmaker: true, descKey: 'Visual', tags: ['React Flow', 'FastAPI', 'Next.js'], url: 'https://visual.marketmaker.cc', status: 'active', private: true },
      { name: 'Popularity', marketmaker: true, descKey: 'Popularity', tags: ['Go', 'Next.js', 'Parsers'], url: 'https://popularity.marketmaker.cc', status: 'active', private: true, years: [2026] },
      { name: 'CRM', marketmaker: true, descKey: 'CRM', tags: ['Next.js', 'Postgres', 'Telegram'], url: 'https://crm.marketmaker.cc', status: 'wip', private: true },
    ],
  },
  {
    category: 'AI',
    items: [
      { name: 'Cmdop.com', title: 'CTO', descKey: 'Cmdop.com', tags: ['TypeScript', 'React', 'Next.js', 'AI Agents'], url: 'https://cmdop.com', status: 'active', years: [2025, 'now'] },
      { name: 'Reforms.ai', descKey: 'Reforms.ai', tags: ['Next.js', 'Notion', 'AI'], url: 'https://reforms.ai/', status: 'active', years: [2026] },
      { name: 'GPUs', descKey: 'GPUs', tags: ['Next.js', 'Elysia', 'Bun', 'Postgres'], url: 'https://gpu.marketmaker.cc', status: 'active', years: [2026] },
      { name: 'Harness Analyzer', descKey: 'Harness Analyzer', tags: ['React', 'Hono', 'PostgreSQL'], url: 'https://harness-analyzer.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Solver', descKey: 'Solver', tags: ['Python', 'FastAPI', 'MCP', 'Next.js'], url: 'https://solver.marketmaker.cc', status: 'active', private: true },
      { name: 'Publisher suite', descKey: 'Publisher suite', tags: ['Python', 'Camoufox', 'SQLite'], url: 'https://production.suenot.com', status: 'active', years: [2026] },
      { name: 'Reference crawler', descKey: 'Reference crawler', tags: ['Python', 'FastAPI', 'yt-dlp', 'SQLite FTS5'], url: 'https://production.suenot.com', status: 'active', years: [2026] },
      { name: 'News warehouse', descKey: 'News warehouse', tags: ['Go', 'PostgreSQL', 'Docker'], url: 'https://production.suenot.com', status: 'active', years: [2026] },
      { name: 'AI video pipeline', descKey: 'AI video pipeline', tags: ['HyperFrames', 'FFmpeg', 'Python'], url: 'https://production.suenot.com', status: 'active', years: [2026] },
      { name: 'gaia', descKey: 'gaia', tags: ['Python', 'Camoufox', 'Gemini', 'Veo 3'], url: 'https://github.com/suenot/gaia', status: 'active', years: [2026] },
      { name: 'Content factory', descKey: 'Content factory', tags: ['FFmpeg', 'Whisper', 'Python', 'Camoufox'], url: 'https://production.suenot.com', status: 'active', years: [2026] },
      { name: 'aicommit', descKey: 'aicommit', tags: ['Rust', 'CLI', 'LLM'], url: 'https://github.com/suenot/aicommit', status: 'active', years: [2024, 'now'] },
      { name: 'Codex Jev Router', descKey: 'Codex Jev Router', tags: ['Codex', 'Node.js', 'Model Routing'], url: 'https://github.com/suenot/codex-jev-router', status: 'active', years: [2026] },
      { name: 'Codex Jev Router Benchmarks', descKey: 'Codex Jev Router Benchmarks', tags: ['Codex', 'Django', 'Benchmarks'], url: 'https://github.com/suenot/codex-jev-router-benchmarks', status: 'active', years: [2026] },
      { name: 'SDKRouter', descKey: 'SDKRouter', tags: ['Python', 'Pydantic', 'OpenAI'], url: 'https://github.com/suenot', status: 'active', private: true, role: 'partner' },
      { name: 'DjangoCFG', descKey: 'DjangoCFG', tags: ['Python', 'Django', 'Pydantic AI'], url: 'https://djangocfg.com', status: 'active', private: true, role: 'partner' },
      { name: 'OpenScreenshot', descKey: 'OpenScreenshot', tags: ['Swift', 'macOS', 'LLM'], url: 'https://openscreenshot.suenot.com/', status: 'active', years: [2026] },
      { name: 'cmdop-claude', descKey: 'cmdop-claude', tags: ['Python', 'Claude', 'PyPI'], url: 'https://pypi.org/project/cmdop-claude/', status: 'active', role: 'partner' },
      { name: 'local-llm-proxy', descKey: 'local-llm-proxy', tags: ['Python', 'MCP', 'LLM'], url: 'https://github.com/suenot', status: 'active', private: true, years: [2026] },
      { name: 'Open Agent Manager', descKey: 'Open Agent Manager', tags: ['Tauri', 'Rust', 'React'], url: 'http://open-agent-manager.suenot.com/', status: 'paused', years: [2026] },
    ],
  },
  {
    category: 'Pet Projects',
    items: [
      { name: 'asdf', descKey: 'asdf', tags: ['Go', 'Next.js', 'Postgres'], url: 'https://asdf.marketmaker.cc', status: 'active' },
      { name: 'Pocket', descKey: 'Pocket', tags: ['Next.js', 'Go', 'SQLite'], url: 'https://pocket.marketmaker.cc/', status: 'active' },
      { name: 'Vacation / Стыковка', descKey: 'Vacation / Стыковка', tags: ['Next.js', 'Elysia', 'PostgreSQL'], url: 'https://vacation.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'SyncSong', descKey: 'SyncSong', tags: ['Vue', 'Vite', 'WebSocket'], url: 'https://syncsong.marketmaker.cc/', status: 'active' },
      { name: 'Slippage', descKey: 'Slippage', tags: ['Vite', 'Paper.js', 'Bun', 'WebSocket'], url: 'https://slippage.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'Curved Games', descKey: 'Curved Games', tags: ['JavaScript', 'Canvas'], url: 'https://curves.marketmaker.cc/', status: 'active', years: [2026] },
      { name: 'auth-service', descKey: 'auth-service', tags: ['Go', 'Next.js', 'SSO', 'Traefik'], url: 'https://auth.marketmaker.cc', status: 'active' },
      { name: 'Backups', descKey: 'Backups', tags: ['Bun', 'restic', 'Infra'], url: 'https://backups.marketmaker.cc', status: 'active', private: true },
      { name: 'Researcher', marketmaker: true, descKey: 'Researcher', tags: ['Node.js', 'Meilisearch', 'Scrapers'], url: 'https://researcher.marketmaker.cc', status: 'active' },
      { name: 'Hlider', descKey: 'Hlider', tags: ['Kotlin', 'Swift', 'SwiftUI', 'UIKit'], url: 'https://hlider.klava.org/', status: 'active', years: [2013, 'now'], role: 'partner' },
      { name: 'karabiner-visualizer', descKey: 'karabiner-visualizer', tags: ['TypeScript', 'React', 'Karabiner', 'macOS'], url: 'https://karabiner-visualizer.vercel.app/', status: 'active', years: [2026] },
      { name: 'distract-blocker', descKey: 'distract-blocker', tags: ['JavaScript', 'Chrome Extension', 'MV3', 'i18n'], url: 'https://distract-blocker.marketmaker.cc', status: 'active', years: [2026] },
      { name: 'MacChill', descKey: 'MacChill', tags: ['Swift', 'SwiftUI', 'macOS'], url: 'https://github.com/suenot/macchill', status: 'active', years: [2026] },
      { name: 'Sanctum', descKey: 'Sanctum', tags: ['TypeScript', 'AES-256-GCM'], url: 'https://github.com/suenot/sanctum', status: 'active', years: [2026] },
      { name: 'OpenLastPass', descKey: 'OpenLastPass', tags: ['Rust', 'React', 'Tauri'], url: 'https://github.com/suenot', status: 'wip', private: true, years: [2026] },
      { name: 'Vasya', descKey: 'Vasya', tags: ['TypeScript', 'Rust', 'Telegram'], url: 'https://github.com/suenot/vasya', status: 'paused', years: [2026] },
      { name: 'macpurge', descKey: 'macpurge', tags: ['TypeScript', 'macOS'], url: 'https://github.com/suenot', status: 'paused', private: true, years: [2026] },
      { name: 'deadline-in-days', descKey: 'deadline-in-days', tags: ['TypeScript'], url: 'https://github.com/suenot/deadline-in-days', status: 'paused', years: [2025] },
    ],
  },
  {
    category: 'Contract & Freelance',
    items: [
      { name: 'Deep.foundation & Deep.memo', descKey: 'Deep.foundation & Deep.memo', tags: ['Node.js', 'React', 'GraphQL', 'Hasura'], url: 'https://deep.foundation', status: 'paused', years: [2022, 2024], role: 'hired' },
      { name: 'Dolphin.bi', descKey: 'Dolphin.bi', tags: ['Vue', 'Python'], url: 'https://www.crunchbase.com/organization/dolphin-bi', status: 'rip', years: [2016, 2018], role: 'hired' },
      { name: 'Shakeapp', descKey: 'Shakeapp', tags: ['React', 'Node.js', 'GraphQL', 'Hasura'], url: 'https://play.google.com/store/apps/details?id=shakeapp.mobile.app', status: 'rip', years: [2020, 2022], role: 'hired' },
      { name: 'centrum-air.com', descKey: 'centrum-air.com', tags: ['React', 'Next.js'], url: 'https://centrum-air.com', status: 'left', years: [2023], role: 'hired' },
    ],
  },
  {
    category: 'Graveyard',
    items: [
      { name: 'Kupi.network', descKey: 'Kupi.network', tags: ['React', 'Vue', 'MobX'], url: 'https://github.com/suenot/kupi-terminal', status: 'rip', years: [2018, 2019] },
      { name: 'Kupi.ru', descKey: 'Kupi.ru', tags: ['PHP', 'JavaScript'], url: 'https://github.com/suenot', status: 'rip', years: [2013] },
      { name: 'Kupi.net', descKey: 'Kupi.net', tags: ['React', 'Django'], url: 'https://github.com/suenot', status: 'rip', years: [2019, 2020], role: 'partner' },
      { name: 'Deep chain', descKey: 'Deep chain', tags: ['Go', 'Cosmos SDK'], url: 'https://github.com/deep-foundation/deep-chain', status: 'paused', years: [2024, 2025], role: 'hired' },
      { name: 'Bursa DEX', descKey: 'Bursa DEX', tags: ['Solidity', 'React', 'Django'], status: 'rip', years: [2017, 2018] },
      { name: 'de-core.net', descKey: 'de-core.net', tags: ['HTML', 'CSS', 'JavaScript', 'Angular', 'React', 'Vue'], url: 'https://github.com/suenot', status: 'rip', years: [2010, 2016] },
      { name: 'Thermom', descKey: 'Thermom', tags: ['Vue', 'Ionic'], url: 'https://github.com/suenot', status: 'rip', years: [2016], role: 'partner' },
      { name: 'AI form filling for websites', descKey: 'AI form filling for websites', tags: ['AI', 'Automation'], status: 'rip', years: [2025] },
    ],
  },
  {
    category: 'Publications',
    items: [
      { name: 'The Algotrading Book', descKey: 'The Algotrading Book', tags: ['Content', 'Algotrading'], url: 'https://the-algotrading-book-website.vercel.app/', status: 'active', years: [2026] },
      { name: 'Mathematics for Trading', descKey: 'Mathematics for Trading', tags: ['Book', 'Math', 'Trading'], url: 'https://github.com/suenot/mathematics-learning-for-trading', status: 'wip', years: [2025, 'now'] },
      { name: 'Blog on Marketmaker.cc', marketmaker: true, descKey: 'Blog on Marketmaker.cc', tags: ['Blog', 'Backtesting', 'Analytics'], url: 'https://marketmaker.cc/en/blog/1/', status: 'active' },
    ],
  },
];

export const allProjects: Project[] = projects.flatMap((group) => group.items);

const byName = (name: string): Project => {
  const found = allProjects.find((project) => project.name === name);
  if (!found) throw new Error(`Unknown project: ${name}`);
  return found;
};

/** The home page list, in this order. */
export const featured: Project[] = ['Marketmaker.cc', 'Cmdop.com', 'Reforms.ai', 'Profitmaker.cc', 'listingapis.com', 'gaia', 'Vasya', 'macpurge'].map(byName);

/** /algotrading: everything marketmaker.cc runs, the umbrella site itself first. */
export const marketmakerProducts: Project[] = allProjects.filter((project) => project.marketmaker);

/** /algotrading: trading work that is not a marketmaker.cc product, plus the trading books. */
export const sideTradingGroups: ProjectGroup[] = [
  { category: 'Trading', items: projects.find((group) => group.category === 'Trading')!.items.filter((project) => !project.marketmaker) },
  { category: 'Publications', items: ['The Algotrading Book', 'Mathematics for Trading'].map(byName) },
];

export const roleOf = (project: Project): Role => project.role ?? 'founder';
/** Avatar: the project's own site icon (fetched into public/projects), else a monogram. */
export const iconOf = (project: Project): string | undefined => (projectIcons as Record<string, string>)[project.name];
export const hueOf = (name: string) => [...name].reduce((h, ch) => (h * 31 + ch.codePointAt(0)!) % 360, 7);
export const monogram = (name: string) => {
  const words = name.replace(/[^\p{L}\p{N} ]+/gu, ' ').trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
};
/** "arena.marketmaker.cc" from a project URL; null for code hosts, where the host says nothing. */
export const hostOf = (project: Project): string | null => {
  if (!project.url) return null;
  const host = new URL(project.url).hostname.replace(/^www\./, '');
  return /(^|\.)(github\.com|pypi\.org|vercel\.app|crunchbase\.com|play\.google\.com)$/.test(host) ? null : host;
};
