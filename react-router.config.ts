import type { Config } from "@react-router/dev/config";

declare module "react-router" {
  interface Future {
    unstable_middleware: true;
  }
}

export default {
  ssr: true,
  prerender: ["/login", "/register", "/forgot-password", "/reset-password"],
  future: {
    unstable_middleware: true,
    unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
