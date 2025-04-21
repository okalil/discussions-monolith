import type * as z from "zod";

type ValidationResult<T> = [Error, undefined] | [undefined, T];

class Validator<T> {
  constructor(private schema: z.ZodType<T>) {}

  tryValidate(body: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(body);
    if (!result.success) {
      return [new Error(result.error.issues[0].message), undefined];
    }
    return [undefined, result.data];
  }
}

export function validator<T>(schema: z.ZodType<T>): Validator<T> {
  return new Validator(schema);
}
