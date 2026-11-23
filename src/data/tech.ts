/** Skills shown in the Technologies section; its spark is drawn from them too (one ray per skill). */
export interface TechItem { name: string; color: string }
export interface TechCategory { name: string; primary?: boolean; items: TechItem[] }

export const techCategories: TechCategory[] = [
  {
    name: 'Languages',
    primary: true,
    items: [
      { name: 'TypeScript', color: '#3178C6' },
      { name: 'JavaScript', color: '#EAD41C' },
      { name: 'Python', color: '#3776AB' },
      { name: 'Go', color: '#0095D5' },
    ],
  },
  {
    name: 'Languages (basics)',
    items: [
      { name: 'Swift', color: '#f05139' },
      { name: 'Zig', color: '#F7A41D' },
      { name: 'Rust', color: '#CE7F3E' },
      { name: 'Lua', color: '#6E87C8' },
      { name: 'C++', color: '#00599C' },
      { name: 'C#', color: '#239120' },
      { name: 'Kotlin', color: '#7F52FF' },
      { name: 'Haskell', color: '#8b4b87' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { name: 'PostgreSQL', color: '#336791' },
      { name: 'QuestDB', color: '#FF6B35' },
      { name: 'Redis', color: '#DD0031' },
      { name: 'MongoDB', color: '#118e4b' },
      { name: 'DuckDB', color: '#D4C000' },
      { name: 'Parquet', color: '#326CE5' },
      { name: 'Tarantool', color: '#FF6B35' },
      { name: 'MySQL', color: '#4479A1' },
      { name: 'SQLite', color: '#4A90D9' },
      { name: 'ClickHouse', color: '#FFCC01' },
      { name: 'Apache Kafka', color: '#231F20' },
      { name: 'Hasura', color: '#3970fd' },
    ],
  },
  {
    name: 'API & Protocols',
    items: [
      { name: 'GraphQL', color: '#E10098' },
      { name: 'gRPC', color: '#244c5a' },
      { name: 'REST', color: '#009639' },
      { name: 'WebSocket', color: '#4A90D9' },
      { name: 'FIX Protocol', color: '#1E3A8A' },
    ],
  },
  {
    name: 'Frontend',
    items: [
      { name: 'React', color: '#61DAFB' },
      { name: 'Astro', color: '#FF5D01' },
      { name: 'Vue', color: '#42b883' },
      { name: 'Svelte', color: '#f96743' },
      { name: 'Angular', color: '#DD0031' },
      { name: 'SwiftUI', color: '#FA7343' },
      { name: 'UIKit', color: '#147EFB' },
      { name: 'Apache ECharts', color: '#AA344D' },
      { name: 'React Stockcharts', color: '#61DAFB' },
    ],
  },
  {
    name: 'Cross-platform',
    items: [
      { name: 'Electron', color: '#47848F' },
      { name: 'Ionic', color: '#3880FF' },
      { name: 'Capacitor', color: '#119EFF' },
    ],
  },
  {
    name: 'Exchange APIs',
    items: [
      { name: 'CCXT', color: '#4CAF50' },
      { name: 'Binance', color: '#F0B90B' },
      { name: 'Bybit', color: '#F7A600' },
      { name: 'GateIO', color: '#2354E6' },
      { name: 'MEXC', color: '#1DA2B4' },
      { name: 'Bitget', color: '#00CEA8' },
      { name: 'Tinkoff Invest', color: '#FFDD2D' },
    ],
  },
  {
    name: 'DevOps & Infra',
    items: [
      { name: 'Docker', color: '#2496ED' },
      { name: 'Docker Compose', color: '#2496ED' },
      { name: 'Docker Swarm', color: '#2496ED' },
      { name: 'Kubernetes', color: '#326CE5' },
      { name: 'containerd', color: '#575757' },
      { name: 'CRI-O', color: '#294172' },
      { name: 'Nginx', color: '#009639' },
      { name: 'Apache', color: '#D22128' },
      { name: 'Traefik', color: '#24A1C1' },
      { name: 'Istio', color: '#466BB0' },
      { name: 'Ingress', color: '#326CE5' },
      { name: 'Gateway API', color: '#326CE5' },
      { name: 'Dokploy', color: '#7C3AED' },
      { name: 'Terraform', color: '#7B42BC' },
      { name: 'Argo CD', color: '#EF7B4D' },
      { name: 'Pulumi', color: '#8A3391' },
      { name: 'Prometheus', color: '#E6522C' },
      { name: 'Grafana', color: '#F46800' },
    ],
  },
];

export interface SparkRay { name: string; x: number; y: number; gx: number; gy: number }

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/** The spark: one ray per skill. More skills, more rays, closer to a circle. Drawn in a -110..110 box. */
export const skillCount = techCategories.reduce((n, c) => n + c.items.length, 0);
export const sparkRays: SparkRay[] = (() => {
  let i = 0;
  return techCategories.flatMap((c) => c.items.map((tech) => {
    const h = hash(tech.name);
    const angle = (i++ / skillCount) * Math.PI * 2 - Math.PI / 2 + ((h % 7) - 3) * 0.006;
    const length = 52 + (h % 37) + (c.primary ? 12 : 0);
    return { name: tech.name, x: Math.cos(angle) * length, y: Math.sin(angle) * length, gx: Math.cos(angle), gy: Math.sin(angle) };
  }));
})();
/** Ray width: thinner as skills are added. */
export const sparkRayWidth = Math.min(10, Math.max(1.8, 200 / skillCount));
