import { useEffect } from "react";
import { toast, Toaster as SonnerToaster } from "sonner";

interface ServerToasts {
  success?: string;
  error?: string;
}

interface ToasterProps {
  serverToasts?: ServerToasts;
}

export function Toaster({ serverToasts = {} }: ToasterProps) {
  useEffect(() => {
    const { success, error } = serverToasts;
    if (success) toast.success(success);
    if (error) toast.error(error, { duration: 5000 });
  }, [serverToasts]);

  return <SonnerToaster richColors closeButton position="top-right" />;
}
