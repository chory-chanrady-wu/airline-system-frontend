type IconName =
  | "arrow-right"
  | "calendar"
  | "check"
  | "chevron-down"
  | "clock"
  | "close"
  | "globe"
  | "logout"
  | "menu"
  | "monitor"
  | "moon"
  | "plane"
  | "search"
  | "settings"
  | "shield"
  | "sparkle"
  | "sun"
  | "swap"
  | "ticket"
  | "user";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  className,
}: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M16 2.5v4M8 2.5v4M3 9h18" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          <path d="m14 8 4 4-4 4M18 12H9" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="m3 11 18-6-6 18-3-8-9-4Z" />
          <path d="m12 15 4-4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path
            d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A2 2 0 0 0 1.7 12a2 2 0 0 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1A2 2 0 0 1 6 1.7l.1.1A2 2 0 0 0 9.5.4V.2a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1A2 2 0 0 0 21.1 8h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.7 3Z"
            transform="scale(.8) translate(3 3)"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="m12 3-1.2 4.8L6 9l4.8 1.2L12 15l1.2-4.8L18 9l-4.8-1.2L12 3ZM19 15l-.6 2.4L16 18l2.4.6L19 21l.6-2.4L22 18l-2.4-.6L19 15Z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "swap":
      return (
        <svg {...common}>
          <path d="M17 3l4 4-4 4M21 7H7a4 4 0 0 0-4 4M7 21l-4-4 4-4M3 17h14a4 4 0 0 0 4-4" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M20 12a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3Z" />
          <path d="M13 7v.01M13 12v.01M13 17v.01" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
  }
}
