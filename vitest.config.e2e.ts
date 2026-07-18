// vitest.config.e2e.ts
import swc from "unplugin-swc";
import tsconfigPaths from "vitest-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.e2e-spec.ts"],
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    pool: "forks",
  },
  plugins: [tsconfigPaths(), swc.vite({ module: { type: "es6" } })],
});
