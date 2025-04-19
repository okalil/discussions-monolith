import * as z from "zod";

export type ValidationResult<T> =
  | [z.core.$ZodErrorTree<T, string>, undefined]
  | [undefined, T];

export class Validator<T> {
  constructor(private schema: z.ZodType<T>) {}

  tryValidate(body: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(body);
    if (!result.success) {
      return [z.treeifyError(result.error), undefined];
    }
    return [undefined, result.data];
  }
}

export function validator<T>(schema: z.ZodType<T>): Validator<T> {
  return new Validator(schema);
}
