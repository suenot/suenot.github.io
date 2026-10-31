/**
 * CV data and project-map (Gantt) model.
 *
 * Content lives in src/data/cv/cv.<locale>.json (same schema per locale);
 * the PDF template reads the same files. Keys starting with "_" are private.
 */
import type { Locale } from '../i18n/config';
import en from '../data/cv/cv.en.json';
import ru from '../data/cv/cv.ru.json';
import zh from '../data/cv/cv.zh.json';
import ko from '../data/cv/cv.ko.json';
import ja from '../data/cv/cv.ja.json';
import ar from '../data/cv/cv.ar.json';
import labels from '../data/cv/labels.json';

export type Stake = 'founder' | 'hired' | 'partner' | 'none';
export interface Track { id: string; label: string }
export interface Experience {
  org: string; url?: string; role?: string; start?: string; end?: string;
  track?: string; summary?: string; bullets?: string[]; stack?: string[]; stake?: Stake;
}
export interface Project {
  name: string; url?: string; years?: string; track?: string;
  summary?: string; metric?: string; stack?: string[]; stake?: Stake;
}
export interface Education { school: string; degree?: string; years?: string }
export interface CV { tracks: Track[]; experience: Experience[]; projects: Project[]; education?: Education[] }

const data: Record<Locale, CV> = { en, ru, zh, ko, ja, ar } as unknown as Record<Locale, CV>;

export const getCv = (locale: Locale): CV => data[locale] ?? data.en;
export const getCvLabels = (locale: Locale) => (labels as Record<string, (typeof labels)['en']>)[locale] ?? labels.en;
export const resumeUrl = (locale: Locale) => `/resume/Eugen-Soloviov-CV.${locale}.pdf`;

const NOW = new Date();
const NOW_YEAR = NOW.getFullYear();
const NOW_FRAC = NOW_YEAR + (NOW.getMonth() + 1) / 12;
const ONGOING = /^(present|now|current|today|ongoing)$/i;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
const year = (s?: string) => {
  const m = s?.match(/\d{4}/);
  return m ? Number(m[0]) : undefined;
};

export interface MapTrack extends Track { rows: number }
export interface Clip {
  id: string; kind: 'role' | 'project' | 'edu'; stake: Stake; title: string; role?: string; url?: string;
  summary?: string; range: string; ongoing: boolean; track: MapTrack; row: number;
  start: number; end: number; x0: number; x1: number;
}
export interface ProjectMap { tracks: MapTrack[]; clips: Clip[]; ticks: { year: number; x: number; w: number }[] }

export function buildProjectMap(cv: CV, nowLabel: string, eduLabel: string): ProjectMap {
  const tracks: MapTrack[] = cv.tracks.map((t) => ({ ...t, rows: 1 }));
  const trackFor = (id?: string, label?: string) => {
    let t = tracks.find((x) => x.id === id);
    if (!t) { t = { id: id || 'other', label: label ?? id ?? 'Other', rows: 1 }; tracks.push(t); }
    return t;
  };
  const used = new Map<string, number>();
  const uid = (b: string) => { const n = used.get(b) ?? 0; used.set(b, n + 1); return n ? `${b}-${n + 1}` : b; };

  type Draft = Omit<Clip, 'row' | 'x0' | 'x1'>;
  const draft: Draft[] = [];

  for (const e of cv.experience) {
    const start = year(e.start) ?? NOW_YEAR;
    const ongoing = !e.end || ONGOING.test(e.end);
    const endYear = Math.max(ongoing ? NOW_YEAR : year(e.end) ?? start, start);
    const a = String(start), b = ongoing ? nowLabel : String(endYear);
    draft.push({
      id: uid(slug(`${e.org}-${start}`)), kind: 'role', stake: e.stake ?? 'founder', title: e.org, role: e.role, url: e.url, summary: e.summary,
      range: a === b ? a : `${a} – ${b}`, ongoing, track: trackFor(e.track),
      start, end: Math.min(endYear + 1, Math.max(NOW_FRAC, start + 0.25)),
    });
  }
  for (const p of cv.projects) {
    const yrs = p.years?.match(/\d{4}/g)?.map(Number);
    if (!yrs?.length) continue;
    const start = Math.min(...yrs);
    const ongoing = !!p.years && /present|now|current/i.test(p.years);
    const endYear = ongoing ? NOW_YEAR : Math.max(...yrs);
    draft.push({
      id: uid(slug(`${p.name}-${start}`)), kind: 'project', stake: p.stake ?? 'founder', title: p.name, url: p.url, summary: p.summary,
      range: start === endYear && !ongoing ? String(start) : `${start} – ${ongoing ? nowLabel : endYear}`,
      ongoing, track: trackFor(p.track), start, end: Math.min(endYear + 1, Math.max(NOW_FRAC, start + 0.25)),
    });
  }
  for (const ed of cv.education ?? []) {
    const yrs = ed.years?.match(/\d{4}/g)?.map(Number);
    if (!yrs?.length) continue;
    const start = Math.min(...yrs), endYear = Math.max(...yrs);
    draft.push({
      id: uid(slug(`${ed.school}-${start}`)), kind: 'edu', stake: 'none', title: ed.school.split(' (')[0], summary: ed.degree,
      range: start === endYear ? String(start) : `${start} – ${endYear}`, ongoing: false,
      track: trackFor('edu', eduLabel), start, end: endYear + 1,
    });
  }

  const rowOf = new Map<string, number>();
  for (const t of tracks) {
    const own = draft.filter((c) => c.track === t).sort((a, b) => a.start - b.start || b.end - a.end);
    const ends: number[] = [];
    for (const c of own) {
      let r = ends.findIndex((end) => end <= c.start + 1e-6);
      if (r === -1) { r = ends.length; ends.push(c.end); } else ends[r] = c.end;
      rowOf.set(c.id, r);
    }
    t.rows = Math.max(1, ends.length);
  }

  const min = draft.length ? Math.floor(Math.min(...draft.map((c) => c.start))) : NOW_YEAR;
  const max = draft.length ? Math.max(...draft.map((c) => c.end)) : NOW_YEAR + 1;
  const span = Math.max(max - min, 1);
  const x = (t: number) => (t - min) / span;
  const ticks = [];
  for (let y = min; y < max; y++) ticks.push({ year: y, x: x(y), w: x(Math.min(y + 1, max)) - x(y) });

  const clips = draft.map((c) => ({ ...c, row: rowOf.get(c.id) ?? 0, x0: x(c.start), x1: x(c.end) }));
  return { tracks, clips, ticks };
}
