import { useEffect } from "react";
import { toast, Toaster as SonnerToaster } from "sonner";

interface SessionToasts {
  success?: string;
  error?: string;
}

interface ToasterProps {
  session?: SessionToasts;
}

export function Toaster({ session = {} }: ToasterProps) {
  useEffect(() => {
    const { success, error } = session;
    if (success) toast.success(success);
    if (error) toast.error(error, { duration: 5000 });
  }, [session]);

  return <SonnerToaster richColors closeButton position="top-right" />;
}
