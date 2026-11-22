import type { Locale } from './config';

/** Copy for the /production page: services, the work pipeline and pricing.
 *  Source of truth for offers and prices: https://production.suenot.com. */
export interface ProductionCopy {
  meta: { title: string; description: string };
  hero: { kicker: string; title: [string, string]; intro: string; cta: string; secondary: string };
  services: {
    kicker: string; heading: string; intro: string; termLabel: string; priceLabel: string; includedLabel: string;
    items: { name: string; desc: string; term: string; days: number; price: string; included: string[] }[];
  };
  pipeline: {
    kicker: string; heading: string; intro: string;
    phases: { name: string; steps: { title: string; text: string; chips?: { label: string; text: string }[] }[] }[];
  };
  pricing: {
    kicker: string; heading: string; intro: string; note: string; cta: string;
    plans: { name: string; price: string; unit: string; text: string; items: string[] }[];
  };
  contact: { heading: string; text: string; examples: string };
}

const en: ProductionCopy = {
  meta: {
    title: 'Production: AI video, websites and CRM — Eugen Soloviov',
    description: 'Reels, video editing, SMM, websites with booking, CRM and an AI agent for local business. Built and run by AI agents, reviewed by a person.',
  },
  hero: {
    kicker: 'Production · sites and video',
    title: ['Everything a business', 'needs online.'],
    intro: 'Viral Reels, edited video, social media, a website with online booking, a CRM and an AI agent that answers clients. I build it once, and AI agents run it every day.',
    cta: 'Discuss a project',
    secondary: 'See examples',
  },
  services: {
    kicker: 'Services',
    heading: 'The whole stack, one studio',
    intro: 'Take one service or the full loop. Each piece is automated, so it costs less and ships faster than a classic agency.',
    termLabel: 'First result',
    priceLabel: 'Price',
    includedLabel: 'Included',
    items: [
      { name: 'Reels and AI video', desc: 'Short vertical video for Instagram, TikTok, YouTube Shorts and Threads.', term: 'a few days', days: 3, price: 'from $10 / video',
        included: ['Seedance: cinematic AI footage from one product photo', 'Motion design built in code, exact brand graphics', 'Hooks, captions and a trending structure', 'Batches of 8 to 30 videos a month'] },
      { name: 'Video editing', desc: 'Your raw footage becomes finished video, long and short form from one source.', term: 'a few days', days: 3, price: 'on request',
        included: ['Cuts, silence removal, subtitles and sound mix', 'One long video turned into a dozen shorts', 'Reframing to 9:16, 1:1 and 16:9', 'Brand intro, outro and lower thirds'] },
      { name: 'SMM on autopilot', desc: 'A strategy, a content plan and daily publishing without you touching a schedule.', term: 'within a week', days: 7, price: 'on request',
        included: ['30-day plan from brand and competitor analysis', 'Posts, carousels, stories and captions per platform', 'Publishing to Instagram, TikTok, YouTube, Threads, Telegram', 'Monthly report on what brings clients'] },
      { name: 'Website and SEO', desc: 'A fast site with online booking, built for search and for AI answers.', term: 'within a week', days: 7, price: '$40 launch + 2 Reels',
        included: ['Landing or multi-page site in your brand', 'Online booking and payment page', 'Technical SEO, schema, local search and GEO', 'Languages and analytics set up'] },
      { name: 'CRM and booking', desc: 'Every lead and every visit in one place, with reminders that cut no-shows.', term: 'within a week', days: 7, price: 'on request',
        included: ['Leads from chats, calls and forms in one list', 'Calendar sync, team schedule, services', 'Reminders by email, SMS and messenger', 'Sales and booking dashboard'] },
      { name: 'AI agent for chats', desc: 'One assistant for Instagram, WhatsApp, Telegram and the chat on your site.', term: 'within a week', days: 7, price: 'on request',
        included: ['Answers from your real prices, hours and services', 'Books, moves and cancels visits in chat', 'Hands the dialog to a person when needed', 'Voice agent for phone calls on request'] },
    ],
  },
  pipeline: {
    kicker: 'Pipeline',
    heading: 'How a request becomes a running system',
    intro: 'Agents do the heavy work, a person answers for the result. Every request passes the same chain: first the question of what it brings the business, then whether it can run by itself, and only then production.',
    phases: [
      { name: 'Before production', steps: [
        { title: 'A request arrives', text: 'The first question is not what to draw. It is what this should bring the business: reach, trust, leads or bookings.' },
        { title: 'Agents read the business', text: 'Site, socials, prices, hours and competitors are collected into one brief. Nothing is invented: only facts the owner confirms.' },
        { title: 'Filter: can it run by itself?', text: 'Routine is set up once and never billed by the hour again. What remains is the work that needs a person.',
          chips: [{ label: 'Agent-run', text: 'Publishing, replies and reminders run on a schedule.' }, { label: 'Owner-run', text: 'The owner changes prices and hours, agents pick it up.' }, { label: 'One-off', text: 'Only creative work is made by hand.' }] },
        { title: 'Plan and fixed price', text: 'Scope, deadlines and price are written down before work starts. No hidden hours.' },
      ] },
      { name: 'Production', steps: [
        { title: 'Brand kit locked', text: 'Logo, fonts and colors are fixed once. Every agent uses them, so the product stays recognizable in every video.' },
        { title: 'Agents make drafts', text: 'AI footage, motion design in code, the site and the CRM are built in parallel, each by its own agent.' },
        { title: 'Automated checks', text: 'Agents check renders, captions, links, page speed and SEO markup before anyone looks at it.' },
        { title: 'Human review', text: 'A person reviews every batch before it goes out. The owner can approve anything first.' },
      ] },
      { name: 'After launch', steps: [
        { title: 'Publishing on schedule', text: 'A 30-day plan goes out to every platform on time, without manual posting.' },
        { title: 'The agent answers', text: 'Chats and the site get answers 24/7. Visits are booked straight into the calendar.' },
        { title: 'Leads land in the CRM', text: 'Every lead from chats, calls and forms is in one list, with reminders that cut no-shows.' },
        { title: 'Monthly report', text: 'What brought clients and what did not. The next month is planned from the numbers.' },
      ] },
    ],
  },
  pricing: {
    kicker: 'Pricing',
    heading: 'A fixed price or a share of results',
    intro: 'Launch prices in USD. Choose a set price, or pay only a percentage of what the content brings in.',
    note: 'Launch prices. Later the 4-Reel plan rises to $100 a month; plans bought now keep the launch price.',
    cta: 'Discuss terms',
    plans: [
      { name: 'Launch set', price: '$40', unit: 'once per business', text: 'A website and two Reels as a gift.', items: ['Website with online booking', '2 Reels included', 'Basic SEO setup'] },
      { name: 'Subscription', price: 'from $40', unit: 'per month', text: 'Short videos every month. Pick the volume.', items: ['4 Reels: $40', '8 Reels: $70', '15 Reels: $120', '30 Reels: $210'] },
      { name: 'Pay per result', price: '1–30%', unit: 'of revenue, or a fee per lead', text: 'No upfront fee. You pay for the leads we bring.', items: ['1% to 30% of revenue from attracted leads', 'Or a fixed rate for each lead', 'Terms written down before we start'] },
    ],
  },
  contact: {
    heading: 'Ready to try it?',
    text: 'Send a link to your site or Instagram. I reply with a plan and terms, with no obligation.',
    examples: 'Examples and cases on production.suenot.com',
  },
};

