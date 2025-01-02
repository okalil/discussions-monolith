import { useEffect, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

interface ToastProps {
  title: string;
  message: string;
  duration?: number;
  dependency?: unknown;
}
export function Toast({
  title,
  message,
  duration = 5000,
  dependency,
}: ToastProps) {
  const [open, setOpen] = useState(!!message);
  useEffect(() => setOpen(!!message), [message, dependency]);

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      duration={duration}
      className="grid grid-cols-[auto_max-content] items-center gap-x-[15px] rounded-md bg-white p-[15px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]"
    >
      <ToastPrimitive.Title className="mb-[5px] text-[15px] font-medium text-slate12 [grid-area:_title]">
        {title}
      </ToastPrimitive.Title>
      <ToastPrimitive.Description className="m-0 text-[13px] leading-[1.3] text-slate11 [grid-area:_description]">
        {message}
      </ToastPrimitive.Description>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }: React.PropsWithChildren) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
    </ToastPrimitive.Provider>
  );
}
