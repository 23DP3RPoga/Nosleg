import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, mergeConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/** Surfaces TanStack server function errors over HMR */
function devServerFnErrorLogger(): Plugin {
  const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";

  return {
    name: "dev-server-fn-error-logger",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      (globalThis as Record<string, (data: unknown) => void>)[HMR_SEND_KEY] = (data) => {
        server.ws.send({
          type: "custom",
          event: "server-fn-error",
          data,
        });
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const plugins: Plugin[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    devServerFnErrorLogger(),
    ...tanstackStart(),
    react(),
  ];

  const envDefine: Record<string, string> = {};
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");

  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return mergeConfig(
    {
      define: envDefine,

      resolve: {
        alias: {
          "@": `${process.cwd()}/src`,
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
        ],
      },

      plugins,

      server: {
        host: "0.0.0.0",
        port: 8080,
      },

      preview: {
        allowedHosts: true,
        port: 8080,
        host: true,
      },
    },
    {}
  );
});