import { cn } from "./utils/cn";

interface Props extends React.ComponentProps<"p"> {
  error: string | Error;
}

export function ErrorMessage({ error, ...props }: Props) {
  const errorMessage = typeof error == "string" ? error : error.message;
  return (
    <div
      {...props}
      className={cn(
        "p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400",
        props.className
      )}
      role="alert"
    >
      <span className="font-medium">Error:</span> {errorMessage}
    </div>
  );
}
