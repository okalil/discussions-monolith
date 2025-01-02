import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  prerender: ["/login", "/register", "/forgot-password", "/reset-password"],
} satisfies Config;
