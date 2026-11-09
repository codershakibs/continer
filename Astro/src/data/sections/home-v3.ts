import DispatchCardTopIcon from '@/assets/icons/dispatch-card-top-icon.svg';
import DispatchCardTopIcon2 from '@/assets/icons/dispatch-card-top-icon2.svg';
import DispatchCardTopIcon3 from '@/assets/icons/dispatch-card-top-icon3.svg';
import DispatchCardTopIcon4 from '@/assets/icons/dispatch-card-top-icon4.svg';

export const homeDispatchBodyTextItems = [
  {
    classes: "body-text body-color",
    text: "Sabrina Michaels",
  },
  {
    classes: "body-text isabelline-color",
    text: "— CEO & Co-Founder",
  },
] as const;

export const homeDispatchDispatchCardItems = [
  {
    classes: "dispatch-card _01",
    icon: DispatchCardTopIcon,
    text: "Freight Optimization",
    text2: "Helping operators navigate complex shipping routes with smart carrier data.",
  },
  {
    classes: "dispatch-card",
    icon: DispatchCardTopIcon2,
    text: "Fleet & Dispatch",
    text2: "Helping organizations align transport schedules and move vehicles with confidence.",
  },
  {
    classes: "dispatch-card",
    icon: DispatchCardTopIcon3,
    text: "Warehouse Automation",
    text2: "Turning storage and inventory complexity into seamless fulfillment performance.",
  },
  {
    classes: "dispatch-card _02",
    icon: DispatchCardTopIcon4,
    text: "Global Network Scale",
    text2: "Supporting ambitious logistics teams through cross-border growth and planning.",
  },
] as const;

export const homeLogisticsBodyTextItems = [
  {
    classes: "body-text white-rgb",
    text: "Jessica Mercedes",
  },
  {
    classes: "body-text white-rgb-64",
    text: "Head of Operations",
  },
] as const;

export const homeTestimonialsChainSideItems = [
  {
    image: "/images/Chain.webp",
    image2: "/images/PROJECT-3.svg",
    alt: "Partner logo",
    classes: "chain-card-logo invert",
    text: "\"Continer™ completely transformed how we monitor our cross-border fleet. The real-time telemetry and automated route planning cut our transit bottlenecks by 40% within the first month.\"",
    bodyTextList: [
      {
        classes: "body-text body-color",
        text: "John Kowalski",
      },
      {
        classes: "body-text isabelline-color",
        text: "— Founder, Modulabs",
      },
    ],
  },
  {
    image: "/images/Chain-Logo-2.webp",
    image2: "/images/PROJECT-4.svg",
    alt: "Partner logo",
    classes: "chain-card-logo invert",
    text: "\"CargoSync™ totally revamped how we track our regional distribution network. The instant status alerts and smart loading algorithms dropped our turnaround times by 35% in just three weeks.\"",
    bodyTextList: [
      {
        classes: "body-text body-color",
        text: "Sakibal Hasan",
      },
      {
        classes: "body-text isabelline-color",
        text: "— Founder, Modulabs",
      },
    ],
  },
  {
    image: "/images/Chain-Logo-1.webp",
    image2: "/images/Vector-3.svg",
    alt: "",
    classes: "chain-card-logo",
    text: "\"TrackRover™ fundamentally changed how we manage our city delivery drivers. The automated load balancing and live traffic rerouting trimmed our fuel expenses by 50% across sixty days.\"",
    bodyTextList: [
      {
        classes: "body-text body-color",
        text: "Tamim Iqbal",
      },
      {
        classes: "body-text isabelline-color",
        text: "— CEO , Framer",
      },
    ],
  },
] as const;
