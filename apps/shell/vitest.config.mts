import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    server: {
      deps: {
        // next has no "exports" map for next/server in its ESM build; let Vite transform the
        // microfrontends package instead of loading it through Node ESM.
        inline: [/@vercel\/microfrontends/],
      },
    },
  },
});
