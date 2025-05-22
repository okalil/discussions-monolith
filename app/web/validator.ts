/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod/v4";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

type ValidationResult<T> = [Record<string, any>, undefined] | [undefined, T];

export function validator<
  S extends z.ZodObject,
  T = z.output<S>,
  U extends { [x: string]: any } = z.input<S>
>(schema: S) {
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
      return standardSchemaResolver<U, unknown, T>(schema);
    },
  };
}
