import { Icon } from "./icons";

type FlightCardProps = {
  airline: string;
  code: string;
  logo: string;
  departure: string;
  arrival: string;
  from: string;
  to: string;
  duration: string;
  stops: string;
  price: string;
  featured?: boolean;
  onSelect?: () => void;
};

export function FlightCard({
  airline,
  code,
  logo,
  departure,
  arrival,
  from,
  to,
  duration,
  stops,
  price,
  featured,
  onSelect,
}: FlightCardProps) {
  return (
    <article
      className={`relative grid min-h-[105px] grid-cols-2 items-center gap-[17px] rounded-xl border bg-white px-4 py-[22px] sm:grid-cols-[1fr_1.4fr_1fr_.75fr] sm:gap-[18px] sm:px-[22px] sm:py-5 ${featured ? "border-[#afd4cd] shadow-[0_7px_20px_rgba(17,87,80,.07)]" : "border-[#dfe7e9]"}`}
    >
      {featured && (
        <span className="absolute -top-2 left-[18px] rounded-[10px] bg-[#0e6b69] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.5px] text-white">
          Recommended
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-[#eef3f2] text-[9px] font-extrabold text-[#0e6b69]">
          {logo}
        </span>
        <div>
          <strong className="mb-1 block text-[11px]">{airline}</strong>
          <span className="text-[9px] text-[#8b999e]">{code} · Economy</span>
        </div>
      </div>
      <div className="col-span-2 row-start-2 grid grid-cols-[auto_1fr_auto] items-center gap-2.5 sm:col-span-1 sm:row-auto">
        <div>
          <strong className="block text-lg font-semibold">{departure}</strong>
          <span className="mt-[3px] block text-[9px] text-[#86969b]">
            {from}
          </span>
        </div>
        <div className="flex items-center gap-[5px] text-[#a4bdb8]">
          <span className="h-px w-full bg-[#b9d3ce]"></span>
          <Icon name="plane" size={16} />
        </div>
        <div className="text-right">
          <strong className="block text-lg font-semibold">{arrival}</strong>
          <span className="mt-[3px] block text-[9px] text-[#86969b]">{to}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-[#7f9195] sm:col-start-3 sm:row-auto">
        <span className="flex items-center gap-[5px]">
          <Icon name="clock" size={15} /> {duration}
        </span>
        <span className="text-[#c5d3d1]">•</span>
        <span>{stops}</span>
      </div>
      <div className="col-start-2 row-start-3 flex items-center justify-end gap-2.5 sm:col-start-4 sm:row-auto">
        <span className="self-end mb-[5px] text-[9px] text-[#8d9b9d]">
          from
        </span>
        <strong className="text-xl font-semibold">{price}</strong>
        <button
          type="button"
          onClick={onSelect}
          className="grid h-[30px] w-[30px] place-items-center rounded-full border-0 bg-[#eff6f4] text-[#0e6b69] hover:bg-[#0e6b69] hover:text-white"
          aria-label={`Select ${airline} flight`}
        >
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </article>
  );
}
