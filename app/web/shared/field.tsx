import { cloneElement, useId } from "react";

interface FieldProps {
  label: string;
  error?: string | string[];
  children: React.JSX.Element;
}

export function Field({ label, error, children }: FieldProps) {
  const errors = Array.isArray(error) ? error.join(", ") : error;
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hasError = !!error;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {cloneElement(children, {
        ...children.props,
        id: inputId,
        "aria-invalid": hasError,
        "aria-describedby": hasError ? errorId : undefined,
        autoFocus: children.props.autoFocus || hasError,
      })}
      {errors && (
        <span className="text-sm text-red-600" id={errorId}>
          {errors}
        </span>
      )}
    </div>
  );
}
