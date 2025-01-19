export function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}
