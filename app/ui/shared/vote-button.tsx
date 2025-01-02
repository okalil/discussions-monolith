import { MdArrowUpward } from "react-icons/md";

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
      <MdArrowUpward size={16} />
      {total}
    </button>
  );
}
