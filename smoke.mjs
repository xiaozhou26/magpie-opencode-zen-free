import plugin from "./index.mjs";

const args = process.argv.slice(2);
const modelIndex = args.indexOf("--model");
const requested = modelIndex >= 0 ? args[modelIndex + 1] : "big-pickle";
const streaming = args.includes("--stream");
const hooks = await plugin.server({});
const auth = { type: "api", key: "public" };
const cfg = {};
await hooks.config(cfg);
const models = await hooks.provider.models({ models: {} }, { auth });
console.log(
  JSON.stringify({
    models: Object.keys(models),
    fallback: !!models[Symbol.for("magpie.fellBack")],
  }),
);
const model = models[requested];
if (!model) throw new Error(`Model is not currently available: ${requested}`);
const loader = await hooks.auth.loader(async () => auth);
const sdk = model.api.npm;
const path =
  sdk === "@ai-sdk/openai"
    ? "responses"
    : sdk === "@ai-sdk/anthropic"
      ? "messages"
      : "chat/completions";
const body = { model: requested, stream: streaming };
const prompt = "Reply with exactly OK. Do not use tools.";
if (path === "responses") {
  body.input = prompt;
  body.max_output_tokens = 256;
} else {
  body.messages = [{ role: "user", content: prompt }];
  body.max_tokens = 256;
}
const start = performance.now();
const response = await loader.fetch(`${loader.baseURL}/${path}`, {
  method: "POST",
  headers: { "x-session-id": `zen-free-smoke-${Date.now()}` },
  body: JSON.stringify(body),
  signal: AbortSignal.timeout(90000),
});
const text = await response.text();
console.log(
  JSON.stringify({
    model: requested,
    status: response.status,
    streaming,
    elapsedMs: Math.round(performance.now() - start),
    contentType: response.headers.get("content-type"),
    bytes: Buffer.byteLength(text),
  }),
);
console.log(text.slice(0, 4000));
if (!response.ok) process.exitCode = 1;
if (streaming && response.ok) {
  if (
    !text.includes("[DONE]") &&
    !text.includes("response.completed") &&
    !text.includes("message_stop")
  )
    process.exitCode = 1;
  if (/"type"\s*:\s*"error"|"error"\s*:\s*\{/.test(text)) process.exitCode = 1;
}
