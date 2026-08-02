"use client";

import { useState } from "react";

import { api } from "@/services/api";
import { ApiClientError } from "@/services/api-client";

type DemoConnectionResponse = Readonly<{
  success: true;
  statusCode: number;
  message: string;
  data: {
    api: "connected";
    database: "connected";
    message: {
      id: string;
      slug: string;
      title: string;
      message: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    checkedAt: string;
  };
  requestId: string;
  timestamp: string;
  path: string;
}>;

type ConnectionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: DemoConnectionResponse }
  | { status: "error"; message: string };

export function ConnectionCheck() {
  const [state, setState] = useState<ConnectionState>({ status: "idle" });

  const runConnectionCheck = async () => {
    setState({ status: "loading" });

    try {
      const result =
        await api.request<DemoConnectionResponse>("/demo/connection");
      setState({ status: "success", result });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof ApiClientError
            ? error.message
            : "The connection check failed unexpectedly.",
      });
    }
  };

  return (
    <section className="connection-check" aria-labelledby="connection-title">
      <div>
        <p className="eyebrow">Live integration check</p>
        <h2 id="connection-title">Frontend → API → PostgreSQL</h2>
        <p className="connection-check__summary">
          Run a real request that reads the seeded demo record through Prisma.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void runConnectionCheck()}
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? "Checking…" : "Test connection"}
      </button>
      <div className="connection-result" aria-live="polite">
        {state.status === "idle" && <p>Ready to test the full stack.</p>}
        {state.status === "loading" && <p>Contacting the API…</p>}
        {state.status === "error" && (
          <p className="connection-result__error">{state.message}</p>
        )}
        {state.status === "success" && (
          <>
            <div className="connection-result__status">
              <span>API: {state.result.data.api}</span>
              <span>Database: {state.result.data.database}</span>
            </div>
            <strong>
              {state.result.data.message?.title ?? "Database is empty"}
            </strong>
            <p>
              {state.result.data.message?.message ??
                "Run pnpm db:seed to add the demo record."}
            </p>
            <small>Request ID: {state.result.requestId}</small>
          </>
        )}
      </div>
    </section>
  );
}
