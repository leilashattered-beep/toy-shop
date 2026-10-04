/**
 * Набор SVG-иконок (без внешних зависимостей).
 * Все иконки рисуются в 24x24 и наследуют цвет через currentColor.
 */

function Svg({ className = '', children, size, style }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

export const IconCart = (p) => (
  <Svg {...p}>
    <path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.6L21 8H7" />
    <circle cx="10" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </Svg>
)

export const IconUser = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Svg>
)

export const IconHeart = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.4-7.5-9.5A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 7.5 2.9C19.5 15.6 12 20 12 20Z" />
  </Svg>
)

export const IconStar = (p) => (
  <Svg {...p}>
    <path d="m12 3.6 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8Z" />
  </Svg>
)

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const IconChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="m14 6-6 6 6 6" />
  </Svg>
)

export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="m10 6 6 6-6 6" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconMinus = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
)

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
)

export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4l10-10-4-4L4 16Z" />
    <path d="m14 6 4 4" />
  </Svg>
)

export const IconBox = (p) => (
  <Svg {...p}>
    <path d="M3.5 8 12 4l8.5 4v8L12 20l-8.5-4Z" />
    <path d="M3.5 8 12 12l8.5-4M12 12v8" />
  </Svg>
)

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
  </Svg>
)

export const IconBag = (p) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12H6Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </Svg>
)

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.4" />
    <path d="M3 19.5a6 6 0 0 1 12 0" />
    <path d="M16.5 6.2a3.1 3.1 0 0 1 0 6M18 19.5a5.7 5.7 0 0 0-1.6-4" />
  </Svg>
)

export const IconChat = (p) => (
  <Svg {...p}>
    <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 15H9l-4.5 4Z" />
  </Svg>
)

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
    <path d="M18 12H10m8 0-3-3m3 3-3 3" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 20v-6M12.5 20V8M17 20v-9" />
  </Svg>
)

export const IconTruck = (p) => (
  <Svg {...p}>
    <path d="M3 7h10v9H3zM13 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Svg>
)

export const IconShield = (p) => (
  <Svg {...p}>
    <path d="M12 4 5.5 6.5v5c0 4 2.7 7 6.5 8.5 3.8-1.5 6.5-4.5 6.5-8.5v-5Z" />
    <path d="m9.5 12 1.8 1.8 3.4-3.6" />
  </Svg>
)

export const IconGift = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h16V20H4zM3 6.5h18v3H3zM12 6.5V20" />
    <path d="M12 6.5S10.5 3 8.5 3a2 2 0 0 0 0 3.5M12 6.5S13.5 3 15.5 3a2 2 0 0 1 0 3.5" />
  </Svg>
)

export const IconSparkles = (p) => (
  <Svg {...p}>
    <path d="M12 4l1.4 3.6L17 9l-3.6 1.4L12 14l-1.4-3.6L7 9l3.6-1.4Z" />
    <path d="M18 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M5 12h13m0 0-5-5m5 5-5 5" />
  </Svg>
)

export const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </Svg>
)

export const IconMapPin = (p) => (
  <Svg {...p}>
    <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Svg>
)

export const IconMail = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
    <path d="m4.5 8 7.5 5 7.5-5" />
  </Svg>
)

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
)

export const IconFilter = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
)

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.4-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4Z" />
  </Svg>
)

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="m4 10.5 8-6.5 8 6.5V20H4Z" />
    <path d="M10 20v-5h4v5" />
  </Svg>
)

export const IconBoxes = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4" width="7.5" height="7.5" rx="2" />
    <rect x="13" y="4" width="7.5" height="7.5" rx="2" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
  </Svg>
)

export const IconWallet = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="6" width="17" height="12.5" rx="3" />
    <path d="M3.5 10h17M16 14h1.5" />
  </Svg>
)

export const IconPaw = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="2.2" />
    <circle cx="16" cy="8" r="2.2" />
    <circle cx="5.5" cy="13" r="2" />
    <circle cx="18.5" cy="13" r="2" />
    <path d="M12 12c3 0 5 2.2 5 4.4S15 20 12 20s-5-1.4-5-3.6S9 12 12 12Z" />
  </Svg>
)

export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
)
