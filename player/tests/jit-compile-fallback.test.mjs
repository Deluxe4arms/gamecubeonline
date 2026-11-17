import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applyInvalidJitBlockFallback } from "../tools/jit-compile-fallback.mjs";

const COMPILE_SITE =
  "mod=new WebAssembly.Module(bytes);const t1=typeof performance!==\"undefined\"&&performance.now?performance.now():0;";
const GUARDED_COMPILE_SITE =
  "try{mod=new WebAssembly.Module(bytes)}catch(error){Module._dolphinJitCompileFailures=(Module._dolphinJitCompileFailures||0)+1;if(Module._dolphinJitCompileFailures<=5)console.warn(\"[wasm-dolphin] invalid generated JIT block; falling back to interpreter\",error);return 0}const t1=typeof performance!==\"undefined\"&&performance.now?performance.now():0;";

test("JIT output patch guards exactly one compile site and is repeatable", () => {
  const directory = mkdtempSync(join(tmpdir(), "jit-compile-fallback-"));
  const path = join(directory, "core.js");
  try {
    writeFileSync(path, `prefix${COMPILE_SITE}suffix`);

    assert.equal(applyInvalidJitBlockFallback(path), true);
    assert.equal(readFileSync(path, "utf8"), `prefix${GUARDED_COMPILE_SITE}suffix`);
    assert.equal(applyInvalidJitBlockFallback(path), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("JIT output patch rejects unexpected generated bundle shapes", () => {
  const directory = mkdtempSync(join(tmpdir(), "jit-compile-fallback-"));
  const path = join(directory, "core.js");
  try {
    writeFileSync(path, "unexpected generated bundle");

    assert.throws(() => applyInvalidJitBlockFallback(path), /found 0/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
