import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  routeDiscovery: {
    mode: "initial",
  },
  future: {
    v8_middleware: true,
    unstable_optimizeDeps: true,
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
