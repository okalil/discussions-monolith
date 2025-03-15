import React from "react";

import { cn } from "~/web/ui/shared/utils/cn";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "default" | "danger";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant, className, children, loading, disabled, ...props },
    ref
  ) {
    return (
      <button
        className={cn(
          "flex items-center justify-center",
          "px-4 py-2 rounded-md font-medium text-sm",
          variant === "primary" && "bg-gray-900 text-gray-50 hover:bg-gray-800",
          variant === "default" && "border border-gray-200 hover:bg-gray-50",
          variant === "danger" && "text-red-700 bg-red-100 hover:bg-red-200",
          (loading || disabled) && "opacity-80 cursor-not-allowed",
          className
        )}
        disabled={disabled ?? loading}
        {...props}
        ref={ref}
      >
        {loading ? <Spinner className="animate-spin h-5 w-5" /> : children}
      </button>
    );
  }
);

function Spinner(props: React.ComponentProps<"svg">) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      stroke-width="0"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity="0.2"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        fill="currentColor"
      />
      <path
        d="M2 12C2 6.47715 6.47715 2 12 2V5C8.13401 5 5 8.13401 5 12H2Z"
        fill="currentColor"
      />
    </svg>
  );
}
