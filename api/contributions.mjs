const DAY = 86_400_000;
const HOUR = 3_600_000;
const GITLAB_ORIGIN = 'https://gitlab.com';

export function dateWindow(now = new Date()) {
  const end = new Date(now);
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), until: end.toISOString() };
}

async function json(url, options) {
  const signal = AbortSignal.any([AbortSignal.timeout(15_000), ...(options.signal ? [options.signal] : [])]);
  const response = await fetch(url, { ...options, signal, redirect: 'error' });
  if (!response.ok) throw new Error('Contribution provider unavailable');
  return { data: await response.json(), headers: response.headers };
}

export function calendar(window, counts) {
  const days = [];
  for (let time = Date.parse(window.from); time <= Date.parse(window.to); time += DAY) {
    const date = new Date(time).toISOString().slice(0, 10);
    const count = counts.get(date) ?? 0;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid contribution count');
    days.push({ date, count });
  }
  return { days, total: days.reduce((sum, day) => sum + day.count, 0) };
}

export async function github(window, token) {
  if (!token) throw new Error('GitHub credentials unavailable');
  const { data, headers } = await json('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($from: DateTime!, $to: DateTime!) {
        viewer {
          login
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
          }
        }
      }`,
      variables: { from: `${window.from}T00:00:00Z`, to: window.until },
    }),
  });
  if (data.errors?.length || data.data?.viewer?.login?.toLowerCase() !== 'suenot') throw new Error('GitHub contribution access unavailable');
  // GitHub silently omits private/internal contributions without this scope, even with `repo`.
  const scopes = (headers.get('x-oauth-scopes') ?? '').split(',').map((scope) => scope.trim());
  if (!scopes.includes('read:user') && !scopes.includes('user')) throw new Error('GitHub private contribution access unavailable');
  const source = data.data?.viewer?.contributionsCollection?.contributionCalendar;
  if (!Array.isArray(source?.weeks)) throw new Error('Invalid GitHub calendar');
  const counts = new Map();
  for (const week of source.weeks) for (const day of week.contributionDays) {
    if (counts.has(day.date)) throw new Error('Duplicate contribution date');
    counts.set(day.date, day.contributionCount);
  }
  const result = calendar(window, counts);
  if (result.total !== source.totalContributions) throw new Error('Incomplete GitHub calendar');
  return result;
}

export async function gitlab(window, token, origin = GITLAB_ORIGIN) {
  if (!token) throw new Error('GitLab credentials unavailable');
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/') throw new Error('Invalid GitLab origin');
  const headers = { Authorization: `Bearer ${token}` };
  const signal = AbortSignal.timeout(40_000);
  const { data: user } = await json(`${base.origin}/api/v4/user`, { headers, signal });
  if (user.username !== 'suenot' || !Number.isSafeInteger(user.id)) throw new Error('Unexpected GitLab account');
  const counts = new Map();
  const seen = new Set();
  const after = new Date(Date.parse(window.from) - DAY).toISOString().slice(0, 10);
  const before = new Date(Date.parse(window.to) + DAY).toISOString().slice(0, 10);
  for (let page = 1; page <= 200; page++) {
    const url = `${base.origin}/api/v4/users/${user.id}/events?after=${after}&before=${before}&per_page=100&page=${page}&sort=asc`;
    const { data: events, headers: responseHeaders } = await json(url, { headers, signal });
    if (!Array.isArray(events)) throw new Error('Invalid GitLab events');
    for (const event of events) {
      if (!Number.isSafeInteger(event.id) || !Number.isFinite(Date.parse(event.created_at))) throw new Error('Invalid GitLab event');
      if (event.author_id !== user.id || seen.has(event.id)) continue;
      seen.add(event.id);
      const date = new Date(event.created_at).toISOString().slice(0, 10);
      if (date >= window.from && date <= window.to && Date.parse(event.created_at) <= Date.parse(window.until)) {
        counts.set(date, (counts.get(date) ?? 0) + 1);
      }
    }
    const next = responseHeaders.get('x-next-page');
    if (next === '' || (next === null && events.length < 100)) return calendar(window, counts);
    if (next !== null && Number(next) !== page + 1) throw new Error('Invalid GitLab pagination');
  }
  throw new Error('Incomplete GitLab history');
}

let cached;
let pending;

export async function collect(now = new Date()) {
  const window = dateWindow(now);
  let gitlabLabel = 'GitLab';
  try { gitlabLabel += ` · ${new URL(process.env.CONTRIBUTIONS_GITLAB_URL || GITLAB_ORIGIN).hostname}`; } catch { /* Invalid configuration is reported as unavailable below. */ }
  const results = await Promise.allSettled([
    github(window, process.env.CONTRIBUTIONS_GITHUB_TOKEN),
    gitlab(window, process.env.CONTRIBUTIONS_GITLAB_TOKEN, process.env.CONTRIBUTIONS_GITLAB_URL),
  ]);
  const sources = results.map((result, index) => ({
    id: index === 0 ? 'github' : 'gitlab',
    label: index === 0 ? 'GitHub' : gitlabLabel,
    status: result.status === 'fulfilled' ? 'ok' : 'unavailable',
    ...(result.status === 'fulfilled' ? result.value : { days: [], total: 0 }),
  }));
  return { from: window.from, to: window.to, updatedAt: now.toISOString(), sources };
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Only aggregate counts cross this boundary; upstream objects and errors never leave the server.
  const now = Date.now();
  if (!cached || now >= cached.expires || cached.data.to !== new Date(now).toISOString().slice(0, 10)) {
    pending ??= collect().then((data) => {
      const complete = data.sources.every((source) => source.status === 'ok');
      cached = { data, expires: Date.now() + (complete ? HOUR : 60_000) };
    }).finally(() => { pending = undefined; });
    await pending;
  }
  const data = cached.data;
  const available = data.sources.some((source) => source.status === 'ok');
  const complete = data.sources.every((source) => source.status === 'ok');
  res.setHeader('Cache-Control', available ? `public, max-age=0, s-maxage=${complete ? 3600 : 60}, stale-while-revalidate=60` : 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(available ? 200 : 503);
  if (req.method === 'HEAD') return res.end();
  return res.json(data);
}
