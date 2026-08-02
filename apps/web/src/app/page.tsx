import { ConnectionCheck } from "@/features/platform/components/connection-check";
import { PlatformOverview } from "@/features/platform/components/platform-overview";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__mark" aria-hidden="true">
          T/
        </div>
        <div>
          <p className="eyebrow">Tas3eer Pro / Platform</p>
          <h1>Build the product, not the plumbing.</h1>
          <p className="hero__summary">
            A modular TypeScript monorepo with the runtime, database, security,
            logging, and developer tooling already aligned.
          </p>
        </div>
      </header>
      <PlatformOverview />
      <ConnectionCheck />
      <footer>
        <span className="status-dot" aria-hidden="true" />
        Web application is running
      </footer>
    </main>
  );
}
