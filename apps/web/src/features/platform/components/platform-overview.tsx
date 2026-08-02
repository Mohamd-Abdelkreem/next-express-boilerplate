const foundations = [
  "Next.js 16 + React 19",
  "Express 5 + TypeScript",
  "Prisma 7 + PostgreSQL 18",
  "Turborepo + pnpm",
  "Zod + Pino",
  "ESLint + Prettier",
] as const;

export function PlatformOverview() {
  return (
    <section className="overview" aria-labelledby="foundations-title">
      <div className="overview__heading">
        <p className="eyebrow">Production-ready foundation</p>
        <h2 id="foundations-title">A clean place to start building.</h2>
      </div>
      <ul className="foundation-grid">
        {foundations.map((foundation, index) => (
          <li key={foundation} className="foundation-card">
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <strong>{foundation}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
