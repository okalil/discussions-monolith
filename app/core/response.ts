import type { UNSAFE_DataWithResponseInit } from "react-router";

import { data } from "react-router";
import { errors } from "@vinejs/vine";

type HandleErrorReturn<T> = UNSAFE_DataWithResponseInit<
  {
    status: "error";
    error: Error;
    data?: never;
  } & T
>;

export function handleError<T>(
  error: unknown,
  additionalFields?: T
): HandleErrorReturn<T> {
  if (error instanceof Response) throw error;

  const fields = (additionalFields ?? {}) as T;

  if (error instanceof errors.E_VALIDATION_ERROR) {
    return data(
      {
        ...fields,
        status: "error",
        error: new Error(error.messages?.[0]?.message ?? error.message),
      },
      { status: 422 }
    );
  }

  return data(
    {
      ...fields,
      status: "error",
      error: new Error(
        error instanceof Error ? error.message : "Unknown Server Error"
      ),
    },
    { status: 500 }
  );
}

type HandleSuccessReturn<T> = {
  status: "success";
  data?: T;
  error?: never;
};
/**
 * Error boundaries are automatically shown when route loaders throw, so
 * this is only needed for API routes to distinguish success/error responses
 * @param data
 * @returns
 */
export function handleSuccess<T>(data?: T): HandleSuccessReturn<T> {
  return { status: "success", data };
}
