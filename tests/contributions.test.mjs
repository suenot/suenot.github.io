import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import handler, { calendar, collect, dateWindow, github, gitlab } from '../api/contributions.mjs';

test('contribution aggregates preserve dates, privacy and provider failures', async () => {
  const window = dateWindow(new Date('2026-09-18T12:00:00Z'));
  assert.equal(window.from, '2025-09-19');
  assert.equal(calendar(window, new Map()).days.length, 365);
  const leapWindow = dateWindow(new Date('2024-02-29T12:00:00Z'));
  assert.equal(leapWindow.from, '2023-03-01');
  assert.equal(calendar(leapWindow, new Map()).days.length, 366);
  assert.throws(() => calendar(window, new Map([[window.from, -1]])));

  const requests = [];
  const fake = mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push([String(url), options]);
    if (String(url).includes('graphql')) return Response.json({ data: {
      viewer: { login: 'suenot', contributionsCollection: { contributionCalendar: {
        totalContributions: 7, weeks: [{ contributionDays: [{ date: window.from, contributionCount: 7 }] }],
      } } },
    } }, { headers: { 'x-oauth-scopes': 'repo, read:user' } });
    if (String(url).endsWith('/user')) return Response.json({ id: 3, username: 'suenot', private_field: 'must not escape' });
    const event = { id: 1, author_id: 3, created_at: `${window.from}T05:00:00Z`, project_id: 123, push_data: { commit_count: 20, private_title: 'must not escape' } };
    if (new URL(url).searchParams.get('page') === '1') return Response.json([
      event,
      { ...event, id: 2, created_at: '2025-09-18T23:59:00Z' },
      { ...event, id: 3, author_id: 4 },
    ], { headers: { 'x-next-page': '2' } });
    return Response.json([event, { ...event, id: 4, created_at: `${window.to}T07:00:00Z` }], { headers: { 'x-next-page': '' } });
  });
  try {
    const gh = await github(window, 'test-token');
    assert.equal(gh.total, 7);
    const gl = await gitlab(window, 'test-token');
    assert(requests.filter(([url]) => !url.includes('graphql')).every(([url]) => new URL(url).origin === 'https://gitlab.com'), 'GitLab activity must use the intended instance');
    assert.equal(gl.total, 2, 'pushes count as events, duplicate IDs and out-of-range events are excluded');
    assert.equal(gl.days.at(-1).count, 1);
    assert(!JSON.stringify(gl).includes('private'));
    assert(requests.every(([, options]) => options.redirect === 'error'));
    assert(requests.find(([url]) => url.includes('events'))[0].includes('after=2025-09-18'));
    await assert.rejects(() => gitlab(window, 'test-token', 'http://gitlab.example.com'));

    fake.mock.mockImplementation(async () => Response.json({ data: { viewer: { login: 'suenot' } } }, { headers: { 'x-oauth-scopes': 'repo' } }));
    await assert.rejects(() => github(window, 'test-token'), /private contribution access unavailable/, 'repo scope alone must never be presented as complete private activity');

    fake.mock.mockImplementation(async () => Response.json({ errors: [{ message: 'private information' }] }));
    await assert.rejects(() => github(window, 'test-token'), /access unavailable/);
    const data = await collect(new Date(window.until));
    assert(data.sources.every((source) => source.status === 'unavailable'));
    assert(!JSON.stringify(data).includes('private information'));

    const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({ method: 'POST' }, response);
    assert.equal(response.code, 405);
    assert.equal(response.headers.Allow, 'GET, HEAD');
  } finally { mock.restoreAll(); }
});
