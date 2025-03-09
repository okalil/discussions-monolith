import { cn } from "./utils/cn";

interface Props extends React.ComponentProps<"p"> {
  error: Error | string;
}

export function ErrorMessage({ error, ...props }: Props) {
  return (
    <p {...props} className={cn("text-red-500 text-center", props.className)}>
      {error instanceof Error ? error.message : error}
    </p>
  );
}
