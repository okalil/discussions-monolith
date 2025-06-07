import React, { useRef } from "react";
import { useFetchers, useNavigation } from "react-router";

import { Icon } from "./icon";
import { cn } from "./utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "default" | "danger";
  loading?: boolean;
}

export function Button({
  variant,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pending = usePending(buttonRef.current?.form?.action);
  return (
    <button
      className={cn(
        "flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm",
        variant === "primary" && "bg-gray-900 text-gray-50 hover:bg-gray-800",
        variant === "default" && "border border-gray-200 hover:bg-gray-50",
        variant === "danger" && "text-red-700 bg-red-100 hover:bg-red-200",
        (pending || disabled) && "opacity-80 cursor-not-allowed",
        className
      )}
      disabled={disabled ?? pending}
      ref={buttonRef}
      {...props}
    >
      {pending ? (
        <Icon name="spinner" size={16} className="animate-spin h-5 w-5" />
      ) : (
        children
      )}
    </button>
  );
}
function usePending(formAction?: string) {
  const inflightForms = useInflightForms();
  return (
    !!formAction &&
    inflightForms.some(
      (it) =>
        it.formMethod === "POST" &&
        it.formAction === new URL(formAction).pathname
    )
  );
}
function useInflightForms() {
  const fetchers = useFetchers();
  const navigation = useNavigation();

  return [...fetchers, navigation].filter((it) => !!it.formAction);
}
