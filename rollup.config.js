import typescript from "rollup-plugin-typescript2";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,   // -> "dist/index.cjs"
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: pkg.module, // -> "dist/index.js"
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    tsconfigPaths(),
    nodeResolve(), // ✅ helps resolve node_modules correctly
    typescript({
      tsconfig: "./tsconfig.json",
      useTsconfigDeclarationDir: true, // ensures .d.ts go to declarationDir
      clean: true,
    }),
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
};