const ru: ProductionCopy = {
  meta: {
    title: 'Продакшн: AI-видео, сайты и CRM — Евгений Соловьев',
    description: 'Рилсы, монтаж, SMM, сайты с онлайн-записью, CRM и AI-агент для локального бизнеса. Делают и ведут AI-агенты, проверяет человек.',
  },
  hero: {
    kicker: 'Продакшн · сайты и видео',
    title: ['Все, что нужно', 'бизнесу в сети.'],
    intro: 'Вирусные рилсы, монтаж, соцсети, сайт с онлайн-записью, CRM и AI-агент, который отвечает клиентам. Я собираю систему один раз, а дальше ее каждый день ведут AI-агенты.',
    cta: 'Обсудить проект',
    secondary: 'Смотреть примеры',
  },
  services: {
    kicker: 'Услуги',
    heading: 'Весь набор в одной студии',
    intro: 'Можно взять одну услугу или весь цикл. Каждая часть автоматизирована, поэтому выходит дешевле и быстрее, чем в обычном агентстве.',
    termLabel: 'Первый результат',
    priceLabel: 'Цена',
    includedLabel: 'Что входит',
    items: [
      { name: 'Рилсы и AI-видео', desc: 'Короткие вертикальные ролики для Instagram, TikTok, YouTube Shorts и Threads.', term: 'за несколько дней', days: 3, price: 'от $10 за ролик',
        included: ['Seedance: кинематографичные AI-кадры из одного фото товара', 'Моушн-дизайн в коде, точная фирменная графика', 'Хуки, субтитры и трендовая структура', 'Пакеты от 8 до 30 роликов в месяц'] },
      { name: 'Монтаж видео', desc: 'Ваши исходники превращаются в готовые ролики, длинные и короткие из одного источника.', term: 'за несколько дней', days: 3, price: 'по запросу',
        included: ['Склейка, вырезание пауз, субтитры и звук', 'Из одного длинного видео десяток коротких', 'Кадрирование в 9:16, 1:1 и 16:9', 'Фирменные заставки и плашки'] },
      { name: 'SMM на автопилоте', desc: 'Стратегия, контент-план и ежедневные публикации без вашего участия.', term: 'за неделю', days: 7, price: 'по запросу',
        included: ['План на 30 дней по анализу бренда и конкурентов', 'Посты, карусели, сторис и подписи под каждую площадку', 'Публикация в Instagram, TikTok, YouTube, Threads, Telegram', 'Ежемесячный отчет о том, что приводит клиентов'] },
      { name: 'Сайт и SEO', desc: 'Быстрый сайт с онлайн-записью, сделанный под поиск и под ответы AI.', term: 'за неделю', days: 7, price: '$40 на старте + 2 рилса',
        included: ['Лендинг или многостраничный сайт в вашем стиле', 'Онлайн-запись и страница оплаты', 'Техническое SEO, разметка, локальный поиск и GEO', 'Языки и аналитика настроены'] },
      { name: 'CRM и запись', desc: 'Все заявки и визиты в одном месте, с напоминаниями, которые снижают неявки.', term: 'за неделю', days: 7, price: 'по запросу',
        included: ['Заявки из чатов, звонков и форм в одном списке', 'Синхронизация календаря, график команды, услуги', 'Напоминания по почте, SMS и в мессенджерах', 'Панель продаж и записей'] },
      { name: 'AI-агент для чатов', desc: 'Один помощник для Instagram, WhatsApp, Telegram и чата на сайте.', term: 'за неделю', days: 7, price: 'по запросу',
        included: ['Отвечает по вашим реальным ценам, часам и услугам', 'Записывает, переносит и отменяет визиты в чате', 'Передает диалог человеку, когда нужно', 'Голосовой агент для звонков по запросу'] },
    ],
  },
  pipeline: {
    kicker: 'Пайплайн',
    heading: 'Как заявка становится работающей системой',
    intro: 'Тяжелую работу делают агенты, за результат отвечает человек. Каждая заявка проходит одну и ту же цепочку: сначала вопрос, что она даст бизнесу, затем, может ли это работать само, и только потом производство.',
    phases: [
      { name: 'До производства', steps: [
        { title: 'Приходит заявка', text: 'Первый вопрос не о том, что нарисовать, а о том, что это должно дать бизнесу: охват, доверие, заявки или записи.' },
        { title: 'Агенты изучают бизнес', text: 'Сайт, соцсети, цены, часы работы и конкуренты собираются в один бриф. Ничего не выдумывается: только факты, которые подтвердил владелец.' },
        { title: 'Фильтр: может ли это работать само?', text: 'Рутина настраивается один раз и больше не оплачивается по часам. Остается только работа, которой нужен человек.',
          chips: [{ label: 'Ведет агент', text: 'Публикации, ответы и напоминания идут по расписанию.' }, { label: 'Ведет владелец', text: 'Владелец меняет цены и часы, агенты подхватывают.' }, { label: 'Разовая работа', text: 'Руками делается только творческая часть.' }] },
        { title: 'План и фиксированная цена', text: 'Объем, сроки и цена фиксируются до начала работы. Никаких скрытых часов.' },
      ] },
      { name: 'Производство', steps: [
        { title: 'Фирменный стиль зафиксирован', text: 'Логотип, шрифты и цвета задаются один раз. Их использует каждый агент, поэтому товар узнаваем в каждом ролике.' },
        { title: 'Агенты делают черновики', text: 'AI-съемка, моушн-дизайн в коде, сайт и CRM собираются параллельно, у каждой части свой агент.' },
        { title: 'Автоматические проверки', text: 'Агенты проверяют рендер, субтитры, ссылки, скорость страниц и SEO-разметку до того, как результат увидит человек.' },
        { title: 'Проверка человеком', text: 'Человек просматривает каждую партию перед публикацией. Владелец может сначала одобрить что угодно.' },
      ] },
      { name: 'После запуска', steps: [
        { title: 'Публикация по графику', text: 'План на 30 дней выходит на все площадки вовремя, без ручного постинга.' },
        { title: 'Агент отвечает', text: 'Чаты и сайт получают ответы круглосуточно. Визиты записываются сразу в календарь.' },
        { title: 'Заявки попадают в CRM', text: 'Каждая заявка из чатов, звонков и форм в одном списке, с напоминаниями против неявок.' },
        { title: 'Отчет за месяц', text: 'Что привело клиентов, а что нет. Следующий месяц планируется по цифрам.' },
      ] },
    ],
  },
  pricing: {
    kicker: 'Цены',
    heading: 'Фиксированная цена или доля результата',
    intro: 'Стартовые цены в долларах. Можно выбрать фиксированную цену или платить только процент от того, что принес контент.',
    note: 'Это стартовые цены. Позже тариф на 4 рилса подорожает до $100 в месяц; купленные сейчас тарифы сохраняют стартовую цену.',
    cta: 'Обсудить условия',
    plans: [
      { name: 'Стартовый набор', price: '$40', unit: 'один раз на бизнес', text: 'Сайт и два рилса в подарок.', items: ['Сайт с онлайн-записью', '2 рилса в комплекте', 'Базовая настройка SEO'] },
      { name: 'Подписка', price: 'от $40', unit: 'в месяц', text: 'Короткие ролики каждый месяц. Объем на выбор.', items: ['4 рилса: $40', '8 рилсов: $70', '15 рилсов: $120', '30 рилсов: $210'] },
      { name: 'Оплата за результат', price: '1–30%', unit: 'от выручки или за заявку', text: 'Без предоплаты. Вы платите за заявки, которые мы приводим.', items: ['От 1% до 30% выручки с привлеченных заявок', 'Или фиксированная ставка за каждую заявку', 'Условия записываются до начала работы'] },
    ],
  },
  contact: {
    heading: 'Готовы попробовать?',
    text: 'Пришлите ссылку на сайт или Instagram. Я отвечу планом и условиями, без обязательств.',
    examples: 'Примеры и кейсы на production.suenot.com',
  },
};

const copy: Partial<Record<Locale, ProductionCopy>> = { en, ru };

export const getProduction = (locale: Locale): ProductionCopy => copy[locale] ?? en;
/** Locales with their own production copy; others fall back to English. */
export const productionLocales = Object.keys(copy) as Locale[];
