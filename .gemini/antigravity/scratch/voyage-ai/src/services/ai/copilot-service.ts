import { TripPreferences, TripItinerary } from "@/features/copilot/types";
import { DESTINATIONS } from "@/features/destination/constants";

/**
 * Interface for the AI Copilot Service.
 * Allows seamless swapping of the mock implementation for OpenAI, Gemini, or LangChain later.
 */
export interface AICopilotService {
  generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary>;
}

// Helper to simulate network latency and streaming text
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockCopilotService: AICopilotService = {
  async generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary> {
    // 1. Simulate streaming thoughts / introductory text
    const introText = `Analyzing your preferences...\n\nDestination: ${
      preferences.destination || "Explore"
    }\nDuration: ${preferences.duration || 3} Days\nStyle: ${
      preferences.style || "Balanced"
    }\nCompanions: ${preferences.companions || "Solo"}\n\nI'm crafting a bespoke itinerary tailored to your interests in ${
      preferences.interests?.join(", ") || "culture and sightseeing"
    }. Let's design something extraordinary.`;

    if (onTextChunk) {
      const words = introText.split(" ");
      for (let i = 0; i < words.length; i++) {
        onTextChunk(words[i] + " ");
        await sleep(30 + Math.random() * 40); // Simulate typing speed
      }
    } else {
      await sleep(2000); // Standard latency fallback
    }

    // 2. Generate destination-specific mock itinerary
    const destName = (preferences.destination || "Tokyo").toLowerCase();
    
    if (destName.includes("zermatt")) {
      return getZermattMock(preferences);
    } else if (destName.includes("reykjavik")) {
      return getReykjavikMock(preferences);
    } else if (destName.includes("ubud")) {
      return getUbudMock(preferences);
    } else if (destName.includes("tromso")) {
      return getTromsoMock(preferences);
    } else {
      // Default to Tokyo
      return getTokyoMock(preferences);
    }
  },
};

// ==========================================
// DESTINATION SPECIFIC MOCK ITINERARIES
// ==========================================

function getTokyoMock(p: TripPreferences): TripItinerary {
  return {
    overview: `A premium ${p.duration || 5}-day immersion into Tokyo's futuristic skyline and ancient shrines, tailored for a ${p.style || "balanced"} pace.`,
    days: [
      {
        day: 1,
        title: "Neon & Tradition in Shibuya",
        activities: [
          { time: "09:30 AM", title: "Meiji Shrine Walk", description: "Wander through the forested paths of Tokyo's most famous Shinto shrine.", cost: "Free" },
          { time: "01:00 PM", title: "Harajuku Street Food", description: "Explore Takeshita Street and sample premium crepes and rainbow cotton candy.", cost: "$15" },
          { time: "04:30 PM", title: "Shibuya Sky Sunset", description: "Watch the sun set behind Mt. Fuji from 229 meters above Shibuya Crossing.", cost: "$20" }
        ],
        restaurants: [
          { name: "Ichiran Shibuya", type: "Ramen", cost: "$12", description: "Tonkotsu ramen in individual dining booths." }
        ]
      },
      {
        day: 2,
        title: "Electric Culture & Historic Asakusa",
        activities: [
          { time: "10:00 AM", title: "Senso-ji Temple", description: "Tokyo's oldest Buddhist temple, entered through the iconic Kaminarimon Gate.", cost: "Free" },
          { time: "02:00 PM", title: "Akihabara Tech Exploration", description: "Wander through multi-story electronics department stores and retro gaming arcades.", cost: "Free" }
        ],
        restaurants: [
          { name: "Asakusa Imahan", type: "Sukiyaki", cost: "$60", description: "Fine wagyu beef sukiyaki serving since 1895." }
        ]
      }
    ],
    budget: {
      total: p.budget === "luxury" ? "$1,500" : p.budget === "budget" ? "$450" : "$850",
      breakdown: [
        { category: "Accommodation", cost: p.budget === "luxury" ? "$800" : p.budget === "budget" ? "$200" : "$450" },
        { category: "Activities", cost: "$150" },
        { category: "Food & Drinks", cost: "$250" }
      ]
    },
    hotels: [
      { name: "Aman Tokyo", rating: "5.0", price: "$950/night", description: "Luxury sanctuary in the Otemachi tower overlooking the Imperial Palace." }
    ],
    packingList: ["Comfortable walking shoes", "Suica/Pasmo card", "Pocket Wi-Fi / eSIM", "Universal power adapter"],
    hiddenGems: ["Todoroki Valley (a secret jungle canyon in the middle of Tokyo)", "Golden Gai micro-bars"],
    safetyTips: ["Earthquake safety drills are common; download the Safety Tips app.", "Tokyo is exceptionally safe, but exercise standard caution in nightlife districts like Roppongi."]
  };
}

function getZermattMock(p: TripPreferences): TripItinerary {
  return {
    overview: `A high-alpine escape in Zermatt, showcasing the Matterhorn and premium Swiss hospitality over ${p.duration || 3} days.`,
    days: [
      {
        day: 1,
        title: "Alpine Arrival & Village Stroll",
        activities: [
          { time: "11:00 AM", title: "Car-free Village Explorer", description: "Stroll along Bahnhofstrasse, Zermatt's main street, taking in the historic wooden barns.", cost: "Free" },
          { time: "03:00 PM", title: "Matterhorn Museum", description: "Learn about the tragic first ascent of the Matterhorn in 1865.", cost: "$12" }
        ],
        restaurants: [
          { name: "Saycheese!", type: "Swiss Fondue", cost: "$45", description: "Excellent local cheese fondue inside the Grand Hotel Zermatterhof." }
        ]
      }
    ],
    budget: {
      total: p.budget === "luxury" ? "$2,200" : "$1,100",
      breakdown: [
        { category: "Hotels", cost: "$650" },
        { category: "Mountain Passes", cost: "$200" },
        { category: "Dining", cost: "$250" }
      ]
    },
    hotels: [
      { name: "The Omnia", rating: "4.9", price: "$650/night", description: "Contemporary mountain lodge built into a rock face above Zermatt." }
    ],
    packingList: ["Heavy thermal layers", "Windproof jacket", "Sturdy hiking boots", "Polarized sunglasses"],
    hiddenGems: ["Findelbach bridge photography spot", "Stafelalp hiking trail"],
    safetyTips: ["Always check the Gornergrat weather feed before purchasing train tickets.", "Altitude sickness can occur; stay hydrated."]
  };
}

