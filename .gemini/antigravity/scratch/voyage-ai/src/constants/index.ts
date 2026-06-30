export const SITE_CONFIG = {
  name: "Voyage AI",
  shortName: "Voyage",
  description: "AI-powered travel planning platform combining immersive 3D experiences and intelligent itinerary generation.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://voyage-ai.vercel.app",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/voyage_ai",
    github: "https://github.com/voyage-ai",
  },
  creator: "Voyage AI Team",
  themeColor: "#050816",
};

export type SiteConfig = typeof SITE_CONFIG;
