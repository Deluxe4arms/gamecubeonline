import { readFileSync, writeFileSync } from "node:fs";

const COMPILE_SITE =
  "mod=new WebAssembly.Module(bytes);const t1=typeof performance!==\"undefined\"&&performance.now?performance.now():0;";
const GUARDED_COMPILE_SITE =
  "try{mod=new WebAssembly.Module(bytes)}catch(error){Module._dolphinJitCompileFailures=(Module._dolphinJitCompileFailures||0)+1;if(Module._dolphinJitCompileFailures<=5)console.warn(\"[wasm-dolphin] invalid generated JIT block; falling back to interpreter\",error);return 0}const t1=typeof performance!==\"undefined\"&&performance.now?performance.now():0;";

export function applyInvalidJitBlockFallback(path) {
  const source = readFileSync(path, "utf8");
  if (source.includes(GUARDED_COMPILE_SITE)) return false;

  const sites = source.split(COMPILE_SITE).length - 1;
  if (sites !== 1) {
    throw new Error(`Expected one JIT WebAssembly compile site in ${path}; found ${sites}`);
  }

  writeFileSync(path, source.replace(COMPILE_SITE, GUARDED_COMPILE_SITE));
  return true;
}
