/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

type ValidationResult<T> = [Record<string, any>, undefined] | [undefined, T];

export function validator<T, U extends { [x: string]: any }>(
  schema: z.ZodSchema<T, any, U>
) {
  return {
    async tryValidate(body: unknown): Promise<ValidationResult<T>> {
      const { errors, values } = await this.resolver(body as U, undefined, {
        shouldUseNativeValidation: false,
        fields: {},
      });
      if (Object.values(errors).length) {
        return [errors, undefined];
      }
      return [undefined, values as T];
    },

    get resolver() {
      return zodResolver(schema);
    },
  };
}
