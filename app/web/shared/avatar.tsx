import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./utils/cn";

interface AvatarProps extends React.ComponentProps<"div"> {
  src?: string | null;
  alt: string;
  size: number;
  fallback?: string;
}

export function Avatar({ size, src, alt, fallback, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      {...props}
      className={cn(
        "relative border border-gray-200 flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        props.className
      )}
      style={{ width: size, height: size }}
    >
      {src && (
        <AvatarPrimitive.Image
          className={cn("aspect-square object-cover h-full w-full")}
          src={parseSource(src)}
          alt={alt}
        />
      )}
      {fallback != undefined && (
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground"
          )}
          style={{ fontSize: size / 2 }}
        >
          {fallback}
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  );
}

function parseSource(src: string) {
  try {
    return new URL(src).toString();
  } catch {
    return `/uploads/${src}`;
  }
}
