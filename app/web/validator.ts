import { useRef, useState } from "react";
import * as z from "zod";

import { bodyParser } from "~/web/body-parser";

type ValidationResult<T> = [z.ZodError<T>, undefined] | [undefined, T];

class Validator<T> {
  constructor(private schema: z.ZodType<T>) {}

  tryValidate(body: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(body);
    if (!result.success) {
      return [result.error, undefined];
    }
    return [undefined, result.data];
  }
}

export function validator<T>(schema: z.ZodType<T>): Validator<T> {
  return new Validator(schema);
}

export function useValidation<T>(
  validator: Validator<T>,
  initialState?: Error
) {
  const [error, setError] = useState(() => {
    if (initialState instanceof z.ZodError)
      return z.treeifyError<T>(initialState);
  });
  const attempts = useRef(0);

  function validateForm(form: HTMLFormElement) {
    const body = bodyParser.parseForm(new FormData(form));
    const [error] = validator.tryValidate(body);
    setError(error ? z.treeifyError(error) : undefined);
    return !error;
  }

  return {
    error,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      const ok = validateForm(e.currentTarget);
      if (!ok) e.preventDefault();

      attempts.current++;
    },
    onChange: (e: React.FormEvent<HTMLFormElement>) => {
      // If user hasn't submitted yet don't bother showing error messages
      if (!attempts.current) return;
      validateForm(e.currentTarget);
    },
  };
}
