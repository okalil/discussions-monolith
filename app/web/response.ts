import type { UNSAFE_DataWithResponseInit } from "react-router";

import { data } from "react-router";
import { errors } from "@vinejs/vine";

import { pullSession as session } from "./session";

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
    const errorMessage = error.messages?.[0]?.message ?? error.message;
    session().flash("error", errorMessage);
    return data(
      {
        ...fields,
        status: "error",
        error: new Error(errorMessage),
      },
      { status: 422 }
    );
  }
  const errorMessage =
    error instanceof Error ? error.message : "Unknown Server Error";
  session().flash("error", errorMessage);
  return data(
    {
      ...fields,
      status: "error",
      error: new Error(errorMessage),
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
