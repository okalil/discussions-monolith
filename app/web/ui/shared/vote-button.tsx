import { cn } from "./utils/cn";

interface VoteButtonProps extends React.ComponentProps<"button"> {
  active: boolean;
  total: number;
}

export function VoteButton({ active, total, ...props }: VoteButtonProps) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "flex items-center text-sm gap-1 rounded-xl px-2 py-[2px] border border-gray-200 text-gray-700 hover:bg-blue-50",
        "data-[active=true]:border-blue-600 data-[active=true]:text-blue-600 data-[active=true]:bg-blue-50 data-[active=true]:hover:bg-blue-100"
      )}
      {...props}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="none" d="M0 0h24v24H0V0z" />
        <path d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
      </svg>
      {total}
    </button>
  );
}
