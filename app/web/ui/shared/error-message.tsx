interface Props {
  error: Error | string;
}

export function ErrorMessage({ error }: Props) {
  return (
    <p className="text-red-500 text-center">
      {error instanceof Error ? error.message : error}
    </p>
  );
}
