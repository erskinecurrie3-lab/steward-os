/**
 * Temporal worker — runs workflows and activities
 * Run: npx tsx temporal/worker.ts
 * Requires: Temporal server (local: npx temporal server start-dev)
 */

import path from "node:path";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
    tls: process.env.TEMPORAL_TLS === "true"
      ? { clientCertPair: { crt: Buffer.from(process.env.TEMPORAL_TLS_CERT ?? ""), key: Buffer.from(process.env.TEMPORAL_TLS_KEY ?? "") } }
      : false,
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    taskQueue: "stewardos-automation",
    workflowsPath: path.resolve(__dirname, "workflows"),
    activities,
  });

  await worker.run();
}

run().catch((err) => {
  console.error("Temporal worker error:", err);
  process.exit(1);
});
