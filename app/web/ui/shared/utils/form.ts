import { useRef, useState } from "react";

import type { ValidationResult, Validator } from "~/web/validator";

import { bodyParser } from "~/web/body-parser";

interface UseFormProps<T> {
  validator: Validator<T>;
  data?: { error: unknown };
}
export function useForm<T>({ validator, data }: UseFormProps<T>) {
  type FormError = ValidationResult<T>[0];
  const [error, setError] = useState<FormError>(() => {
    const isValidationError =
      typeof data?.error === "object" &&
      data?.error !== null &&
      "properties" in data.error;
    if (isValidationError) return data.error as FormError;
  });
  const submitCount = useRef(0);

  function validateForm(form: HTMLFormElement) {
    const body = bodyParser.parseForm(new FormData(form));
    const [error] = validator.tryValidate(body);
    setError(error);
    return !error;
  }

  return {
    error,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      const ok = validateForm(e.currentTarget);
      if (!ok) e.preventDefault();

      submitCount.current++;
    },
    onChange: (e: React.FormEvent<HTMLFormElement>) => {
      // If user hasn't submitted yet don't bother showing error messages
      if (!submitCount.current) return;
      validateForm(e.currentTarget);
    },
  };
}
