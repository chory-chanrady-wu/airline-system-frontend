import { Icon } from "./icons";

export function PageTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.7px] text-[#5b9994]">
          {eyebrow}
        </p>
        <h2 className="text-[26px] font-semibold tracking-[-.8px]">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex w-fit items-center gap-2 rounded-lg bg-[#0e6b69] px-4 py-2.5 text-[11px] font-bold text-white hover:bg-[#0a5655]"
        >
          <Icon name="ticket" size={16} /> {action}
        </button>
      )}
    </div>
  );
}

export type PageNotice = (message: string) => void;
export type PageNavigate = (
  module:
    | "Dashboard"
    | "Book flight"
    | "Reservations"
    | "Passengers"
    | "Flight Management",
) => void;
