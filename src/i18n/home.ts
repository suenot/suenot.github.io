import type { Locale } from './config';

// Translations for home page sections.
// All locales share the same shape as `home.en`.
// Note: tech terms, brand names, status labels, category keys, and project names
// remain in English across all locales (they're keys / tech jargon).

export const home = {
  en: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · Algotrading Developer',
      description:
        'Building algorithmic trading platforms, HFT infrastructure, and AI-powered developer tools. Trading since 2011.',
      cta_projects: 'View Projects',
      cta_contact: 'Get in Touch',
      stat_dev: 'Years in dev',
      stat_trading: 'Years trading',
      stat_stars: 'GitHub stars',
      stat_repos: 'GitHub repos',
    },
    about: {
      eyebrow: '01. about',
      heading: 'Who I am',
      p1_prefix: "I'm CEO of ",
      p1_marketmaker_suffix: ' (an algorithmic trading platform) and CTO of ',
      p1_cmdop_suffix: '.',
      p2_prefix: "I've been interested in cryptocurrencies and stock markets since ",
      p2_year: '2011',
      p2_suffix:
        '. Started with manual trading, gradually automated everything, and now focus on building HFT infrastructure and algorithmic trading platforms.',
      p3_prefix: 'Full-stack developer with deep expertise in ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: '. Based in Moscow.',
      focus_eyebrow: 'Current focus',
      focus: [
        {
          icon: '⚡',
          title: 'HFT Infrastructure',
          desc: 'Building ZigBolt — a Zig-based messaging system targeting <100ns IPC latency, 50M+ msg/sec',
        },
        {
          icon: '📊',
          title: 'Algorithmic Trading',
          desc: 'Marketmaker.cc — scalping terminal + backtesting engine for multi-timeframe strategies',
        },
        {
          icon: '🤖',
          title: 'AI Tooling',
          desc: 'SDKRouter for 300+ AI models, DjangoCFG with Pydantic AI agents, Cmdop remote management',
        },
        {
          icon: '📡',
          title: 'Market Data',
          desc: 'StockAPIs.com — crypto market data from 100+ exchanges, <100ms latency',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. algotrading',
      heading: 'Trading Engineering & HFT',
      intro:
        'Deep expertise in building low-latency execution systems, high-fidelity backtesting engines, and automated listing monitors across multiple programming languages.',
      sections: [
        {
          title: 'Backtesting',
          subtitle: 'Backtesting Engine',
          bullets: [
            'Developed a <strong>tick-sim engine</strong> that matches live bot behavior minute-by-minute, eliminating backtest-to-live drift.',
            'Implemented <strong>Genetic Optimization</strong> using Optuna (TPE, CMA-ES) for parallel parameter searching across 50+ threads.',
            'Engineered a distributed compute cluster (3 nodes) with an <strong>in-memory cache</strong>, accelerating backtests by 26x.',
            'Added support for 22 candle building methods including <strong>Renko, Range, and Tick/Volume Imbalance bars</strong>.',
          ],
        },
        {
          title: 'Listings',
          subtitle: 'Event-Driven Execution',
          bullets: [
            'Built ultra-fast <strong>listing monitors</strong> in Rust and Zig, detecting new pairs via API and market-diff detection.',
            'Developed low-latency, event-driven execution pipelines to automatically trade on high-volatility events.',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'High-Frequency Trading',
          bullets: [
            '<strong>Frontrunning Algorithms:</strong> Developed low-latency orderbook analyzers processing L1 (10ms) and L50 (20ms) streams simultaneously to hunt manipulator orders via adaptive deviation reduction.',
            '<strong>Market Making & Scalping:</strong> Implemented models like Avellaneda-Stoikov and high-performance FIX protocol scalpers.',
            '<strong>Execution Optimization:</strong> Optimized execution paths using <strong>fasthttp</strong> and custom gRPC adapters, achieving order placement in 3-7ms.',
          ],
        },
        {
          title: 'Arbitrage Systems',
          subtitle: 'Multi-Market Exploitation',
          bullets: [
            '<strong>Inter-exchange & Pair:</strong> Connected to 30+ exchanges. Built spot/futures arbitrage with two-stage correlation divergence approach and advanced limit-order management.',
            '<strong>Kimchi Premium:</strong> Developed a real-time monitoring and trading platform for Korean exchanges (Upbit) using a Go backend and Next.js dashboard.',
            '<strong>Prediction Markets:</strong> Built Polymarket bots for arbitrage and copy-trading, exploiting event-driven inefficiencies.',
            '<strong>Statistical Arbitrage:</strong> Researched and implemented stat-arb models on pseudographs (including the Bellman-Ford algorithm).',
          ],
        },
        {
          title: 'Portfolio Optimization',
          subtitle: 'Quantitative Modeling',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP):</strong> Implemented HRP using hierarchical clustering (dendrograms) and covariance matrices to allocate risk optimally.',
            '<strong>Risk Management:</strong> Integrated Hull-White CVaR correction to scale returns based on current volatility, dynamically converting risky assets to cash.',
            '<strong>Modern Portfolio Theory:</strong> Applied mean-variance optimization and efficient frontier modeling for crypto portfolios.',
            '<strong>Automated Balancers:</strong> Built a production Tinkoff ETF balancer bot for automated, rule-based portfolio rebalancing.',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. tech stack',
      heading: 'Technologies I use',
      categories: {
        Languages: 'Languages',
        'Languages (basics)': 'Languages (basics)',
        Databases: 'Databases',
        'API & Protocols': 'API & Protocols',
        Frontend: 'Frontend',
        'Cross-platform': 'Cross-platform',
        'Exchange APIs': 'Exchange APIs',
        'DevOps & Infra': 'DevOps & Infra',
      },
    },
    frontier: {
      eyebrow: '04. frontier projects',
      heading: "Where I'm leading",
      intro: 'Two companies where I hold founding leadership roles.',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          'Algorithmic trading platform & scalping terminal. 60+ crypto exchanges, real-time data, backtesting engine.',
        'Cmdop.com':
          'Remote server management via AI agents. Telegram/Discord/Slack bots, browser automation, skills marketplace.',
      },
    },
    projects: {
      eyebrow: '05. projects',
      heading: "What I'm building",
      intro:
        'Across my own products, open-source tools, and HFT infrastructure research.',
      categories: {
        Trading: 'Trading',
        AI: 'AI',
        'Pet Projects': 'Pet Projects',
        'Contract & Freelance': 'Contract & Freelance',
        Graveyard: 'Graveyard',
        Publications: 'Publications',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          'High-performance messaging system in Zig — competitor to Aeron. Target: IPC RTT <100ns, 50M+ msg/sec.',
        'trading-ipc-bench':
          'IPC benchmarks for algorithmic trading: shared memory, Unix sockets, NNG, ZeroMQ, gRPC, Aeron — p50/p95/p99 latency.',
        'bingx-leverages':
          'Python library for reverse-engineering BingX leverage tiers API.',
        'StockAPIs.com':
          'Crypto market data from 100+ exchanges, <100ms latency. AI agents for portfolio management and autonomous trading.',
        'Profitmaker.cc':
          'Open-source trading terminal (frontend + backend) for self-hosting, expandable with modules.',
        Trender:
          'High-performance tick-sim backtesting engine with Genetic Optimization (Optuna). Features 1s drill-down, distributed cluster (50+ threads), and 22+ candle building methods.',
        PolyTracker:
          'Polymarket analytics with copy-trading, insider detection, and arbitrage scanner.',
        'Avellaneda-Stoikov':
          'Implementation of the Avellaneda-Stoikov HFT market making model. Includes multiple versions and TigerBeetle integration.',
        Frontrunner:
          'Bybit HFT bot — L1/L50 orderbook analysis, adaptive deviation reduction, and hot connection warming. Order placement in 3–7ms.',
        'simple-fast-fix-scalper':
          'High-performance FIX protocol scalper in C++.',
        'vector-arbitrage': 'C++ vector arbitrage system for crypto exchanges.',
        'solana-arbitrage': 'Arbitrage bot for Solana in Rust.',
        'Listing Monitor':
          'Event-driven monitors for Upbit/Bithumb listings. Sub-100ms signal extraction from Telegram via gRPC. Optimized in Rust and Zig.',
        'Binance Listing Rocket': 'Automated trading on Binance listing events.',
        'Calculate Listing Profit':
          'Downloads trade data around listing events, builds candlestick data, provides detailed profit scenario analysis.',
        'Markowitz Portfolio':
          'Practical Modern Portfolio Theory for crypto portfolios — mean-variance optimization, efficient frontier.',
        copytrader: 'Copy trading platform for crypto exchanges.',
        'Pair Arbitrage (Binance)':
          'Spot/futures pair arbitrage on Binance — metrics, signals, and bots for detecting correlation divergence.',
        'deep-profitmaker':
          'Trading architecture on pseudographs using Deep.Foundation.',
        'Tinkoff ETF Balancer Bot':
          'Open-source bot for automatic ETF portfolio rebalancing via Tinkoff Invest API.',
        'candle-trade-visualizer':
          'OHLCV candlestick chart visualizer for trading data.',
        'benchmarks-trading':
          'Order placement latency benchmarks across exchanges after connection warming — ping, keep-alive, p50/p95/p99.',
        'market-manipulator-detection':
          'Rust library for detecting market manipulation patterns.',
        candle_aggregator_benchmark:
          'Rust OHLCV candle aggregator, batch aggregator, and generator with benchmarks.',
        'hyperliquid-c': 'C adapter/SDK for Hyperliquid exchange API.',
        aicommit:
          'Rust CLI for AI-generated commit messages via OpenRouter. 105 releases, VS Code extension, jail/blacklist failover.',
        SDKRouter:
          'Unified OpenAI-compatible Python SDK for 300+ AI models with Pydantic structured output and cost tracking.',
        DjangoCFG:
          'Open-source Django framework with AI agents via Pydantic AI, MCP server, gRPC, WebSocket, vector search, crypto payments.',
        OpenScreenshot:
          'macOS screenshot tool for LLM context. Captures screen regions, auto-downscales to save tokens, sends PNG straight to clipboard.',
        'cmdop-claude':
          'Python package — Claude integration for Cmdop, remote AI agent management via PyPI.',
        'local-llm-proxy':
          'MCP server — local LLM proxy for Claude Code with auto-fallback to cloud models.',
        'Open Agent Manager':
          'Desktop terminal for parallel AI coding agent sessions. Project sidebar, real PTY terminal, prompt queue. Local, SSH, or CMDOP connections.',
        Hlider:
          'On-screen keyboard for Android/iOS by klava.org. Partner project.',
        'karabiner-visualizer':
          'Web visualizer for Karabiner-Elements configs — view your macOS keyboard remaps as an interactive layout.',
        MacChill:
          'macOS menu bar app to monitor thermal pressure & auto-toggle Low Power Mode on Apple Silicon M1–M4.',
        Sanctum:
          'VSCode-like desktop editor for AES-256-GCM encrypted file vaults.',
        OpenLastPass:
          'Open-source password manager — Rust/Axum backend, React+TS frontend, Tauri desktop, React Native mobile, Argon2id/AES-256-GCM.',
        Vasya:
          'The Telegram Client for Deep Focus — minimalist Telegram client (TypeScript + Rust backend).',
        macpurge: 'Developer-focused macOS disk cleaner utility.',
        'deadline-in-days': 'Deadline countdown app showing days remaining.',
        'Deep.foundation & Deep.memo':
          'Open source startups. Fullstack dev: pseudo-graph DB, event-driven architecture, DevOps (Swarm, ArgoCD, Kubernetes, Terraform). 2022–present.',
        'Dolphin.bi':
          'Open-source crypto analytics marketplace. Sentiment analysis, ICO fundamental analysis. Went through Startupbootcamp. 2017–2018.',
        Shakeapp:
          'C2C/C2B sharing platform (car & home rental). React developer. 2020–2022.',
        'centrum-air.com':
          'Website for a private airline in Uzbekistan. 2023.',
        'Kupi.network':
          'Open-source crypto trading terminal supporting 130+ crypto exchanges. Two versions: React (class-based) and Vue 2. 2018–2019.',
        'Kupi.ru': 'Marketplace. Went through FRII acceleration. 2013.',
        'Kupi.net': 'Website builder startup. Partner. 2019–2020.',
        DeepChain: 'Blockchain on Cosmos SDK. 2024.',
        'Dolphin.bi (graveyard)':
          'Open-source crypto analytics marketplace. Sentiment analysis, ICO fundamental analysis, ICOFaces. ICO (unsuccessful). Went through Startupbootcamp. 2017–2018.',
        'Bursa.dex':
          'Open-source decentralized exchange. Solidity smart contract, Web3.js, orderbook caching. Won BlockchainHack by Waves. 2017.',
        'de-core.net':
          'Web development studio. Started as solo freelancer, grew to team of 3-7 devs. ~200 websites built. 2010-2016.',
        Thermom:
          'Partner in startup. Frontend for mobile app. Went through Bayer acceleration. 2016.',
        'The Algotrading Book':
          'Online book about algorithmic trading — strategies, backtesting, infrastructure, and practical guides.',
        'Mathematics for Trading':
          'Open-source book covering the math foundations traders need — statistics, linear algebra, optimization, and stochastic calculus for algorithmic and quantitative trading.',
        'Blog on Marketmaker.cc':
          'Articles on backtesting methodology, QuestDB analytics, Monte Carlo bootstrap, anomaly detection, profit/loss asymmetry, and more.',
      },
    },
    communities: {
      eyebrow: '06. communities',
      heading: 'My communities',
      items: {
        klavaorg: { name: 'klava.org', desc: 'Main klava.org community group.' },
        klavaorgwork: { name: 'Keyboards: ergonomics & layouts', desc: 'Chat about designing ergonomic keyboards and keyboard layouts.' },
      },
    },
    contact: {
      eyebrow: '07. contact',
      heading: 'Get in touch',
      intro:
        'Open to interesting projects, collaboration, or just a chat about trading, HFT, or AI tooling.',
    },
  },

  ru: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · Разработчик в алготрейдинге',
      description:
        'Создаю платформы для алгоритмической торговли, HFT-инфраструктуру и инструменты для разработчиков на базе AI. Торгую с 2011.',
      cta_projects: 'Смотреть проекты',
      cta_contact: 'Связаться',
      stat_dev: 'Лет в разработке',
      stat_trading: 'Лет в трейдинге',
      stat_stars: 'Звёзд на GitHub',
      stat_repos: 'Репозиториев',
    },
    about: {
      eyebrow: '01. обо мне',
      heading: 'Кто я',
      p1_prefix: 'Я — CEO ',
      p1_marketmaker_suffix: ' (платформа для алгоритмической торговли) и CTO ',
      p1_cmdop_suffix: '.',
      p2_prefix: 'Криптовалютами и фондовыми рынками интересуюсь с ',
      p2_year: '2011',
      p2_suffix:
        ' года. Начинал с ручной торговли, постепенно автоматизировал всё, а теперь фокусируюсь на HFT-инфраструктуре и платформах алготрейдинга.',
      p3_prefix: 'Full-stack разработчик с глубокой экспертизой в ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: '. Живу в Москве.',
      focus_eyebrow: 'Текущий фокус',
      focus: [
        {
          icon: '⚡',
          title: 'HFT-инфраструктура',
          desc: 'Разрабатываю ZigBolt — систему обмена сообщениями на Zig с целью <100ns IPC-латентности и 50M+ msg/sec',
        },
        {
          icon: '📊',
          title: 'Алгоритмическая торговля',
          desc: 'Marketmaker.cc — скальпинг-терминал и движок бэктестинга для мульти-таймфреймовых стратегий',
        },
        {
          icon: '🤖',
          title: 'AI-инструменты',
          desc: 'SDKRouter для 300+ AI-моделей, DjangoCFG с Pydantic AI-агентами, удалённое управление через Cmdop',
        },
        {
          icon: '📡',
          title: 'Рыночные данные',
          desc: 'StockAPIs.com — крипто-данные со 100+ бирж с латентностью <100ms',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. алготрейдинг',
      heading: 'Разработка торговых систем и HFT',
      intro:
        'Глубокая экспертиза в построении систем исполнения с низкой латентностью, высокоточных движков бэктестинга и автоматических мониторов листингов на нескольких языках программирования.',
      sections: [
        {
          title: 'Бэктестинг',
          subtitle: 'Движок бэктестинга',
          bullets: [
            'Разработал <strong>tick-sim движок</strong>, который повторяет поведение живого бота по минутам, устраняя расхождения между бэктестом и live.',
            'Реализовал <strong>генетическую оптимизацию</strong> через Optuna (TPE, CMA-ES) для параллельного поиска параметров в 50+ потоков.',
            'Построил распределённый вычислительный кластер (3 ноды) с <strong>in-memory кэшем</strong>, ускорив бэктесты в 26 раз.',
            'Добавил поддержку 22 методов построения свечей, включая <strong>Renko, Range и Tick/Volume Imbalance bars</strong>.',
          ],
        },
        {
          title: 'Листинги',
          subtitle: 'Событийное исполнение',
          bullets: [
            'Создал сверхбыстрые <strong>мониторы листингов</strong> на Rust и Zig: детекция новых пар через API и market-diff анализ.',
            'Разработал event-driven пайплайны исполнения с низкой латентностью для автоматической торговли на высоковолатильных событиях.',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'Высокочастотный трейдинг',
          bullets: [
            '<strong>Frontrunning-алгоритмы:</strong> разработал анализаторы стакана с низкой латентностью, обрабатывающие L1 (10ms) и L50 (20ms) потоки одновременно для поиска заявок манипуляторов через адаптивное сокращение отклонений.',
            '<strong>Market Making и скальпинг:</strong> реализовал модели вроде Avellaneda-Stoikov и высокопроизводительные скальперы на FIX-протоколе.',
            '<strong>Оптимизация исполнения:</strong> оптимизировал пути исполнения через <strong>fasthttp</strong> и кастомные gRPC-адаптеры, добившись размещения ордеров за 3–7ms.',
          ],
        },
        {
          title: 'Арбитражные системы',
          subtitle: 'Использование разницы между рынками',
          bullets: [
            '<strong>Межбиржевой и парный арбитраж:</strong> подключился к 30+ биржам. Построил spot/futures арбитраж с двухступенчатым подходом по дивергенции корреляции и продвинутым управлением лимитными ордерами.',
            '<strong>Kimchi Premium:</strong> разработал платформу мониторинга и торговли в реальном времени для корейских бирж (Upbit) на Go-бэкенде и Next.js дашборде.',
            '<strong>Prediction Markets:</strong> построил Polymarket-ботов для арбитража и копитрейдинга, использующих event-driven неэффективности.',
            '<strong>Статистический арбитраж:</strong> исследовал и реализовал stat-arb модели на псевдографах (включая алгоритм Беллмана-Форда).',
          ],
        },
        {
          title: 'Оптимизация портфеля',
          subtitle: 'Количественное моделирование',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP):</strong> реализовал HRP с иерархической кластеризацией (дендрограммы) и ковариационными матрицами для оптимального распределения риска.',
            '<strong>Риск-менеджмент:</strong> интегрировал коррекцию Hull-White CVaR для масштабирования доходностей по текущей волатильности с динамическим переводом рисковых активов в кэш.',
            '<strong>Modern Portfolio Theory:</strong> применил mean-variance оптимизацию и моделирование efficient frontier для крипто-портфелей.',
            '<strong>Автоматические балансировщики:</strong> построил production Tinkoff ETF балансировщик для автоматической ребалансировки портфеля по правилам.',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. технологии',
      heading: 'Технологии, с которыми работаю',
      categories: {
        Languages: 'Языки',
        'Languages (basics)': 'Языки (базово)',
        Databases: 'Базы данных',
        'API & Protocols': 'API и протоколы',
        Frontend: 'Frontend',
        'Cross-platform': 'Кроссплатформа',
        'Exchange APIs': 'API бирж',
        'DevOps & Infra': 'DevOps и инфраструктура',
      },
    },
    frontier: {
      eyebrow: '04. флагманские проекты',
      heading: 'Стою у руля',
      intro: 'Сооснователь обеих компаний — CEO и CTO.',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          'Платформа алгоритмической торговли и скальпинг-терминал. 60+ крипто-бирж, данные в реальном времени, движок бэктестинга.',
        'Cmdop.com':
          'Удалённое управление серверами через AI-агентов. Telegram/Discord/Slack боты, автоматизация браузера, маркетплейс скиллов.',
      },
    },
    projects: {
      eyebrow: '05. проекты',
      heading: 'Над чем работаю',
      intro:
        'Собственные продукты, open-source инструменты и исследования HFT-инфраструктуры.',
      categories: {
        Trading: 'Trading',
        AI: 'AI',
        'Pet Projects': 'Pet-проекты',
        'Contract & Freelance': 'Контракты и фриланс',
        Graveyard: 'Кладбище',
        Publications: 'Публикации',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          'Высокопроизводительная система обмена сообщениями на Zig — конкурент Aeron. Цель: IPC RTT <100ns, 50M+ msg/sec.',
        'trading-ipc-bench':
          'IPC-бенчмарки для алготрейдинга: shared memory, Unix sockets, NNG, ZeroMQ, gRPC, Aeron — латентность p50/p95/p99.',
        'bingx-leverages':
          'Python-библиотека для реверс-инжиниринга API уровней плеча BingX.',
        'StockAPIs.com':
          'Крипто рыночные данные со 100+ бирж, латентность <100ms. AI-агенты для управления портфелем и автономной торговли.',
        'Profitmaker.cc':
          'Open-source торговый терминал (frontend + backend) для self-hosting, расширяемый модулями.',
        Trender:
          'Высокопроизводительный tick-sim движок бэктестинга с генетической оптимизацией (Optuna). 1s drill-down, распределённый кластер (50+ потоков) и 22+ метода построения свечей.',
        PolyTracker:
          'Аналитика Polymarket с копитрейдингом, детекцией инсайдеров и сканером арбитража.',
        'Avellaneda-Stoikov':
          'Реализация HFT market making модели Avellaneda-Stoikov. Несколько версий и интеграция с TigerBeetle.',
        Frontrunner:
          'HFT-бот для Bybit — анализ стакана L1/L50, адаптивное сокращение отклонений, hot connection warming. Размещение ордера за 3–7ms.',
        'simple-fast-fix-scalper':
          'Высокопроизводительный скальпер на FIX-протоколе на C++.',
        'vector-arbitrage':
          'Система векторного арбитража на C++ для крипто-бирж.',
        'solana-arbitrage': 'Арбитражный бот для Solana на Rust.',
        'Listing Monitor':
          'Event-driven мониторы листингов Upbit/Bithumb. Извлечение сигналов из Telegram через gRPC за <100ms. Оптимизирован на Rust и Zig.',
        'Binance Listing Rocket':
          'Автоматическая торговля на событиях листинга Binance.',
        'Calculate Listing Profit':
          'Загружает данные сделок вокруг событий листинга, строит свечи и предоставляет детальный анализ сценариев прибыли.',
        'Markowitz Portfolio':
          'Практическая Modern Portfolio Theory для крипто-портфелей — mean-variance оптимизация, efficient frontier.',
        copytrader: 'Платформа копитрейдинга для крипто-бирж.',
        'Pair Arbitrage (Binance)':
          'Spot/futures парный арбитраж на Binance — метрики, сигналы и боты для детекции дивергенции корреляции.',
        'deep-profitmaker':
          'Торговая архитектура на псевдографах с использованием Deep.Foundation.',
        'Tinkoff ETF Balancer Bot':
          'Open-source бот для автоматической ребалансировки ETF-портфеля через Tinkoff Invest API.',
        'candle-trade-visualizer':
          'Визуализатор OHLCV-свечей для торговых данных.',
        'benchmarks-trading':
          'Бенчмарки латентности размещения ордеров на биржах после прогрева соединения — ping, keep-alive, p50/p95/p99.',
        'market-manipulator-detection':
          'Rust-библиотека для детекции паттернов рыночных манипуляций.',
        candle_aggregator_benchmark:
          'Rust агрегатор OHLCV-свечей, батч-агрегатор и генератор с бенчмарками.',
        'hyperliquid-c': 'C-адаптер/SDK для API биржи Hyperliquid.',
        aicommit:
          'Rust CLI для AI-генерации коммит-сообщений через OpenRouter. 105 релизов, расширение для VS Code, jail/blacklist failover.',
        SDKRouter:
          'Унифицированный OpenAI-совместимый Python SDK для 300+ AI-моделей с Pydantic structured output и трекингом стоимости.',
        DjangoCFG:
          'Open-source Django-фреймворк с AI-агентами через Pydantic AI, MCP-сервером, gRPC, WebSocket, векторным поиском и крипто-платежами.',
        OpenScreenshot:
          'Инструмент для скриншотов на macOS для LLM-контекста. Захватывает области экрана, авто-уменьшает для экономии токенов и шлёт PNG прямо в буфер.',
        'cmdop-claude':
          'Python-пакет — интеграция Claude с Cmdop, удалённое управление AI-агентами через PyPI.',
        'local-llm-proxy':
          'MCP-сервер — локальный LLM-прокси для Claude Code с авто-фолбэком на облачные модели.',
        'Open Agent Manager':
          'Десктопный терминал для параллельных сессий AI-кодинг-агентов. Сайдбар проектов, реальный PTY-терминал, очередь промптов. Локальные, SSH или CMDOP-подключения.',
        Hlider:
          'Экранная клавиатура для Android/iOS от klava.org. Партнёрский проект.',
        'karabiner-visualizer':
          'Веб-визуализатор конфигов Karabiner-Elements — интерактивный просмотр кастомных раскладок клавиатуры на macOS.',
        MacChill:
          'macOS menu-bar приложение для мониторинга термального давления и авто-переключения Low Power Mode на Apple Silicon M1–M4.',
        Sanctum:
          'Десктопный редактор уровня VSCode для AES-256-GCM зашифрованных хранилищ файлов.',
        OpenLastPass:
          'Open-source менеджер паролей — Rust/Axum бэкенд, React+TS фронтенд, Tauri-десктоп, React Native мобайл, Argon2id/AES-256-GCM.',
        Vasya:
          'The Telegram Client for Deep Focus — минималистичный Telegram-клиент (TypeScript + Rust бэкенд).',
        macpurge:
          'Утилита очистки диска на macOS для разработчиков.',
        'deadline-in-days':
          'Приложение-обратный отсчёт дедлайнов с количеством оставшихся дней.',
        'Deep.foundation & Deep.memo':
          'Open-source стартапы. Fullstack-разработка: псевдо-граф БД, event-driven архитектура, DevOps (Swarm, ArgoCD, Kubernetes, Terraform). 2022–настоящее время.',
        'Dolphin.bi':
          'Open-source маркетплейс крипто-аналитики. Sentiment-анализ, фундаментальный анализ ICO. Прошёл Startupbootcamp. 2017–2018.',
        Shakeapp:
          'C2C/C2B sharing-платформа (аренда авто и жилья). React-разработчик. 2020–2022.',
        'centrum-air.com':
          'Сайт частной авиакомпании в Узбекистане. 2023.',
        'Kupi.network':
          'Open-source крипто торговый терминал с поддержкой 130+ бирж. Две версии: React (классовые) и Vue 2. 2018–2019.',
        'Kupi.ru': 'Маркетплейс. Прошёл акселерацию ФРИИ. 2013.',
        'Kupi.net': 'Стартап-конструктор сайтов. Партнёр. 2019–2020.',
        DeepChain: 'Блокчейн на Cosmos SDK. 2024.',
        'Dolphin.bi (graveyard)':
          'Open-source маркетплейс крипто-аналитики. Sentiment-анализ, фундаментальный анализ ICO, ICOFaces. ICO (неуспешное). Прошёл Startupbootcamp. 2017–2018.',
        'Bursa.dex':
          'Open-source децентрализованная биржа. Solidity smart-contract, Web3.js, кэширование стакана. Победитель BlockchainHack by Waves. 2017.',
        'de-core.net':
          'Студия веб-разработки. Начинал как соло-фрилансер, вырос до команды 3–7 разработчиков. ~200 сайтов. 2010–2016.',
        Thermom:
          'Партнёр в стартапе. Frontend мобильного приложения. Прошёл акселерацию Bayer. 2016.',
        'The Algotrading Book':
          'Онлайн-книга по алгоритмической торговле — стратегии, бэктестинг, инфраструктура и практические гайды.',
        'Mathematics for Trading':
          'Open-source книга по математике для трейдеров — статистика, линейная алгебра, оптимизация и стохастическое исчисление для алготрейдинга и количественного анализа.',
        'Blog on Marketmaker.cc':
          'Статьи о методологии бэктестинга, аналитике QuestDB, Monte Carlo bootstrap, детекции аномалий, асимметрии прибыли/убытков и многом другом.',
      },
    },
    communities: {
      eyebrow: '06. сообщества',
      heading: 'Мои сообщества',
      items: {
        klavaorg: { name: 'klava.org', desc: 'Основная группа сообщества klava.org.' },
        klavaorgwork: { name: 'Клавиатуры: эргономика и раскладки', desc: 'Чат о разработке эргономичных клавиатур и раскладок.' },
      },
    },
    contact: {
      eyebrow: '07. контакты',
      heading: 'Связаться со мной',
      intro:
        'Открыт к интересным проектам, сотрудничеству или просто к разговору о трейдинге, HFT или AI-инструментах.',
    },
  },

  zh: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · 量化交易开发者',
      description:
        '构建算法交易平台、HFT 基础设施以及 AI 驱动的开发者工具。自 2011 年起从事交易。',
      cta_projects: '查看项目',
      cta_contact: '联系我',
      stat_dev: '开发年数',
      stat_trading: '交易年数',
      stat_stars: 'GitHub stars',
      stat_repos: 'GitHub 仓库',
    },
    about: {
      eyebrow: '01. 关于',
      heading: '关于我',
      p1_prefix: '我是 ',
      p1_marketmaker_suffix: '（一个算法交易平台）的 CEO，同时也是 ',
      p1_cmdop_suffix: ' 的 CTO。',
      p2_prefix: '我自 ',
      p2_year: '2011',
      p2_suffix:
        ' 年起就对加密货币和股票市场感兴趣。从手动交易起步，逐步实现全面自动化，目前专注于构建 HFT 基础设施和算法交易平台。',
      p3_prefix: '全栈开发者，精通 ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: '。常驻莫斯科。',
      focus_eyebrow: '当前重点',
      focus: [
        {
          icon: '⚡',
          title: 'HFT 基础设施',
          desc: '正在构建 ZigBolt —— 基于 Zig 的消息系统，目标 IPC 延迟 <100ns，50M+ msg/sec',
        },
        {
          icon: '📊',
          title: '算法交易',
          desc: 'Marketmaker.cc —— 用于多时间框架策略的剥头皮终端与回测引擎',
        },
        {
          icon: '🤖',
          title: 'AI 工具',
          desc: 'SDKRouter 支持 300+ AI 模型，DjangoCFG 集成 Pydantic AI 代理，Cmdop 远程管理',
        },
        {
          icon: '📡',
          title: '市场数据',
          desc: 'StockAPIs.com —— 来自 100+ 交易所的加密市场数据，延迟 <100ms',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. 量化交易',
      heading: 'Trading Engineering 与 HFT',
      intro:
        '在低延迟执行系统、高保真回测引擎以及跨多种编程语言的自动化上线监控方面拥有深厚专长。',
      sections: [
        {
          title: '回测',
          subtitle: 'Backtesting Engine',
          bullets: [
            '开发了一套 <strong>tick-sim 引擎</strong>，可逐分钟匹配实盘机器人行为，消除回测与实盘的偏差。',
            '使用 Optuna（TPE、CMA-ES）实现 <strong>遗传优化</strong>，支持 50+ 线程的并行参数搜索。',
            '搭建了 3 节点分布式计算集群，配合 <strong>内存缓存</strong>，将回测速度提升 26 倍。',
            '新增 22 种 K 线构建方法，包括 <strong>Renko、Range 与 Tick/Volume Imbalance 柱</strong>。',
          ],
        },
        {
          title: '上线监控',
          subtitle: 'Event-Driven Execution',
          bullets: [
            '使用 Rust 和 Zig 构建超快 <strong>上线监控器</strong>，通过 API 与 market-diff 检测识别新交易对。',
            '开发低延迟、事件驱动的执行管线，可在高波动事件中自动交易。',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'High-Frequency Trading',
          bullets: [
            '<strong>抢跑算法：</strong>开发低延迟订单簿分析器，同时处理 L1（10ms）和 L50（20ms）数据流，通过自适应偏差缩减来捕获操纵者订单。',
            '<strong>做市与剥头皮：</strong>实现 Avellaneda-Stoikov 等模型与高性能 FIX 协议剥头皮策略。',
            '<strong>执行优化：</strong>使用 <strong>fasthttp</strong> 和自研 gRPC 适配器优化执行路径，下单速度达到 3–7ms。',
          ],
        },
        {
          title: 'Arbitrage Systems',
          subtitle: 'Multi-Market Exploitation',
          bullets: [
            '<strong>跨交易所与配对套利：</strong>连接 30+ 交易所。构建 spot/futures 套利，采用两阶段相关性背离方法与高级限价单管理。',
            '<strong>Kimchi Premium：</strong>使用 Go 后端 + Next.js 仪表盘为韩国交易所（Upbit）开发实时监控与交易平台。',
            '<strong>预测市场：</strong>构建 Polymarket 套利与跟单机器人，利用事件驱动的市场低效。',
            '<strong>统计套利：</strong>研究并实现基于伪图的 stat-arb 模型（包含 Bellman-Ford 算法）。',
          ],
        },
        {
          title: '投资组合优化',
          subtitle: 'Quantitative Modeling',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP)：</strong>使用层次聚类（树状图）与协方差矩阵实现 HRP，实现最优风险分配。',
            '<strong>风险管理：</strong>集成 Hull-White CVaR 修正，根据当前波动率缩放收益，动态将风险资产转为现金。',
            '<strong>Modern Portfolio Theory：</strong>对加密组合应用均值-方差优化与 efficient frontier 建模。',
            '<strong>自动平衡器：</strong>为 Tinkoff ETF 构建生产级平衡机器人，按规则自动再平衡投资组合。',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. 技术栈',
      heading: '我使用的技术',
      categories: {
        Languages: '编程语言',
        'Languages (basics)': '语言（基础）',
        Databases: '数据库',
        'API & Protocols': 'API 与协议',
        Frontend: '前端',
        'Cross-platform': '跨平台',
        'Exchange APIs': '交易所 API',
        'DevOps & Infra': 'DevOps 与基础设施',
      },
    },
    frontier: {
      eyebrow: '04. 旗舰项目',
      heading: '我正在主导的',
      intro: '我担任创始领导角色的两家公司。',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          '算法交易平台与剥头皮终端。60+ 加密交易所、实时数据、回测引擎。',
        'Cmdop.com':
          '通过 AI 代理远程管理服务器。Telegram/Discord/Slack 机器人、浏览器自动化、技能市场。',
      },
    },
    projects: {
      eyebrow: '05. 项目',
      heading: '我正在构建的',
      intro:
        '涵盖我自己的产品、开源工具以及 HFT 基础设施研究。',
      categories: {
        Trading: '交易',
        AI: 'AI',
        'Pet Projects': '个人项目',
        'Contract & Freelance': '合同与自由职业',
        Graveyard: '墓地',
        Publications: '出版物',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          '基于 Zig 的高性能消息系统 —— Aeron 的竞争者。目标：IPC RTT <100ns，50M+ msg/sec。',
        'trading-ipc-bench':
          '算法交易的 IPC 基准测试：共享内存、Unix sockets、NNG、ZeroMQ、gRPC、Aeron —— p50/p95/p99 延迟。',
        'bingx-leverages':
          '用于逆向工程 BingX 杠杆层级 API 的 Python 库。',
        'StockAPIs.com':
          '来自 100+ 交易所的加密市场数据，延迟 <100ms。用于组合管理和自主交易的 AI 代理。',
        'Profitmaker.cc':
          '开源交易终端（前端 + 后端），支持自托管，可通过模块扩展。',
        Trender:
          '高性能 tick-sim 回测引擎，配备 Optuna 遗传优化。1 秒级钻取、分布式集群（50+ 线程）以及 22+ 种 K 线构建方法。',
        PolyTracker:
          'Polymarket 分析平台，含跟单交易、内幕检测与套利扫描器。',
        'Avellaneda-Stoikov':
          'Avellaneda-Stoikov HFT 做市模型实现。包含多个版本以及 TigerBeetle 集成。',
        Frontrunner:
          'Bybit HFT 机器人 —— L1/L50 订单簿分析、自适应偏差缩减与热连接预热。下单 3–7ms。',
        'simple-fast-fix-scalper':
          'C++ 编写的高性能 FIX 协议剥头皮策略。',
        'vector-arbitrage':
          '面向加密交易所的 C++ 向量套利系统。',
        'solana-arbitrage': '基于 Rust 的 Solana 套利机器人。',
        'Listing Monitor':
          'Upbit/Bithumb 上线的事件驱动监控器。通过 gRPC 从 Telegram 提取信号，延迟 <100ms。使用 Rust 和 Zig 优化。',
        'Binance Listing Rocket': 'Binance 上线事件自动化交易。',
        'Calculate Listing Profit':
          '下载上线事件前后的成交数据，构建 K 线数据，并提供详细的盈利情景分析。',
        'Markowitz Portfolio':
          '面向加密组合的实用 Modern Portfolio Theory —— 均值-方差优化、efficient frontier。',
        copytrader: '加密交易所的跟单交易平台。',
        'Pair Arbitrage (Binance)':
          'Binance 上的 spot/futures 配对套利 —— 用于检测相关性背离的指标、信号与机器人。',
        'deep-profitmaker':
          '基于 Deep.Foundation 的伪图交易架构。',
        'Tinkoff ETF Balancer Bot':
          '通过 Tinkoff Invest API 自动重新平衡 ETF 投资组合的开源机器人。',
        'candle-trade-visualizer':
          '面向交易数据的 OHLCV K 线可视化工具。',
        'benchmarks-trading':
          '连接预热后跨交易所的下单延迟基准 —— ping、keep-alive、p50/p95/p99。',
        'market-manipulator-detection':
          '用于检测市场操纵模式的 Rust 库。',
        candle_aggregator_benchmark:
          'Rust OHLCV K 线聚合器、批量聚合器与生成器，附带基准测试。',
        'hyperliquid-c': 'Hyperliquid 交易所 API 的 C 适配器/SDK。',
        aicommit:
          '通过 OpenRouter 用 AI 生成提交信息的 Rust CLI。105 个版本，VS Code 扩展，jail/blacklist 故障转移。',
        SDKRouter:
          '统一的 OpenAI 兼容 Python SDK，支持 300+ AI 模型，含 Pydantic 结构化输出与成本追踪。',
        DjangoCFG:
          '开源 Django 框架，集成 Pydantic AI 代理、MCP 服务器、gRPC、WebSocket、向量搜索、加密支付。',
        OpenScreenshot:
          '用于 LLM 上下文的 macOS 截图工具。捕获屏幕区域，自动降采样以节省 token，PNG 直接发到剪贴板。',
        'cmdop-claude':
          'Python 包 —— Cmdop 的 Claude 集成，通过 PyPI 进行远程 AI 代理管理。',
        'local-llm-proxy':
          'MCP 服务器 —— Claude Code 的本地 LLM 代理，可自动回退到云模型。',
        'Open Agent Manager':
          '用于并行 AI 编程代理会话的桌面终端。项目侧边栏、真实 PTY 终端、提示队列。支持本地、SSH 或 CMDOP 连接。',
        Hlider:
          'klava.org 出品的 Android/iOS 屏幕键盘。合作项目。',
        'karabiner-visualizer':
          'Karabiner-Elements 配置的网页可视化工具——以交互式布局查看 macOS 键盘重映射。',
        MacChill:
          'macOS 菜单栏应用，监测 Apple Silicon M1–M4 的热压力并自动切换低电量模式。',
        Sanctum:
          '类 VSCode 的桌面编辑器，用于 AES-256-GCM 加密的文件保险库。',
        OpenLastPass:
          '开源密码管理器 —— Rust/Axum 后端、React+TS 前端、Tauri 桌面、React Native 移动端、Argon2id/AES-256-GCM。',
        Vasya:
          'The Telegram Client for Deep Focus —— 极简 Telegram 客户端（TypeScript + Rust 后端）。',
        macpurge: '面向开发者的 macOS 磁盘清理工具。',
        'deadline-in-days': '显示剩余天数的截止日期倒计时应用。',
        'Deep.foundation & Deep.memo':
          '开源创业项目。全栈开发：伪图数据库、事件驱动架构、DevOps（Swarm、ArgoCD、Kubernetes、Terraform）。2022 至今。',
        'Dolphin.bi':
          '开源加密分析市场。情绪分析、ICO 基本面分析。曾通过 Startupbootcamp。2017–2018。',
        Shakeapp:
          'C2C/C2B 共享平台（汽车与房屋租赁）。React 开发者。2020–2022。',
        'centrum-air.com':
          '乌兹别克斯坦私营航空公司网站。2023。',
        'Kupi.network':
          '支持 130+ 加密交易所的开源加密交易终端。两个版本：React（class-based）与 Vue 2。2018–2019。',
        'Kupi.ru': '电商平台。曾通过 FRII 加速器。2013。',
        'Kupi.net': '网站建站工具创业项目。合伙人。2019–2020。',
        DeepChain: '基于 Cosmos SDK 的区块链。2024。',
        'Dolphin.bi (graveyard)':
          '开源加密分析市场。情绪分析、ICO 基本面分析、ICOFaces。ICO 失败。曾通过 Startupbootcamp。2017–2018。',
        'Bursa.dex':
          '开源去中心化交易所。Solidity 智能合约、Web3.js、订单簿缓存。获 Waves BlockchainHack 冠军。2017。',
        'de-core.net':
          'Web 开发工作室。从单人自由职业起步，发展为 3–7 人团队，建立 ~200 个网站。2010–2016。',
        Thermom:
          '创业合伙人。移动 App 前端。曾通过 Bayer 加速器。2016。',
        'The Algotrading Book':
          '关于算法交易的在线书籍 —— 策略、回测、基础设施与实用指南。',
        'Mathematics for Trading':
          '面向交易者的开源数学书 —— 统计学、线性代数、优化和随机微积分，覆盖算法交易与量化分析所需的数学基础。',
        'Blog on Marketmaker.cc':
          '关于回测方法学、QuestDB 分析、Monte Carlo bootstrap、异常检测、盈亏不对称等的文章。',
      },
    },
    communities: {
      eyebrow: '06. 社区',
      heading: '我的社区',
      items: {
        klavaorg: { name: 'klava.org', desc: 'klava.org 主要社区群组。' },
        klavaorgwork: { name: '键盘：人体工学与布局', desc: '关于人体工学键盘与键盘布局设计的聊天群。' },
      },
    },
    contact: {
      eyebrow: '07. 联系',
      heading: '联系方式',
      intro:
        '欢迎有趣的项目、合作机会，或就交易、HFT 或 AI 工具进行交流。',
    },
  },

  ko: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · 알고트레이딩 개발자',
      description:
        '알고리즘 트레이딩 플랫폼, HFT 인프라, AI 기반 개발자 도구를 만듭니다. 2011년부터 트레이딩 중.',
      cta_projects: '프로젝트 보기',
      cta_contact: '연락하기',
      stat_dev: '개발 경력',
      stat_trading: '트레이딩 경력',
      stat_stars: 'GitHub stars',
      stat_repos: 'GitHub 리포',
    },
    about: {
      eyebrow: '01. 소개',
      heading: '나는 누구인가',
      p1_prefix: '저는 ',
      p1_marketmaker_suffix: '(알고리즘 트레이딩 플랫폼)의 CEO이자 ',
      p1_cmdop_suffix: '의 CTO입니다.',
      p2_prefix: '저는 ',
      p2_year: '2011',
      p2_suffix:
        '년부터 암호화폐와 주식 시장에 관심을 가져왔습니다. 수동 트레이딩으로 시작해 점차 모든 것을 자동화했고, 지금은 HFT 인프라와 알고리즘 트레이딩 플랫폼 구축에 집중하고 있습니다.',
      p3_prefix: '풀스택 개발자로 ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: ' 에 깊은 전문성을 보유. 모스크바 거주.',
      focus_eyebrow: '현재 집중 분야',
      focus: [
        {
          icon: '⚡',
          title: 'HFT 인프라',
          desc: 'ZigBolt 개발 중 — Zig 기반 메시징 시스템, 목표: IPC 지연 <100ns, 50M+ msg/sec',
        },
        {
          icon: '📊',
          title: '알고리즘 트레이딩',
          desc: 'Marketmaker.cc — 멀티 타임프레임 전략을 위한 스캘핑 터미널 + 백테스팅 엔진',
        },
        {
          icon: '🤖',
          title: 'AI 툴링',
          desc: '300+ AI 모델용 SDKRouter, Pydantic AI 에이전트 기반 DjangoCFG, Cmdop 원격 관리',
        },
        {
          icon: '📡',
          title: '시장 데이터',
          desc: 'StockAPIs.com — 100+ 거래소에서 수집한 암호화폐 시장 데이터, 지연 <100ms',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. 알고트레이딩',
      heading: 'Trading Engineering & HFT',
      intro:
        '저지연 실행 시스템, 고정확도 백테스팅 엔진, 여러 프로그래밍 언어에 걸친 자동화된 상장 모니터 구축에 대한 깊은 전문성을 보유하고 있습니다.',
      sections: [
        {
          title: '백테스팅',
          subtitle: 'Backtesting Engine',
          bullets: [
            '실시간 봇의 동작을 분 단위로 일치시키는 <strong>tick-sim 엔진</strong>을 개발하여 백테스트-실거래 간 드리프트를 제거했습니다.',
            'Optuna(TPE, CMA-ES) 기반 <strong>유전 알고리즘 최적화</strong>를 구현하여 50+ 스레드에서 병렬 파라미터 탐색을 수행했습니다.',
            '3개 노드 분산 컴퓨팅 클러스터와 <strong>인메모리 캐시</strong>를 설계하여 백테스트 속도를 26배 향상시켰습니다.',
            '<strong>Renko, Range, Tick/Volume Imbalance bars</strong>를 포함한 22가지 캔들 생성 방식을 지원합니다.',
          ],
        },
        {
          title: '상장',
          subtitle: 'Event-Driven Execution',
          bullets: [
            'Rust와 Zig로 초고속 <strong>상장 모니터</strong>를 구축, API와 market-diff 탐지를 통해 신규 페어를 감지합니다.',
            '고변동성 이벤트에서 자동으로 거래할 수 있도록 저지연 이벤트 기반 실행 파이프라인을 개발했습니다.',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'High-Frequency Trading',
          bullets: [
            '<strong>프론트러닝 알고리즘:</strong> L1(10ms)과 L50(20ms) 스트림을 동시에 처리하는 저지연 오더북 분석기를 개발하여 적응형 편차 감소 기법으로 조작 주문을 추적했습니다.',
            '<strong>마켓 메이킹 & 스캘핑:</strong> Avellaneda-Stoikov 등의 모델과 고성능 FIX 프로토콜 스캘퍼를 구현했습니다.',
            '<strong>실행 최적화:</strong> <strong>fasthttp</strong>와 커스텀 gRPC 어댑터로 실행 경로를 최적화하여 주문 체결 시간을 3-7ms로 단축했습니다.',
          ],
        },
        {
          title: 'Arbitrage Systems',
          subtitle: 'Multi-Market Exploitation',
          bullets: [
            '<strong>거래소 간 & 페어 차익거래:</strong> 30+ 거래소에 연결. 2단계 상관관계 발산 방식과 고도화된 지정가 주문 관리로 spot/futures 차익거래를 구축했습니다.',
            '<strong>김치 프리미엄:</strong> Go 백엔드와 Next.js 대시보드로 한국 거래소(Upbit)용 실시간 모니터링 및 거래 플랫폼을 개발했습니다.',
            '<strong>예측 시장:</strong> 이벤트 기반 비효율성을 활용하는 Polymarket 차익거래 및 카피트레이딩 봇을 구축했습니다.',
            '<strong>통계적 차익거래:</strong> 의사 그래프(Bellman-Ford 알고리즘 포함) 기반 stat-arb 모델을 연구하고 구현했습니다.',
          ],
        },
        {
          title: '포트폴리오 최적화',
          subtitle: 'Quantitative Modeling',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP):</strong> 계층적 클러스터링(덴드로그램)과 공분산 행렬을 사용하여 최적의 리스크 배분을 수행하는 HRP를 구현했습니다.',
            '<strong>리스크 관리:</strong> Hull-White CVaR 보정을 통합하여 현재 변동성에 따라 수익률을 조정하고, 위험 자산을 동적으로 현금화합니다.',
            '<strong>Modern Portfolio Theory:</strong> 암호화폐 포트폴리오에 평균-분산 최적화와 efficient frontier 모델링을 적용했습니다.',
            '<strong>자동 리밸런서:</strong> 규칙 기반 자동 포트폴리오 리밸런싱을 위한 프로덕션 Tinkoff ETF 밸런서 봇을 구축했습니다.',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. 기술 스택',
      heading: '사용하는 기술',
      categories: {
        Languages: '언어',
        'Languages (basics)': '언어 (기초)',
        Databases: '데이터베이스',
        'API & Protocols': 'API 및 프로토콜',
        Frontend: '프런트엔드',
        'Cross-platform': '크로스 플랫폼',
        'Exchange APIs': '거래소 API',
        'DevOps & Infra': 'DevOps 및 인프라',
      },
    },
    frontier: {
      eyebrow: '04. 주요 프로젝트',
      heading: '제가 이끄는 곳',
      intro: '제가 창업 리더십을 맡고 있는 두 회사.',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          '알고리즘 트레이딩 플랫폼 & 스캘핑 터미널. 60+ 암호화폐 거래소, 실시간 데이터, 백테스팅 엔진.',
        'Cmdop.com':
          'AI 에이전트를 통한 원격 서버 관리. Telegram/Discord/Slack 봇, 브라우저 자동화, 스킬 마켓플레이스.',
      },
    },
    projects: {
      eyebrow: '05. 프로젝트',
      heading: '제가 만들고 있는 것',
      intro:
        '나만의 제품, 오픈소스 도구, HFT 인프라 연구 전반.',
      categories: {
        Trading: '트레이딩',
        AI: 'AI',
        'Pet Projects': '개인 프로젝트',
        'Contract & Freelance': '계약 & 프리랜스',
        Graveyard: '무덤',
        Publications: '출판물',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          'Zig 기반 고성능 메시징 시스템 — Aeron의 경쟁자. 목표: IPC RTT <100ns, 50M+ msg/sec.',
        'trading-ipc-bench':
          '알고리즘 트레이딩용 IPC 벤치마크: 공유 메모리, Unix sockets, NNG, ZeroMQ, gRPC, Aeron — p50/p95/p99 지연.',
        'bingx-leverages':
          'BingX 레버리지 등급 API를 리버스 엔지니어링하는 Python 라이브러리.',
        'StockAPIs.com':
          '100+ 거래소의 암호화폐 시장 데이터, 지연 <100ms. 포트폴리오 관리 및 자율 트레이딩용 AI 에이전트.',
        'Profitmaker.cc':
          '셀프 호스팅 가능한 오픈소스 트레이딩 터미널(프런트엔드 + 백엔드), 모듈로 확장 가능.',
        Trender:
          'Optuna 유전 알고리즘 최적화 기반 고성능 tick-sim 백테스팅 엔진. 1초 단위 드릴다운, 분산 클러스터(50+ 스레드), 22+ 캔들 생성 방식 지원.',
        PolyTracker:
          '카피트레이딩, 내부자 탐지, 차익거래 스캐너를 갖춘 Polymarket 분석 플랫폼.',
        'Avellaneda-Stoikov':
          'Avellaneda-Stoikov HFT 마켓 메이킹 모델 구현. 여러 버전과 TigerBeetle 통합 포함.',
        Frontrunner:
          'Bybit HFT 봇 — L1/L50 오더북 분석, 적응형 편차 감소, 핫 커넥션 워밍. 주문 체결 3-7ms.',
        'simple-fast-fix-scalper':
          'C++로 작성된 고성능 FIX 프로토콜 스캘퍼.',
        'vector-arbitrage':
          '암호화폐 거래소용 C++ 벡터 차익거래 시스템.',
        'solana-arbitrage': 'Rust로 작성된 Solana 차익거래 봇.',
        'Listing Monitor':
          'Upbit/Bithumb 상장용 이벤트 기반 모니터. gRPC를 통한 Telegram 신호 추출 100ms 이하. Rust와 Zig로 최적화.',
        'Binance Listing Rocket':
          'Binance 상장 이벤트에서의 자동 트레이딩.',
        'Calculate Listing Profit':
          '상장 이벤트 전후 체결 데이터를 다운로드하고 캔들 데이터를 구성하여 상세한 수익 시나리오 분석을 제공.',
        'Markowitz Portfolio':
          '암호화폐 포트폴리오용 실용 Modern Portfolio Theory — 평균-분산 최적화, efficient frontier.',
        copytrader: '암호화폐 거래소용 카피 트레이딩 플랫폼.',
        'Pair Arbitrage (Binance)':
          'Binance의 spot/futures 페어 차익거래 — 상관관계 발산 탐지를 위한 지표, 시그널, 봇.',
        'deep-profitmaker':
          'Deep.Foundation을 활용한 의사 그래프 기반 트레이딩 아키텍처.',
        'Tinkoff ETF Balancer Bot':
          'Tinkoff Invest API를 통한 자동 ETF 포트폴리오 리밸런싱 오픈소스 봇.',
        'candle-trade-visualizer':
          '트레이딩 데이터용 OHLCV 캔들 차트 시각화 도구.',
        'benchmarks-trading':
          '커넥션 워밍 후 거래소 간 주문 체결 지연 벤치마크 — ping, keep-alive, p50/p95/p99.',
        'market-manipulator-detection':
          '시장 조작 패턴을 탐지하는 Rust 라이브러리.',
        candle_aggregator_benchmark:
          'Rust OHLCV 캔들 집계기, 배치 집계기, 제너레이터 및 벤치마크.',
        'hyperliquid-c': 'Hyperliquid 거래소 API용 C 어댑터/SDK.',
        aicommit:
          'OpenRouter를 통해 AI로 커밋 메시지를 생성하는 Rust CLI. 105개 릴리스, VS Code 확장, jail/blacklist 페일오버.',
        SDKRouter:
          '300+ AI 모델을 지원하는 통합 OpenAI 호환 Python SDK. Pydantic 구조화 출력 및 비용 추적.',
        DjangoCFG:
          'Pydantic AI 에이전트, MCP 서버, gRPC, WebSocket, 벡터 검색, 암호화폐 결제를 지원하는 오픈소스 Django 프레임워크.',
        OpenScreenshot:
          'LLM 컨텍스트용 macOS 스크린샷 도구. 화면 영역 캡처, 토큰 절약을 위한 자동 다운스케일링, PNG를 클립보드로 바로 전송.',
        'cmdop-claude':
          'Python 패키지 — Cmdop을 위한 Claude 통합, PyPI를 통한 원격 AI 에이전트 관리.',
        'local-llm-proxy':
          'MCP 서버 — Claude Code용 로컬 LLM 프록시, 클라우드 모델 자동 페일오버.',
        'Open Agent Manager':
          '병렬 AI 코딩 에이전트 세션을 위한 데스크톱 터미널. 프로젝트 사이드바, 실제 PTY 터미널, 프롬프트 큐. 로컬, SSH, CMDOP 연결 지원.',
        Hlider:
          'klava.org의 Android/iOS 화면 키보드. 파트너 프로젝트.',
        'karabiner-visualizer':
          'Karabiner-Elements 설정 웹 시각화 도구 — macOS 키보드 리매핑을 인터랙티브 레이아웃으로 확인.',
        MacChill:
          'Apple Silicon M1–M4의 열 압력을 모니터링하고 저전력 모드를 자동 전환하는 macOS 메뉴바 앱.',
        Sanctum:
          'AES-256-GCM 암호화된 파일 볼트용 VSCode 스타일 데스크톱 에디터.',
        OpenLastPass:
          '오픈소스 패스워드 매니저 — Rust/Axum 백엔드, React+TS 프런트엔드, Tauri 데스크톱, React Native 모바일, Argon2id/AES-256-GCM.',
        Vasya:
          'The Telegram Client for Deep Focus — 미니멀 Telegram 클라이언트 (TypeScript + Rust 백엔드).',
        macpurge: '개발자를 위한 macOS 디스크 클리너 유틸리티.',
        'deadline-in-days': '남은 일수를 보여주는 마감일 카운트다운 앱.',
        'Deep.foundation & Deep.memo':
          '오픈소스 스타트업. 풀스택 개발: 의사 그래프 DB, 이벤트 기반 아키텍처, DevOps (Swarm, ArgoCD, Kubernetes, Terraform). 2022~현재.',
        'Dolphin.bi':
          '오픈소스 암호화폐 분석 마켓플레이스. 감정 분석, ICO 펀더멘털 분석. Startupbootcamp 통과. 2017–2018.',
        Shakeapp:
          'C2C/C2B 공유 플랫폼 (자동차 & 주택 렌탈). React 개발자. 2020–2022.',
        'centrum-air.com':
          '우즈베키스탄 민간 항공사 웹사이트. 2023.',
        'Kupi.network':
          '130+ 암호화폐 거래소를 지원하는 오픈소스 암호화폐 트레이딩 터미널. 두 버전: React (클래스 기반)과 Vue 2. 2018–2019.',
        'Kupi.ru': '마켓플레이스. FRII 액셀러레이션 통과. 2013.',
        'Kupi.net': '웹사이트 빌더 스타트업. 파트너. 2019–2020.',
        DeepChain: 'Cosmos SDK 기반 블록체인. 2024.',
        'Dolphin.bi (graveyard)':
          '오픈소스 암호화폐 분석 마켓플레이스. 감정 분석, ICO 펀더멘털 분석, ICOFaces. ICO (실패). Startupbootcamp 통과. 2017–2018.',
        'Bursa.dex':
          '오픈소스 탈중앙화 거래소. Solidity 스마트 컨트랙트, Web3.js, 오더북 캐싱. Waves의 BlockchainHack 우승. 2017.',
        'de-core.net':
          '웹 개발 스튜디오. 1인 프리랜서로 시작해 3-7명 팀으로 성장. ~200개 웹사이트 제작. 2010–2016.',
        Thermom:
          '스타트업 파트너. 모바일 앱 프런트엔드. Bayer 액셀러레이션 통과. 2016.',
        'The Algotrading Book':
          '알고리즘 트레이딩에 관한 온라인 책 — 전략, 백테스팅, 인프라, 실전 가이드.',
        'Mathematics for Trading':
          '트레이더를 위한 오픈소스 수학 책 — 알고리즘 트레이딩과 퀀트 분석에 필요한 통계, 선형대수, 최적화, 확률 미적분 기초.',
        'Blog on Marketmaker.cc':
          '백테스팅 방법론, QuestDB 분석, Monte Carlo bootstrap, 이상치 탐지, 손익 비대칭 등에 대한 글들.',
      },
    },
    communities: {
      eyebrow: '06. 커뮤니티',
      heading: '내 커뮤니티',
      items: {
        klavaorg: { name: 'klava.org', desc: 'klava.org 메인 커뮤니티 그룹.' },
        klavaorgwork: { name: '키보드: 인체공학 & 레이아웃', desc: '인체공학 키보드와 키보드 레이아웃 설계에 대한 채팅.' },
      },
    },
    contact: {
      eyebrow: '07. 연락처',
      heading: '연락하기',
      intro:
        '흥미로운 프로젝트, 협업, 또는 트레이딩 / HFT / AI 툴링에 관한 대화 모두 환영합니다.',
    },
  },

  ja: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · アルゴトレーディング開発者',
      description:
        'アルゴリズム取引プラットフォーム、HFTインフラ、AI 駆動の開発者ツールを構築。2011年からトレーディング。',
      cta_projects: 'プロジェクトを見る',
      cta_contact: 'お問い合わせ',
      stat_dev: '開発歴',
      stat_trading: 'トレード歴',
      stat_stars: 'GitHub stars',
      stat_repos: 'GitHub リポジトリ',
    },
    about: {
      eyebrow: '01. 概要',
      heading: '私について',
      p1_prefix: '私は ',
      p1_marketmaker_suffix: '（アルゴリズム取引プラットフォーム）の CEO であり、',
      p1_cmdop_suffix: ' の CTO でもあります。',
      p2_prefix: '',
      p2_year: '2011',
      p2_suffix:
        ' 年から暗号通貨と株式市場に興味を持っています。手動トレーディングから始め、徐々にすべてを自動化し、現在は HFT インフラとアルゴリズム取引プラットフォームの構築に注力しています。',
      p3_prefix: 'フルスタック開発者として ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: ' に深い専門性を持ちます。モスクワ在住。',
      focus_eyebrow: '現在のフォーカス',
      focus: [
        {
          icon: '⚡',
          title: 'HFT インフラ',
          desc: 'ZigBolt を開発中 — Zig ベースのメッセージングシステム、目標 IPC レイテンシ <100ns、50M+ msg/sec',
        },
        {
          icon: '📊',
          title: 'アルゴリズム取引',
          desc: 'Marketmaker.cc — マルチタイムフレーム戦略向けスキャルピングターミナル + バックテストエンジン',
        },
        {
          icon: '🤖',
          title: 'AI ツール',
          desc: '300+ AI モデル用 SDKRouter、Pydantic AI エージェント搭載 DjangoCFG、Cmdop によるリモート管理',
        },
        {
          icon: '📡',
          title: 'マーケットデータ',
          desc: 'StockAPIs.com — 100+ 取引所からの暗号通貨マーケットデータ、レイテンシ <100ms',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. アルゴトレーディング',
      heading: 'Trading Engineering と HFT',
      intro:
        '低レイテンシ執行システム、高忠実度バックテストエンジン、複数のプログラミング言語にまたがる自動上場モニタの構築に関する深い専門性を有しています。',
      sections: [
        {
          title: 'バックテスト',
          subtitle: 'Backtesting Engine',
          bullets: [
            'ライブボットの挙動を分単位で再現する <strong>tick-sim エンジン</strong> を開発し、バックテストと実取引のドリフトを解消しました。',
            'Optuna（TPE、CMA-ES）を用いた <strong>遺伝的最適化</strong> を実装し、50+ スレッドでパラメータを並列探索しました。',
            '<strong>インメモリキャッシュ</strong> を備えた 3 ノードの分散コンピュートクラスタを構築し、バックテストを 26 倍高速化しました。',
            '<strong>Renko、Range、Tick/Volume Imbalance bars</strong> を含む 22 種類のローソク足構築方法に対応しました。',
          ],
        },
        {
          title: '上場検知',
          subtitle: 'Event-Driven Execution',
          bullets: [
            'Rust と Zig で超高速な <strong>上場モニタ</strong> を構築し、API と market-diff 検知で新規ペアを検出します。',
            '高ボラティリティイベントで自動売買するための低レイテンシ・イベント駆動の執行パイプラインを開発しました。',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'High-Frequency Trading',
          bullets: [
            '<strong>フロントランニング・アルゴリズム:</strong> L1（10ms）と L50（20ms）のストリームを同時に処理する低レイテンシ板分析器を開発し、適応的偏差削減でマニピュレーターの注文を捕捉しました。',
            '<strong>マーケットメイキング & スキャルピング:</strong> Avellaneda-Stoikov などのモデルや高性能 FIX プロトコル・スキャルパーを実装しました。',
            '<strong>執行最適化:</strong> <strong>fasthttp</strong> とカスタム gRPC アダプタで執行経路を最適化し、注文発行を 3-7ms で実現しました。',
          ],
        },
        {
          title: 'Arbitrage Systems',
          subtitle: 'Multi-Market Exploitation',
          bullets: [
            '<strong>取引所間・ペア間アービトラージ:</strong> 30+ 取引所に接続。2 段階の相関ダイバージェンス手法と高度な指値注文管理で spot/futures アービトラージを構築しました。',
            '<strong>キムチプレミアム:</strong> Go バックエンドと Next.js ダッシュボードで、韓国取引所（Upbit）向けのリアルタイムモニタリング・取引プラットフォームを開発しました。',
            '<strong>予測市場:</strong> イベント駆動の非効率性を利用する Polymarket のアービトラージおよびコピートレード bot を構築しました。',
            '<strong>統計的アービトラージ:</strong> 擬グラフ（Bellman-Ford アルゴリズム含む）上での stat-arb モデルを研究・実装しました。',
          ],
        },
        {
          title: 'ポートフォリオ最適化',
          subtitle: 'Quantitative Modeling',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP):</strong> 階層的クラスタリング（デンドログラム）と共分散行列を用いて、最適なリスク配分を行う HRP を実装しました。',
            '<strong>リスク管理:</strong> Hull-White CVaR 補正を統合し、現在のボラティリティに応じてリターンをスケーリングし、リスク資産を動的にキャッシュへ変換します。',
            '<strong>Modern Portfolio Theory:</strong> 暗号通貨ポートフォリオに対し平均-分散最適化と efficient frontier モデリングを適用しました。',
            '<strong>自動バランサー:</strong> ルールベースで自動的にポートフォリオをリバランスする本番運用の Tinkoff ETF バランサー bot を構築しました。',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. 技術スタック',
      heading: '使用している技術',
      categories: {
        Languages: '言語',
        'Languages (basics)': '言語（基礎）',
        Databases: 'データベース',
        'API & Protocols': 'API・プロトコル',
        Frontend: 'フロントエンド',
        'Cross-platform': 'クロスプラットフォーム',
        'Exchange APIs': '取引所 API',
        'DevOps & Infra': 'DevOps・インフラ',
      },
    },
    frontier: {
      eyebrow: '04. 主要プロジェクト',
      heading: '率いているプロジェクト',
      intro: '創業メンバーとしてリーダーシップを担っている 2 社。',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          'アルゴリズム取引プラットフォーム & スキャルピングターミナル。60+ の暗号通貨取引所、リアルタイムデータ、バックテストエンジン。',
        'Cmdop.com':
          'AI エージェントによるリモートサーバー管理。Telegram/Discord/Slack bot、ブラウザ自動化、スキルマーケットプレイス。',
      },
    },
    projects: {
      eyebrow: '05. プロジェクト',
      heading: '構築しているもの',
      intro:
        '自分のプロダクト、オープンソースツール、HFT インフラの研究全般。',
      categories: {
        Trading: 'トレーディング',
        AI: 'AI',
        'Pet Projects': '個人プロジェクト',
        'Contract & Freelance': '契約・フリーランス',
        Graveyard: 'グレイブヤード',
        Publications: '出版物',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          'Zig 製の高性能メッセージングシステム — Aeron の競合。目標: IPC RTT <100ns、50M+ msg/sec。',
        'trading-ipc-bench':
          'アルゴリズム取引向け IPC ベンチマーク: 共有メモリ、Unix sockets、NNG、ZeroMQ、gRPC、Aeron — p50/p95/p99 レイテンシ。',
        'bingx-leverages':
          'BingX のレバレッジティア API をリバースエンジニアリングする Python ライブラリ。',
        'StockAPIs.com':
          '100+ 取引所からの暗号通貨マーケットデータ、レイテンシ <100ms。ポートフォリオ管理と自律取引のための AI エージェント。',
        'Profitmaker.cc':
          'セルフホスティング可能なオープンソース取引ターミナル（フロントエンド + バックエンド）、モジュールで拡張可能。',
        Trender:
          'Optuna による遺伝的最適化を備えた高性能 tick-sim バックテストエンジン。1 秒ドリルダウン、分散クラスタ（50+ スレッド）、22+ 種類のローソク足構築方法。',
        PolyTracker:
          'コピートレード、インサイダー検知、アービトラージスキャナを備えた Polymarket アナリティクス。',
        'Avellaneda-Stoikov':
          'Avellaneda-Stoikov 型 HFT マーケットメイキングモデルの実装。複数バージョンと TigerBeetle 連携を含みます。',
        Frontrunner:
          'Bybit HFT bot — L1/L50 板分析、適応的偏差削減、ホットコネクションウォーミング。注文発行 3-7ms。',
        'simple-fast-fix-scalper':
          'C++ 製の高性能 FIX プロトコル・スキャルパー。',
        'vector-arbitrage':
          '暗号通貨取引所向けの C++ ベクトルアービトラージシステム。',
        'solana-arbitrage': 'Rust で書かれた Solana 向けアービトラージ bot。',
        'Listing Monitor':
          'Upbit/Bithumb の上場向けイベント駆動モニタ。gRPC 経由で Telegram から 100ms 未満でシグナルを抽出。Rust と Zig で最適化。',
        'Binance Listing Rocket': 'Binance の上場イベントでの自動売買。',
        'Calculate Listing Profit':
          '上場イベント前後のトレードデータをダウンロードし、ローソク足を構築して詳細な収益シナリオ分析を提供します。',
        'Markowitz Portfolio':
          '暗号通貨ポートフォリオ向けの実践的 Modern Portfolio Theory — 平均-分散最適化、efficient frontier。',
        copytrader: '暗号通貨取引所向けのコピートレードプラットフォーム。',
        'Pair Arbitrage (Binance)':
          'Binance の spot/futures ペアアービトラージ — 相関ダイバージェンス検知のための指標、シグナル、bot。',
        'deep-profitmaker':
          'Deep.Foundation を用いた擬グラフベースの取引アーキテクチャ。',
        'Tinkoff ETF Balancer Bot':
          'Tinkoff Invest API 経由で ETF ポートフォリオを自動リバランスするオープンソース bot。',
        'candle-trade-visualizer':
          'トレーディングデータ向けの OHLCV ローソク足ビジュアライザ。',
        'benchmarks-trading':
          'コネクションウォーミング後の取引所間注文発行レイテンシのベンチマーク — ping、keep-alive、p50/p95/p99。',
        'market-manipulator-detection':
          '市場操作パターンを検知する Rust ライブラリ。',
        candle_aggregator_benchmark:
          'Rust 製の OHLCV ローソク足アグリゲータ、バッチアグリゲータ、ジェネレータとベンチマーク。',
        'hyperliquid-c': 'Hyperliquid 取引所 API の C アダプタ/SDK。',
        aicommit:
          'OpenRouter 経由で AI がコミットメッセージを生成する Rust CLI。105 リリース、VS Code 拡張、jail/blacklist フェイルオーバー。',
        SDKRouter:
          '300+ AI モデルを統一する OpenAI 互換 Python SDK。Pydantic 構造化出力とコストトラッキング。',
        DjangoCFG:
          'Pydantic AI エージェント、MCP サーバー、gRPC、WebSocket、ベクトル検索、暗号通貨決済を備えたオープンソース Django フレームワーク。',
        OpenScreenshot:
          'LLM コンテキスト向け macOS スクリーンショットツール。画面領域をキャプチャし、トークン節約のため自動ダウンスケール、PNG を直接クリップボードへ送信。',
        'cmdop-claude':
          'Python パッケージ — Cmdop の Claude 連携、PyPI 経由でのリモート AI エージェント管理。',
        'local-llm-proxy':
          'MCP サーバー — Claude Code 用ローカル LLM プロキシ、クラウドモデルへの自動フォールバック付き。',
        'Open Agent Manager':
          '並列 AI コーディングエージェントセッションのためのデスクトップターミナル。プロジェクトサイドバー、本物の PTY ターミナル、プロンプトキュー。ローカル、SSH、または CMDOP 接続。',
        Hlider:
          'klava.org による Android/iOS 用オンスクリーンキーボード。パートナープロジェクト。',
        'karabiner-visualizer':
          'Karabiner-Elements 設定のウェブビジュアライザー — macOS のキーボード再マッピングをインタラクティブなレイアウトで確認。',
        MacChill:
          'Apple Silicon M1–M4 の熱圧力を監視し、低電力モードを自動切り替えする macOS メニューバーアプリ。',
        Sanctum:
          'AES-256-GCM で暗号化されたファイルボルトのための VSCode ライクなデスクトップエディタ。',
        OpenLastPass:
          'オープンソースのパスワードマネージャ — Rust/Axum バックエンド、React+TS フロントエンド、Tauri デスクトップ、React Native モバイル、Argon2id/AES-256-GCM。',
        Vasya:
          'The Telegram Client for Deep Focus — ミニマルな Telegram クライアント（TypeScript + Rust バックエンド）。',
        macpurge: '開発者向け macOS ディスククリーナーユーティリティ。',
        'deadline-in-days': '残日数を表示する締め切りカウントダウンアプリ。',
        'Deep.foundation & Deep.memo':
          'オープンソーススタートアップ。フルスタック開発: 擬グラフ DB、イベント駆動アーキテクチャ、DevOps（Swarm、ArgoCD、Kubernetes、Terraform）。2022–現在。',
        'Dolphin.bi':
          'オープンソース暗号通貨アナリティクスマーケットプレイス。センチメント分析、ICO ファンダメンタル分析。Startupbootcamp を通過。2017–2018。',
        Shakeapp:
          'C2C/C2B シェアリングプラットフォーム（自動車・住宅レンタル）。React 開発者。2020–2022。',
        'centrum-air.com':
          'ウズベキスタンの民間航空会社のウェブサイト。2023。',
        'Kupi.network':
          '130+ の暗号通貨取引所に対応するオープンソースの暗号通貨取引ターミナル。2 バージョン: React（クラスベース）と Vue 2。2018–2019。',
        'Kupi.ru': 'マーケットプレイス。FRII アクセラレーションを通過。2013。',
        'Kupi.net': 'ウェブサイトビルダーのスタートアップ。パートナー。2019–2020。',
        DeepChain: 'Cosmos SDK 上のブロックチェーン。2024。',
        'Dolphin.bi (graveyard)':
          'オープンソース暗号通貨アナリティクスマーケットプレイス。センチメント分析、ICO ファンダメンタル分析、ICOFaces。ICO（失敗）。Startupbootcamp を通過。2017–2018。',
        'Bursa.dex':
          'オープンソースの分散型取引所。Solidity スマートコントラクト、Web3.js、板キャッシュ。Waves による BlockchainHack で優勝。2017。',
        'de-core.net':
          'ウェブ開発スタジオ。1 人のフリーランスから始まり、3-7 人のチームに成長。~200 サイト構築。2010–2016。',
        Thermom:
          'スタートアップのパートナー。モバイルアプリのフロントエンド。Bayer アクセラレーションを通過。2016。',
        'The Algotrading Book':
          'アルゴリズム取引に関するオンライン書籍 — 戦略、バックテスト、インフラ、実践ガイド。',
        'Mathematics for Trading':
          'トレーダー向けのオープンソース数学書 — アルゴ取引や定量分析に必要な統計、線形代数、最適化、確率微積分の基礎。',
        'Blog on Marketmaker.cc':
          'バックテスト方法論、QuestDB アナリティクス、Monte Carlo bootstrap、異常検知、損益の非対称性などに関する記事。',
      },
    },
    communities: {
      eyebrow: '06. コミュニティ',
      heading: 'マイコミュニティ',
      items: {
        klavaorg: { name: 'klava.org', desc: 'klava.org のメインコミュニティグループ。' },
        klavaorgwork: { name: 'キーボード：人間工学とレイアウト', desc: 'エルゴノミクスキーボードとキーボードレイアウト設計についてのチャット。' },
      },
    },
    contact: {
      eyebrow: '07. 連絡先',
      heading: 'お問い合わせ',
      intro:
        '面白いプロジェクトやコラボレーション、トレーディング・HFT・AI ツールに関する雑談、いつでも歓迎します。',
    },
  },

  ar: {
    hero: {
      badge: 'CEO @ Marketmaker.cc | CTO @ Cmdop.com',
      tagline: 'Fullstack · DevOps · مطوّر تداول خوارزمي',
      description:
        'أبني منصات للتداول الخوارزمي وبنية تحتية لـ HFT وأدوات للمطورين مدعومة بالذكاء الاصطناعي. أتداول منذ 2011.',
      cta_projects: 'عرض المشاريع',
      cta_contact: 'تواصل معي',
      stat_dev: 'سنوات في التطوير',
      stat_trading: 'سنوات في التداول',
      stat_stars: 'نجوم GitHub',
      stat_repos: 'مستودعات GitHub',
    },
    about: {
      eyebrow: '01. عنّي',
      heading: 'من أنا',
      p1_prefix: 'أنا الرئيس التنفيذي لـ ',
      p1_marketmaker_suffix: ' (منصة تداول خوارزمي) والمدير التقني لـ ',
      p1_cmdop_suffix: '.',
      p2_prefix: 'أهتمّ بالعملات الرقمية وأسواق الأسهم منذ عام ',
      p2_year: '2011',
      p2_suffix:
        '. بدأت بالتداول اليدوي، ثم أتمتت كل شيء تدريجياً، وأركّز الآن على بناء بنية HFT ومنصّات التداول الخوارزمي.',
      p3_prefix: 'مطوّر full-stack بخبرة عميقة في ',
      p3_langs: 'TypeScript/JavaScript, Python, Go',
      p3_suffix: '. مقيم في موسكو.',
      focus_eyebrow: 'التركيز الحالي',
      focus: [
        {
          icon: '⚡',
          title: 'بنية HFT التحتية',
          desc: 'أبني ZigBolt — نظام مراسلة مبني على Zig يستهدف زمن IPC <100ns و50M+ msg/sec',
        },
        {
          icon: '📊',
          title: 'التداول الخوارزمي',
          desc: 'Marketmaker.cc — طرفية scalping ومحرّك backtesting لاستراتيجيات متعددة الأطر الزمنية',
        },
        {
          icon: '🤖',
          title: 'أدوات الذكاء الاصطناعي',
          desc: 'SDKRouter لأكثر من 300 نموذج ذكاء اصطناعي، DjangoCFG مع وكلاء Pydantic AI، وإدارة عن بُعد عبر Cmdop',
        },
        {
          icon: '📡',
          title: 'بيانات السوق',
          desc: 'StockAPIs.com — بيانات سوق العملات الرقمية من أكثر من 100 بورصة بزمن <100ms',
        },
      ],
    },
    algotrading: {
      eyebrow: '02. التداول الخوارزمي',
      heading: 'Trading Engineering و HFT',
      intro:
        'خبرة عميقة في بناء أنظمة تنفيذ منخفضة الزمن، ومحرّكات backtesting عالية الدقة، ومراقبات إدراج آلية عبر عدة لغات برمجة.',
      sections: [
        {
          title: 'Backtesting',
          subtitle: 'Backtesting Engine',
          bullets: [
            'طوّرت <strong>محرّك tick-sim</strong> يطابق سلوك البوت الحيّ دقيقة بدقيقة، ممّا يُلغي الانحراف بين الاختبار والتشغيل الحقيقي.',
            'نفّذت <strong>تحسيناً جينياً</strong> باستخدام Optuna (TPE، CMA-ES) للبحث المتوازي عن المعلمات على 50+ thread.',
            'صمّمت عنقوداً حسابياً موزّعاً (3 عُقد) مع <strong>كاش in-memory</strong>، فسرّعت backtests بمعدل 26 ضعفاً.',
            'أضفت دعماً لـ 22 طريقة لبناء الشموع، منها <strong>Renko وRange وأشرطة Tick/Volume Imbalance</strong>.',
          ],
        },
        {
          title: 'الإدراجات',
          subtitle: 'Event-Driven Execution',
          bullets: [
            'بنيت <strong>مراقبات إدراج</strong> فائقة السرعة بـ Rust وZig لاكتشاف الأزواج الجديدة عبر API وكشف market-diff.',
            'طوّرت خطوط تنفيذ event-driven منخفضة الزمن للتداول الآلي على الأحداث العالية التقلّب.',
          ],
        },
        {
          title: 'HFT',
          subtitle: 'High-Frequency Trading',
          bullets: [
            '<strong>خوارزميات Frontrunning:</strong> طوّرت محلّلات orderbook منخفضة الزمن تعالج تدفّقات L1 (10ms) وL50 (20ms) في الوقت نفسه لمطاردة أوامر المتلاعبين عبر تقليل الانحراف التكيّفي.',
            '<strong>Market Making وScalping:</strong> نفّذت نماذج مثل Avellaneda-Stoikov وscalpers عالية الأداء على بروتوكول FIX.',
            '<strong>تحسين التنفيذ:</strong> حسّنت مسارات التنفيذ باستخدام <strong>fasthttp</strong> ومحوّلات gRPC مخصّصة، محقّقاً وضع أوامر في 3-7ms.',
          ],
        },
        {
          title: 'Arbitrage Systems',
          subtitle: 'Multi-Market Exploitation',
          bullets: [
            '<strong>أربتراج بين البورصات وأربتراج الأزواج:</strong> اتصلت بأكثر من 30 بورصة. بنيت أربتراج spot/futures بنهج تباعد ارتباط من مرحلتين وإدارة متقدّمة لأوامر الحد.',
            '<strong>Kimchi Premium:</strong> طوّرت منصّة مراقبة وتداول فورية للبورصات الكورية (Upbit) باستخدام backend بـ Go ولوحة Next.js.',
            '<strong>أسواق التنبّؤ:</strong> بنيت بوتات Polymarket للأربتراج وcopy-trading، تستغل عدم الكفاءة المدفوع بالأحداث.',
            '<strong>الأربتراج الإحصائي:</strong> بحثت ونفّذت نماذج stat-arb على pseudographs (بما في ذلك خوارزمية Bellman-Ford).',
          ],
        },
        {
          title: 'تحسين المحفظة',
          subtitle: 'Quantitative Modeling',
          bullets: [
            '<strong>Hierarchical Risk Parity (HRP):</strong> نفّذت HRP باستخدام التجميع الهرمي (dendrograms) ومصفوفات التغاير لتوزيع المخاطر بشكل أمثل.',
            '<strong>إدارة المخاطر:</strong> دمجت تصحيح Hull-White CVaR لقياس العوائد وفق التقلّب الحالي، مع تحويل ديناميكي للأصول الخطرة إلى نقد.',
            '<strong>Modern Portfolio Theory:</strong> طبّقت تحسين mean-variance ونمذجة efficient frontier على محافظ العملات الرقمية.',
            '<strong>موازنات تلقائية:</strong> بنيت بوت موازنة ETF إنتاجي على Tinkoff لإعادة موازنة المحفظة آلياً وفق قواعد محدّدة.',
          ],
        },
      ],
    },
    tech: {
      eyebrow: '03. التقنيات',
      heading: 'التقنيات التي أستخدمها',
      categories: {
        Languages: 'اللغات',
        'Languages (basics)': 'اللغات (أساسية)',
        Databases: 'قواعد البيانات',
        'API & Protocols': 'API والبروتوكولات',
        Frontend: 'الواجهة الأمامية',
        'Cross-platform': 'متعدد المنصّات',
        'Exchange APIs': 'واجهات البورصات',
        'DevOps & Infra': 'DevOps والبنية التحتية',
      },
    },
    frontier: {
      eyebrow: '04. المشاريع الرائدة',
      heading: 'حيث أقود',
      intro: 'شركتان أحمل فيهما أدواراً قيادية تأسيسية.',
      status_active: 'active',
      roles: {
        'Marketmaker.cc': 'CEO',
        'Cmdop.com': 'CTO',
      },
      descs: {
        'Marketmaker.cc':
          'منصّة تداول خوارزمي وطرفية scalping. 60+ بورصة عملات رقمية، بيانات فورية، ومحرّك backtesting.',
        'Cmdop.com':
          'إدارة الخوادم عن بُعد عبر وكلاء AI. بوتات Telegram/Discord/Slack، أتمتة المتصفح، وسوق للمهارات.',
      },
    },
    projects: {
      eyebrow: '05. المشاريع',
      heading: 'ما أبنيه',
      intro:
        'منتجاتي الخاصة، أدوات مفتوحة المصدر، وأبحاث بنية HFT التحتية.',
      categories: {
        Trading: 'التداول',
        AI: 'AI',
        'Pet Projects': 'مشاريع شخصية',
        'Contract & Freelance': 'العقود والعمل الحر',
        Graveyard: 'مقبرة المشاريع',
        Publications: 'المنشورات',
      },
      status: {
        active: 'active',
        wip: 'wip',
        concept: 'concept',
        paused: 'paused',
        left: 'left',
        rip: 'rip',
      },
      descs: {
        ZigBolt:
          'نظام مراسلة عالي الأداء بـ Zig — منافس لـ Aeron. الهدف: IPC RTT <100ns و50M+ msg/sec.',
        'trading-ipc-bench':
          'قياسات أداء IPC للتداول الخوارزمي: shared memory وUnix sockets وNNG وZeroMQ وgRPC وAeron — زمن p50/p95/p99.',
        'bingx-leverages':
          'مكتبة Python لعكس هندسة API مستويات الرافعة في BingX.',
        'StockAPIs.com':
          'بيانات سوق العملات الرقمية من أكثر من 100 بورصة بزمن <100ms. وكلاء AI لإدارة المحافظ والتداول الذاتي.',
        'Profitmaker.cc':
          'طرفية تداول مفتوحة المصدر (frontend + backend) قابلة للاستضافة الذاتية وللتوسعة بالموديولات.',
        Trender:
          'محرّك backtesting tick-sim عالي الأداء مع تحسين جيني (Optuna). يدعم drill-down ثانية واحدة، عنقود موزّع (50+ thread)، وأكثر من 22 طريقة لبناء الشموع.',
        PolyTracker:
          'تحليلات Polymarket مع copy-trading، كشف داخلين، وماسح أربتراج.',
        'Avellaneda-Stoikov':
          'تنفيذ نموذج Avellaneda-Stoikov لصناعة السوق في HFT. يشمل عدة إصدارات وتكامل مع TigerBeetle.',
        Frontrunner:
          'بوت HFT لـ Bybit — تحليل orderbook L1/L50، تقليل انحراف تكيّفي، وتسخين اتصالات. وضع أوامر في 3-7ms.',
        'simple-fast-fix-scalper':
          'Scalper عالي الأداء لبروتوكول FIX بـ C++.',
        'vector-arbitrage':
          'نظام أربتراج متّجهي بـ C++ لبورصات العملات الرقمية.',
        'solana-arbitrage': 'بوت أربتراج لـ Solana بـ Rust.',
        'Listing Monitor':
          'مراقبات event-driven لإدراجات Upbit/Bithumb. استخراج إشارات من Telegram عبر gRPC في أقل من 100ms. مُحسّن بـ Rust وZig.',
        'Binance Listing Rocket':
          'تداول آلي على أحداث إدراجات Binance.',
        'Calculate Listing Profit':
          'يحمّل بيانات التداول حول أحداث الإدراج، ويبني بيانات شموع، ويقدّم تحليلاً مفصّلاً لسيناريوهات الربح.',
        'Markowitz Portfolio':
          'Modern Portfolio Theory عملي لمحافظ العملات الرقمية — تحسين mean-variance، وefficient frontier.',
        copytrader: 'منصّة copy trading لبورصات العملات الرقمية.',
        'Pair Arbitrage (Binance)':
          'أربتراج أزواج spot/futures على Binance — مقاييس وإشارات وبوتات لاكتشاف تباعد الارتباط.',
        'deep-profitmaker':
          'بنية تداول على pseudographs باستخدام Deep.Foundation.',
        'Tinkoff ETF Balancer Bot':
          'بوت مفتوح المصدر لإعادة موازنة محفظة ETF آلياً عبر Tinkoff Invest API.',
        'candle-trade-visualizer':
          'عارض شموع OHLCV لبيانات التداول.',
        'benchmarks-trading':
          'قياسات أداء لزمن وضع الأوامر عبر البورصات بعد تسخين الاتصال — ping وkeep-alive وp50/p95/p99.',
        'market-manipulator-detection':
          'مكتبة Rust لكشف أنماط التلاعب بالسوق.',
        candle_aggregator_benchmark:
          'مجمّع شموع OHLCV بـ Rust، مجمّع دفعات، ومولّد مع قياسات أداء.',
        'hyperliquid-c': 'محوّل/SDK بـ C لـ API بورصة Hyperliquid.',
        aicommit:
          'أداة CLI بـ Rust لتوليد رسائل commit بالذكاء الاصطناعي عبر OpenRouter. 105 إصدارات، امتداد لـ VS Code، وآلية jail/blacklist.',
        SDKRouter:
          'SDK موحّد بـ Python متوافق مع OpenAI لأكثر من 300 نموذج AI، مع إخراج Pydantic منظّم وتتبّع للتكاليف.',
        DjangoCFG:
          'إطار عمل Django مفتوح المصدر مع وكلاء Pydantic AI، خادم MCP، gRPC، WebSocket، بحث متّجهي، ومدفوعات بالعملات الرقمية.',
        OpenScreenshot:
          'أداة لقطات شاشة على macOS لسياق LLM. تلتقط مناطق الشاشة، تصغّر تلقائياً لتوفير tokens، وترسل PNG مباشرة إلى الحافظة.',
        'cmdop-claude':
          'حزمة Python — تكامل Claude لـ Cmdop، إدارة وكلاء AI عن بُعد عبر PyPI.',
        'local-llm-proxy':
          'خادم MCP — وكيل LLM محلي لـ Claude Code مع fallback تلقائي إلى نماذج السحابة.',
        'Open Agent Manager':
          'طرفية سطح مكتب لجلسات وكلاء AI برمجية متوازية. شريط جانبي للمشاريع، طرفية PTY حقيقية، طابور برومبتات. اتصالات محلية أو SSH أو CMDOP.',
        Hlider:
          'لوحة مفاتيح على الشاشة لـ Android/iOS من klava.org. مشروع شراكة.',
        'karabiner-visualizer':
          'أداة ويب لتصور إعدادات Karabiner-Elements — استعرض تعيينات لوحة مفاتيح macOS كتخطيط تفاعلي.',
        MacChill:
          'تطبيق menu bar على macOS لمراقبة الضغط الحراري وتبديل وضع الطاقة المنخفضة آلياً على Apple Silicon M1-M4.',
        Sanctum:
          'محرّر سطح مكتب بأسلوب VSCode لخزائن ملفات مشفّرة بـ AES-256-GCM.',
        OpenLastPass:
          'مدير كلمات مرور مفتوح المصدر — backend بـ Rust/Axum، frontend بـ React+TS، سطح مكتب Tauri، موبايل React Native، Argon2id/AES-256-GCM.',
        Vasya:
          'The Telegram Client for Deep Focus — عميل Telegram بسيط (TypeScript + backend بـ Rust).',
        macpurge: 'أداة تنظيف القرص على macOS موجّهة للمطوّرين.',
        'deadline-in-days': 'تطبيق عدّ تنازلي للمواعيد النهائية يعرض الأيام المتبقية.',
        'Deep.foundation & Deep.memo':
          'شركات ناشئة مفتوحة المصدر. تطوير full-stack: قاعدة pseudo-graph، بنية event-driven، DevOps (Swarm، ArgoCD، Kubernetes، Terraform). 2022–حتى الآن.',
        'Dolphin.bi':
          'سوق تحليلات عملات رقمية مفتوح المصدر. تحليل المشاعر وتحليل أساسي لـ ICO. اجتاز Startupbootcamp. 2017–2018.',
        Shakeapp:
          'منصّة مشاركة C2C/C2B (تأجير سيارات ومنازل). مطوّر React. 2020–2022.',
        'centrum-air.com':
          'موقع لشركة طيران خاصة في أوزبكستان. 2023.',
        'Kupi.network':
          'طرفية تداول عملات رقمية مفتوحة المصدر تدعم 130+ بورصة. نسختان: React (class-based) وVue 2. 2018–2019.',
        'Kupi.ru': 'سوق إلكتروني. اجتاز تسريع FRII. 2013.',
        'Kupi.net': 'شركة ناشئة لبناء المواقع. شريك. 2019–2020.',
        DeepChain: 'بلوكتشين على Cosmos SDK. 2024.',
        'Dolphin.bi (graveyard)':
          'سوق تحليلات عملات رقمية مفتوح المصدر. تحليل المشاعر، تحليل أساسي لـ ICO، ICOFaces. ICO (غير ناجح). اجتاز Startupbootcamp. 2017–2018.',
        'Bursa.dex':
          'بورصة لامركزية مفتوحة المصدر. عقد ذكي بـ Solidity، Web3.js، تخزين مؤقت للـ orderbook. فاز بـ BlockchainHack من Waves. 2017.',
        'de-core.net':
          'استوديو لتطوير الويب. بدأ كعمل حر فردي، ونما إلى فريق من 3–7 مطوّرين. تم بناء ~200 موقع. 2010–2016.',
        Thermom:
          'شريك في شركة ناشئة. واجهة أمامية لتطبيق موبايل. اجتاز تسريع Bayer. 2016.',
        'The Algotrading Book':
          'كتاب إلكتروني عن التداول الخوارزمي — استراتيجيات، backtesting، بنية تحتية، وأدلّة عملية.',
        'Mathematics for Trading':
          'كتاب مفتوح المصدر في الرياضيات للمتداولين — الإحصاء، الجبر الخطي، التحسين، وحساب التفاضل العشوائي اللازم للتداول الخوارزمي والتحليل الكمي.',
        'Blog on Marketmaker.cc':
          'مقالات عن منهجية backtesting، تحليلات QuestDB، Monte Carlo bootstrap، كشف الشذوذ، عدم تناظر الربح/الخسارة، وغيرها.',
      },
    },
    communities: {
      eyebrow: '06. المجتمعات',
      heading: 'مجتمعاتي',
      items: {
        klavaorg: { name: 'klava.org', desc: 'مجموعة مجتمع klava.org الرئيسية.' },
        klavaorgwork: { name: 'لوحات المفاتيح: الإرغونومية والتخطيطات', desc: 'دردشة حول تصميم لوحات المفاتيح الإرغونومية وتخطيطاتها.' },
      },
    },
    contact: {
      eyebrow: '07. اتصل',
      heading: 'تواصل معي',
      intro:
        'منفتح على المشاريع المثيرة، أو التعاون، أو مجرّد دردشة عن التداول وHFT وأدوات الذكاء الاصطناعي.',
    },
  },
} as const;

export function getHome(locale: Locale) {
  return home[locale] ?? home.en;
}
