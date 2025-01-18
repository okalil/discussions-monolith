import React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "./utils/cn";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{trigger}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          className="bg-white rounded-lg px-2 py-2 border border-gray-200"
          align="end"
          sideOffset={4}
        >
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

DropdownMenu.Item = function DropdownMenuItem(
  props: React.ComponentProps<typeof DropdownPrimitive.Item>
) {
  return (
    <DropdownPrimitive.Item
      {...props}
      className={cn(
        "px-2 py-1 text-left rounded hover:bg-gray-100",
        props.className
      )}
    >
      {props.children}
    </DropdownPrimitive.Item>
  );
};
