import { useEffect } from "react";
import { toast, Toaster as SonnerToaster } from "sonner";

interface SessionToasts {
  success?: string;
  error?: string;
}

interface ToasterProps {
  sessionToasts?: SessionToasts;
}

export function Toaster({ sessionToasts = {} }: ToasterProps) {
  useEffect(() => {
    const { success, error } = sessionToasts;
    if (success) toast.success(success);
    if (error) toast.error(error, { duration: 5000 });
  }, [sessionToasts]);

  return <SonnerToaster richColors closeButton position="top-right" />;
}
