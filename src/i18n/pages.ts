import { defaultLocale, type Locale } from './config';

/**
 * Copy for the /algotrading and /projects pages and for the two home sections
 * that point to them. Section data (projects, cases) lives elsewhere:
 * src/data/projects.ts and src/i18n/home.ts.
 *
 * Stat labels are headings above a number, never a phrase with it, so no
 * locale needs plural forms.
 */
interface PagesCopy {
  featured: { intro: string; all: string; allNote: string };
  algoTeaser: { more: string; note: string };
  algo: {
    meta: { title: string; description: string };
    kicker: string;
    title: [string, string];
    intro: string;
    stats: { products: string; projects: string; cases: string };
    casesKicker: string;
    ecosystem: { kicker: string; heading: string; intro: string };
    side: { kicker: string; heading: string; intro: string };
  };
  projects: {
    meta: { title: string; description: string };
    kicker: string;
    title: [string, string];
    intro: string;
    stats: { projects: string; groups: string; active: string };
  };
}

const pages: Record<Locale, PagesCopy> = {
  en: {
    featured: {
      intro: 'The products I build and run today. Small tools, client work and closed projects are in the full archive.',
      all: 'All projects',
      allNote: 'small tools, client work, packages',
    },
    algoTeaser: { more: 'Algotrading in detail', note: 'every marketmaker.cc product and the smaller trading tools' },
    algo: {
      meta: {
        title: 'Algotrading: HFT, market data and marketmaker.cc — Eugen Soloviov',
        description: 'HFT engines, market data, research and trading products: every marketmaker.cc product and the smaller trading tools around it.',
      },
      kicker: 'algotrading',
      title: ['Trading', 'systems'],
      intro: 'HFT engines, market data, research and trading products. Everything marketmaker.cc runs, plus the smaller tools around it.',
      stats: { products: 'marketmaker.cc products', projects: 'other trading projects', cases: 'engineering areas' },
      casesKicker: '01 · engineering',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'The marketmaker.cc ecosystem',
        intro: 'Terminals, data warehouses, benchmarks and research. One company and one set of tools for traders and trading teams.',
      },
      side: {
        kicker: '03 · side projects',
        heading: 'Smaller trading projects',
        intro: 'Bots, parsers, research tools and the books on algorithmic trading.',
      },
    },
    projects: {
      meta: {
        title: 'Projects: products, tools and client work — Eugen Soloviov',
        description: 'Everything I have built: my own products, hired work, partnerships, experiments, closed projects and published packages.',
      },
      kicker: 'projects',
      title: ['All', 'projects'],
      intro: 'Everything I have built: my own products, hired work, partnerships, experiments and closed projects.',
      stats: { projects: 'projects', groups: 'groups', active: 'active now' },
    },
  },
  ru: {
    featured: {
      intro: 'Продукты, которые я сейчас делаю и веду. Небольшие инструменты, заказные и закрытые проекты есть в полном архиве.',
      all: 'Все проекты',
      allNote: 'инструменты, заказы, пакеты',
    },
    algoTeaser: { more: 'Подробнее об алготрейдинге', note: 'все продукты marketmaker.cc и небольшие торговые инструменты' },
    algo: {
      meta: {
        title: 'Алготрейдинг: HFT, рыночные данные и marketmaker.cc — Евгений Соловьев',
        description: 'HFT-движки, рыночные данные, исследования и торговые продукты: все продукты marketmaker.cc и небольшие торговые инструменты вокруг.',
      },
      kicker: 'алготрейдинг',
      title: ['Торговые', 'системы'],
      intro: 'HFT-движки, рыночные данные, исследования и торговые продукты. Все, что делает marketmaker.cc, и небольшие инструменты вокруг.',
      stats: { products: 'продукты marketmaker.cc', projects: 'другие торговые проекты', cases: 'направления' },
      casesKicker: '01 · инженерия',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'Экосистема marketmaker.cc',
        intro: 'Терминалы, хранилища данных, бенчмарки и исследования. Одна компания и один набор инструментов для трейдеров и торговых команд.',
      },
      side: {
        kicker: '03 · другие проекты',
        heading: 'Небольшие торговые проекты',
        intro: 'Боты, парсеры, исследовательские инструменты и книги по алготрейдингу.',
      },
    },
    projects: {
      meta: {
        title: 'Проекты: продукты, инструменты и заказы — Евгений Соловьев',
        description: 'Все, что я сделал: свои продукты, работа по найму, партнерства, эксперименты, закрытые проекты и опубликованные пакеты.',
      },
      kicker: 'проекты',
      title: ['Все', 'проекты'],
      intro: 'Все, что я сделал: свои продукты, работа по найму, партнерства, эксперименты и закрытые проекты.',
      stats: { projects: 'проекты', groups: 'группы', active: 'активные' },
    },
  },
  zh: {
    featured: {
      intro: '我目前在构建和运营的产品。小工具、外包项目和已关闭的项目都在完整档案里。',
      all: '全部项目',
      allNote: '小工具、外包、软件包',
    },
    algoTeaser: { more: '查看量化交易详情', note: 'marketmaker.cc 的全部产品与小型交易工具' },
    algo: {
      meta: {
        title: '量化交易：HFT、市场数据与 marketmaker.cc — Eugen Soloviov',
        description: 'HFT 引擎、市场数据、研究和交易产品：marketmaker.cc 的全部产品，以及周边的小型交易工具。',
      },
      kicker: '量化交易',
      title: ['交易', '系统'],
      intro: 'HFT 引擎、市场数据、研究和交易产品。marketmaker.cc 的全部产品，以及周边的小工具。',
      stats: { products: 'marketmaker.cc 产品', projects: '其他交易项目', cases: '工程方向' },
      casesKicker: '01 · 工程',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'marketmaker.cc 生态',
        intro: '终端、数据仓库、基准测试和研究。一家公司，一套面向交易者和交易团队的工具。',
      },
      side: {
        kicker: '03 · 其他项目',
        heading: '小型交易项目',
        intro: '机器人、解析器、研究工具，以及关于算法交易的书。',
      },
    },
    projects: {
      meta: {
        title: '项目：产品、工具与外包 — Eugen Soloviov',
        description: '我做过的一切：自有产品、受雇工作、合作项目、实验、已关闭的项目和已发布的软件包。',
      },
      kicker: '项目',
      title: ['全部', '项目'],
      intro: '我做过的一切：自有产品、受雇工作、合作项目、实验和已关闭的项目。',
      stats: { projects: '项目', groups: '分组', active: '活跃' },
    },
  },
  ko: {
    featured: {
      intro: '지금 만들고 운영하는 제품입니다. 작은 도구, 외주 작업, 종료된 프로젝트는 전체 아카이브에 있습니다.',
      all: '전체 프로젝트',
      allNote: '작은 도구, 외주, 패키지',
    },
    algoTeaser: { more: '알고트레이딩 자세히 보기', note: 'marketmaker.cc 전체 제품과 작은 트레이딩 도구' },
    algo: {
      meta: {
        title: '알고트레이딩: HFT, 시장 데이터, marketmaker.cc — Eugen Soloviov',
        description: 'HFT 엔진, 시장 데이터, 리서치, 트레이딩 제품: marketmaker.cc의 모든 제품과 그 주변의 작은 트레이딩 도구.',
      },
      kicker: '알고트레이딩',
      title: ['트레이딩', '시스템'],
      intro: 'HFT 엔진, 시장 데이터, 리서치, 트레이딩 제품. marketmaker.cc의 모든 제품과 그 주변의 작은 도구들.',
      stats: { products: 'marketmaker.cc 제품', projects: '기타 트레이딩 프로젝트', cases: '엔지니어링 분야' },
      casesKicker: '01 · 엔지니어링',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'marketmaker.cc 생태계',
        intro: '터미널, 데이터 웨어하우스, 벤치마크, 리서치. 하나의 회사, 트레이더와 트레이딩 팀을 위한 하나의 도구 세트.',
      },
      side: {
        kicker: '03 · 기타 프로젝트',
        heading: '작은 트레이딩 프로젝트',
        intro: '봇, 파서, 리서치 도구, 알고리즘 트레이딩 책.',
      },
    },
    projects: {
      meta: {
        title: '프로젝트: 제품, 도구, 외주 작업 — Eugen Soloviov',
        description: '제가 만든 모든 것: 개인 제품, 고용된 작업, 파트너십, 실험, 종료된 프로젝트, 배포한 패키지.',
      },
      kicker: '프로젝트',
      title: ['전체', '프로젝트'],
      intro: '제가 만든 모든 것: 개인 제품, 고용된 작업, 파트너십, 실험, 종료된 프로젝트.',
      stats: { projects: '프로젝트', groups: '그룹', active: '진행 중' },
    },
  },
  ja: {
    featured: {
      intro: 'いま作って運営しているプロダクト。小さなツール、受託案件、終了したプロジェクトは全アーカイブにあります。',
      all: 'すべてのプロジェクト',
      allNote: '小さなツール、受託、パッケージ',
    },
    algoTeaser: { more: 'アルゴトレーディングの詳細', note: 'marketmaker.cc の全プロダクトと小さなトレーディングツール' },
    algo: {
      meta: {
        title: 'アルゴトレーディング：HFT、市場データ、marketmaker.cc — Eugen Soloviov',
        description: 'HFT エンジン、市場データ、リサーチ、トレーディング製品：marketmaker.cc のすべてのプロダクトと周辺の小さなツール。',
      },
      kicker: 'アルゴトレーディング',
      title: ['トレーディング', 'システム'],
      intro: 'HFT エンジン、市場データ、リサーチ、トレーディング製品。marketmaker.cc のすべてのプロダクトと、その周辺の小さなツール。',
      stats: { products: 'marketmaker.cc プロダクト', projects: 'その他のトレーディング案件', cases: 'エンジニアリング領域' },
      casesKicker: '01 · エンジニアリング',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'marketmaker.cc エコシステム',
        intro: 'ターミナル、データ倉庫、ベンチマーク、リサーチ。ひとつの会社と、トレーダーとトレーディングチームのためのひとそろいのツール。',
      },
      side: {
        kicker: '03 · その他',
        heading: '小さなトレーディングプロジェクト',
        intro: 'ボット、パーサー、リサーチツール、アルゴリズム取引の本。',
      },
    },
    projects: {
      meta: {
        title: 'プロジェクト：プロダクト、ツール、受託 — Eugen Soloviov',
        description: 'これまでに作ったすべて：自分のプロダクト、雇用での仕事、パートナーシップ、実験、終了したプロジェクト、公開パッケージ。',
      },
      kicker: 'プロジェクト',
      title: ['すべての', 'プロジェクト'],
      intro: 'これまでに作ったすべて：自分のプロダクト、雇用での仕事、パートナーシップ、実験、終了したプロジェクト。',
      stats: { projects: 'プロジェクト', groups: 'グループ', active: '稼働中' },
    },
  },
  ar: {
    featured: {
      intro: 'المنتجات التي أبنيها وأديرها الآن. الأدوات الصغيرة وأعمال العملاء والمشاريع المغلقة موجودة في الأرشيف الكامل.',
      all: 'كل المشاريع',
      allNote: 'أدوات صغيرة، أعمال للعملاء، حزم',
    },
    algoTeaser: { more: 'التداول الخوارزمي بالتفصيل', note: 'كل منتجات marketmaker.cc وأدوات التداول الصغيرة' },
    algo: {
      meta: {
        title: 'التداول الخوارزمي: HFT وبيانات السوق وmarketmaker.cc — Eugen Soloviov',
        description: 'محركات HFT، وبيانات السوق، والأبحاث، ومنتجات التداول: كل منتجات marketmaker.cc والأدوات الصغيرة من حولها.',
      },
      kicker: 'التداول الخوارزمي',
      title: ['أنظمة', 'التداول'],
      intro: 'محركات HFT، وبيانات السوق، والأبحاث، ومنتجات التداول. كل ما تديره marketmaker.cc، والأدوات الصغيرة من حولها.',
      stats: { products: 'منتجات marketmaker.cc', projects: 'مشاريع تداول أخرى', cases: 'مجالات هندسية' },
      casesKicker: '01 · الهندسة',
      ecosystem: {
        kicker: '02 · marketmaker.cc',
        heading: 'منظومة marketmaker.cc',
        intro: 'طرفيات، ومستودعات بيانات، ومعايير أداء، وأبحاث. شركة واحدة ومجموعة أدوات واحدة للمتداولين وفرق التداول.',
      },
      side: {
        kicker: '03 · مشاريع أخرى',
        heading: 'مشاريع تداول صغيرة',
        intro: 'بوتات، ومحللات بيانات، وأدوات بحث، وكتب عن التداول الخوارزمي.',
      },
    },
    projects: {
      meta: {
        title: 'المشاريع: منتجات وأدوات وأعمال للعملاء — Eugen Soloviov',
        description: 'كل ما بنيته: منتجاتي الخاصة، والعمل بأجر، والشراكات، والتجارب، والمشاريع المغلقة، والحزم المنشورة.',
      },
      kicker: 'المشاريع',
      title: ['كل', 'المشاريع'],
      intro: 'كل ما بنيته: منتجاتي الخاصة، والعمل بأجر، والشراكات، والتجارب، والمشاريع المغلقة.',
      stats: { projects: 'المشاريع', groups: 'المجموعات', active: 'نشطة الآن' },
    },
  },
};

export const getPages = (locale: Locale = defaultLocale): PagesCopy => pages[locale] ?? pages[defaultLocale];
