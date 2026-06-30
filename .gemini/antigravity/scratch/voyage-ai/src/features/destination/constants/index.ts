import { Destination } from "../types";

export const DESTINATIONS: Destination[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    timezone: "GMT+9 (JST)",
    currency: "Japanese Yen (JPY)",
    population: "14 Million",
    language: "Japanese",
    weather: "22°C • Clear",
    safetyScore: 95,
    dailyBudget: "$120 - $220",
    bestSeason: "Spring (March - May)",
    visaRequired: false,
    attractions: ["Shibuya Crossing", "Senso-ji Temple", "Meiji Shrine", "Tokyo Skytree"],
    quickFacts: [
      "Tokyo is the most populous metropolitan area in the world.",
      "It has more Michelin-starred restaurants than any other city.",
      "Vending machines are extremely common, offering hot and cold drinks."
    ]
  },
  {
    id: "zermatt",
    name: "Zermatt",
    country: "Switzerland",
    latitude: 46.0207,
    longitude: 7.7491,
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    timezone: "GMT+2 (CEST)",
    currency: "Swiss Franc (CHF)",
    population: "5,800",
    language: "German, French",
    weather: "12°C • Breezy",
    safetyScore: 98,
    dailyBudget: "$200 - $350",
    bestSeason: "Winter (December - March)",
    visaRequired: false,
    attractions: ["The Matterhorn", "Gornergrat Railway", "Matterhorn Museum", "Klein Matterhorn"],
    quickFacts: [
      "Zermatt is a completely car-free village to prevent air pollution.",
      "The Matterhorn is the most photographed mountain in the world.",
      "Helicopter rescue services are stationed directly in the town."
    ]
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    latitude: 64.1466,
    longitude: -21.9426,
    heroImage: "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=800&q=80",
    timezone: "GMT+0 (GMT)",
    currency: "Icelandic Króna (ISK)",
    population: "130,000",
    language: "Icelandic",
    weather: "8°C • Cloudy",
    safetyScore: 97,
    dailyBudget: "$150 - $280",
    bestSeason: "Summer (June - August)",
    visaRequired: false,
    attractions: ["Hallgrímskirkja", "Harpa Concert Hall", "Blue Lagoon", "Perlan"],
    quickFacts: [
      "It is the northernmost capital of a sovereign state in the world.",
      "Most of the city is heated using geothermal energy.",
      "Iceland has no standing army and one of the lowest crime rates."
    ]
  },
  {
    id: "ubud",
    name: "Ubud",
    country: "Indonesia",
    latitude: -8.5069,
    longitude: 115.2625,
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    timezone: "GMT+8 (WITA)",
    currency: "Indonesian Rupiah (IDR)",
    population: "74,000",
    language: "Indonesian, Balinese",
    weather: "28°C • Humid",
    safetyScore: 88,
    dailyBudget: "$40 - $90",
    bestSeason: "Dry Season (April - October)",
    visaRequired: true,
    attractions: ["Sacred Monkey Forest", "Tegallalang Rice Terraces", "Ubud Palace", "Campuhan Ridge Walk"],
    quickFacts: [
      "Ubud is considered the cultural and artistic heart of Bali.",
      "The town is surrounded by rainforest and terraced paddy fields.",
      "Traditional Balinese dance performances occur nightly."
    ]
  },
  {
    id: "tromso",
    name: "Tromsø",
    country: "Norway",
    latitude: 69.6492,
    longitude: 18.9553,
    heroImage: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=800&q=80",
    timezone: "GMT+2 (CEST)",
    currency: "Norwegian Krone (NOK)",
    population: "77,000",
    language: "Norwegian",
    weather: "4°C • Light Rain",
    safetyScore: 96,
    dailyBudget: "$160 - $290",
    bestSeason: "Winter (November - March) for Northern Lights",
    visaRequired: false,
    attractions: ["Arctic Cathedral", "Fjellheisen Cable Car", "Polaria", "Tromsø Ice Domes"],
    quickFacts: [
      "Tromsø is located 350 kilometers north of the Arctic Circle.",
      "It is one of the best places in the world to view the Aurora Borealis.",
      "The sun does not set from late May to July (Midnight Sun)."
    ]
  }
];

export const POPULAR_DESTINATIONS = ["Tokyo", "Zermatt", "Reykjavik", "Ubud", "Tromso"];
export const TRENDING_DESTINATIONS = ["Tromso", "Japan", "Switzerland"];
