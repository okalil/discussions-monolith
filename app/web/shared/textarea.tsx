export function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}
