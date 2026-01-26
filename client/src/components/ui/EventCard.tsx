import { LightningIcon, BDTIcon } from "./Icons";
import { ArrowUpRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

// Simple Z icon for featured badge
const ZIcon = ({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M4 6H16L6 18H18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export type EventBadge =
  | "newly-added"
  | "trending"
  | "selling-fast"
  | "most-talked"
  | "editors-pick";

export interface EventCardProps {
  event: any;
  onClick?: () => void;
  isTrending?: boolean;
  isFeatured?: boolean;
}

// --- Main Component ---

export default function EventCard({ event, onClick, isTrending = false, isFeatured = false }: EventCardProps) {
  const getBadgeLabel = () => {
    switch (event.status) {
      case "published":
        return "Upcoming";
      case "live":
        return "Live";
      case "ended":
        return "Ended";
      default:
        return "";
    }
  };

  const sameDate = new Date(event.schedule.startDate).toDateString() === new Date(event.schedule.endDate).toDateString();
  const lowestPrice = event.tickets.reduce((a: any, b: any) => a.price.amount < b.price.amount ? a : b).price.amount;
  return (
    <motion.div whileHover={{ y: -5 }} className="relative">
      <div className="group cursor-pointer bg-white border-b-2 border-slate-300/50 hover:border-indigo-500 transition-all duration-300" onClick={onClick}>
      <div className="rounded-xl overflow-hidden">
        {/* Top Image Section */}
        <div className="relative aspect-[2/1] overflow-hidden rounded-t-xl">
          <img
            src={event.media.coverImage.url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Keep Live badge for live events */}
          {event.status === 'live' && (
            <div className="absolute top-3 left-3">
              <div className="px-3 py-1 bg-white text-slate-900 text-xs font-medium rounded-md flex items-center gap-1">
                <LightningIcon />
                <span className="text-xs text-gold-drop font-normal leading-5">
                  Live
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          <div className="bg-white uppercase text-slate-900 text-xs font-medium rounded-md flex items-center gap-1">
            <span className="text-xs text-gold-drop font-normal leading-5">
              {event.type}
            </span>
          </div>
          <p className="text-xs line-clamp-1 text-oslo-gray font-normal leading-5 capitalize mb-1.5">
            {new Date(event.schedule.startDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })} {sameDate ? "" : " - " + (new Date(event.schedule.endDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }))} • {new Date(event.schedule.startDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} - {new Date(event.schedule.endDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </p>

          <p className="text-xs text-oslo-gray font-normal leading-5 capitalize mb-1.5">
            
          </p>

          <h3 className="text-[15px] font-medium text-shark leading-5 line-clamp-2 mb-.5 min-h-[20px]">
            {event.title}
          </h3>

          <p className="text-[12px] flex items-center gap-1 text-oslo-gray font-normal leading-[21px] mb-3">
            <MapPin size={14} />
            {event.venue.name}
          </p>

          {/* Trending/Featured Badges */}
          {(isTrending || isFeatured) && (
            <div className="flex items-center gap-2 mb-3">
              {isTrending && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <span className="animate-pulse">🔥</span>
                  <span>Trending</span>
                </div>
              )}
              {isFeatured && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  <ZIcon size={10} className="text-white" />
                  <span>Featured</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex whitespace-nowrap items-center gap-2.5">
            {/* <div className="w-px h-4 bg-alto"></div> */}

            <div className="flex items-center gap-1">
              {/* <PriceTicketIcon /> */}
              <span className="text-xs text-abbey font-medium capitalize">
                {lowestPrice === 0 && "Free"}
                {lowestPrice !== 0 && (
                  <span>From <span className="text-[15px]"><BDTIcon className="font-bold" />{lowestPrice}</span></span>
                )}
              </span>
            </div>
            <button className="w-8 h-8 ml-auto mr-2 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 transform">
              <ArrowUpRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
}
