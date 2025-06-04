import type { z } from "zod/v4";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

type ErrorResult = [Record<string, unknown>, null];
type SuccessResult<T> = [null, T];

export function validator<S extends z.ZodObject>(schema: S) {
  type Input = z.input<S>;
  type Output = z.output<S>;

  const resolver = standardSchemaResolver<Input, unknown, Output>(schema);
  return {
    resolver,
    async tryValidate(body: unknown) {
      const { errors, values } = await resolver(body as Input, undefined, {
        shouldUseNativeValidation: false,
        fields: {},
      });
      if (Object.values(errors).length) {
        return [errors, null] as ErrorResult;
      }
      return [null, values] as SuccessResult<Output>;
    },
    async validate(body: unknown) {
      return await schema.parseAsync(body);
    },
  };
}
