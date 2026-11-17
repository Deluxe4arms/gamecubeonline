import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const corePath = new URL("../cores/dolphin/dolphin-core-upstream.js", import.meta.url);
const source = await readFile(corePath, "utf8");
const functionStart = source.indexOf("function DolphinWeb_CachedInterpreterCompileWasmBlock(");
const functionEndMarker = "return index|0}";
const functionEnd = source.indexOf(functionEndMarker, functionStart);

assert.ok(functionStart >= 0, "generated core exposes the JIT block compile bridge");
assert.ok(functionEnd > functionStart, "JIT compile bridge has a complete body");
const compileFunction =
  `${source.slice(functionStart, functionEnd + functionEndMarker.length)}\n` +
  "globalThis.compileJitBlock = DolphinWeb_CachedInterpreterCompileWasmBlock;";

function createHarness(bytes) {
  const entries = [null];
  const warnings = [];
  const context = vm.createContext({
    Module: { HEAPU8: new Uint8Array(bytes) },
    WebAssembly,
    performance: { now: () => 1 },
    wasmMemory: new WebAssembly.Memory({ initial: 1 }),
    wasmTable: {
      get length() { return entries.length; },
      get: (index) => entries[index],
      grow: (count) => {
        const oldLength = entries.length;
        entries.length += count;
        return oldLength;
      },
      set: (index, value) => { entries[index] = value; }
    },
    _DolphinWeb_RecordModuleUs() {},
    _DolphinWeb_RecordCacheMiss() {},
    _DolphinWeb_RecordCacheHit() {},
    _DolphinWeb_RecordInstanceUs() {},
    console: { warn: (...args) => warnings.push(args) },
    self: { postMessage() {} }
  });
  vm.runInContext(compileFunction, context);
  return { context, entries, warnings };
}

test("invalid generated JIT WASM returns to the interpreter instead of escaping", () => {
  const { context, warnings } = createHarness([0, 97, 115, 109, 1, 0, 0, 0, 1]);

  assert.equal(context.compileJitBlock(0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0][0], /falling back to interpreter/);
});

test("valid generated JIT WASM still compiles and installs its function", () => {
  const bytes = [
    0, 97, 115, 109, 1, 0, 0, 0,
    1, 6, 1, 96, 1, 127, 1, 127,
    3, 2, 1, 0,
    7, 5, 1, 1, 102, 0, 0,
    10, 9, 1, 7, 0, 32, 0, 65, 42, 106, 11
  ];
  const { context, entries, warnings } = createHarness(bytes);

  const handle = context.compileJitBlock(0, bytes.length, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  assert.equal(handle, 1);
  assert.equal(entries[handle](8), 50);
  assert.equal(warnings.length, 0);
});
