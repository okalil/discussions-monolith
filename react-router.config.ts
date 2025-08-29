import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  prerender: ["/login", "/register", "/forgot-password", "/reset-password"],
  future: {
    unstable_middleware: true,
    unstable_optimizeDeps: true,
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