function getReykjavikMock(p: TripPreferences): TripItinerary {
  return {
    overview: `An immersive Icelandic adventure exploring geothermal wonders and volcanic landscapes from Reykjavik.`,
    days: [
      {
        day: 1,
        title: "Geothermal Healing & City Sights",
        activities: [
          { time: "09:00 AM", title: "Blue Lagoon Spa", description: "Soak in the mineral-rich geothermal waters surrounded by black lava fields.", cost: "$85" },
          { time: "03:00 PM", title: "Hallgrímskirkja Cathedral", description: "Take the elevator to the tower of Iceland's largest church for panoramic city views.", cost: "$10" }
        ],
        restaurants: [
          { name: "Dill Restaurant", type: "New Nordic", cost: "$120", description: "Iceland's first Michelin-starred restaurant celebrating local ingredients." }
        ]
      }
    ],
    budget: {
      total: "$980",
      breakdown: [
        { category: "Excursions", cost: "$350" },
        { category: "Car Rental", cost: "$250" },
        { category: "Food", cost: "$380" }
      ]
    },
    hotels: [
      { name: "The Reykjavik EDITION", rating: "4.8", price: "$400/night", description: "Modern luxury hotel situated next to the Harpa Concert Hall." }
    ],
    packingList: ["Waterproof outerwear", "Swimwear", "Thermal base layers", "Credit card (Iceland is virtually cashless)"],
    hiddenGems: ["Grótta Lighthouse hot spring", "Bæjarins Beztu Pylsur hot dog stand"],
    safetyTips: ["Weather in Iceland changes rapidly. Check safetravel.is daily.", "Do not step off marked paths in geothermal areas."]
  };
}

function getUbudMock(p: TripPreferences): TripItinerary {
  return {
    overview: `A peaceful, spiritual journey through Ubud's temples, rice fields, and culinary hotspots.`,
    days: [
      {
        day: 1,
        title: "Rice Terraces & Sacred Forests",
        activities: [
          { time: "08:00 AM", title: "Tegallalang Sunrise walk", description: "Walk through the terraced rice paddies in the cool morning air.", cost: "$3" },
          { time: "11:00 AM", title: "Sacred Monkey Forest Sanctuary", description: "Encounter Balinese long-tailed monkeys in their natural jungle habitat.", cost: "$6" }
        ],
        restaurants: [
          { name: "Locavore NXT", type: "Creative Balinese", cost: "$80", description: "Hyper-local ingredient tasting menu in the jungle." }
        ]
      }
    ],
    budget: {
      total: "$350",
      breakdown: [
        { category: "Villa Accommodation", cost: "$180" },
        { category: "Wellness Spa", cost: "$70" },
        { category: "Activities", cost: "$100" }
      ]
    },
    hotels: [
      { name: "Mandapa, a Ritz-Carlton Reserve", rating: "5.0", price: "$800/night", description: "A secluded sanctuary along the Ayung River in Ubud." }
    ],
    packingList: ["Light linen clothing", "Insect repellent", "Modest sarong for temple visits", "Sunscreen"],
    hiddenGems: ["Taman Sari waterfall", "Kari House cooking school"],
    safetyTips: ["Only drink bottled or filtered water; avoid ice at street stalls.", "Watch your belongings around monkeys; they will grab glasses and phones."]
  };
}

function getTromsoMock(p: TripPreferences): TripItinerary {
  return {
    overview: `An Arctic expedition in Tromsø, optimized for viewing the Northern Lights and dog sledding.`,
    days: [
      {
        day: 1,
        title: "Fjords & Northern Lights Chase",
        activities: [
          { time: "10:00 AM", title: "Fjord Cruise", description: "Sail through majestic Arctic fjords on a silent electric catamaran.", cost: "$95" },
          { time: "07:00 PM", title: "Northern Lights Chase", description: "Embark on a guided bus expedition to escape light pollution and find the Aurora.", cost: "$120" }
        ],
        restaurants: [
          { name: "Mathallen Tromsø", type: "Arctic Fine Dining", cost: "$75", description: "Gourmet dishes featuring reindeer, stockfish, and local berries." }
        ]
      }
    ],
    budget: {
      total: "$1,200",
      breakdown: [
        { category: "Tours", cost: "$400" },
        { category: "Lodging", cost: "$500" },
        { category: "Dining", cost: "$300" }
      ]
    },
    hotels: [
      { name: "Clarion Hotel The Edge", rating: "4.6", price: "$220/night", description: "Stylish waterfront hotel with a skybar overlooking the Tromsø bridge." }
    ],
    packingList: ["Merino wool underwear", "Thick mittens and hat", "Tripod for aurora photography", "Hand warmers"],
    hiddenGems: ["Telegrafbukta beach at dusk", "Ølhallen (Tromsø's oldest pub, featuring 72 Norwegian craft beers on tap)"],
    safetyTips: ["Black ice is common on sidewalks; wear shoe spikes (brodder).", "Arctic winds can drop temperatures rapidly; dress in layers."]
  };
}
