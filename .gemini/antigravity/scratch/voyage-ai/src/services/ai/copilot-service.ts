import { TripPreferences, TripItinerary } from "@/features/copilot/types";

export interface AICopilotService {
  generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Destination-specific activity pools (supporting up to 10 days of unique activities)
const ACTIVITY_POOLS: Record<string, Array<{ title: string; description: string; cost: string; category: "sightseeing" | "dining" | "transit" | "accommodation" | "other" }>> = {
  tokyo: [
    { title: "Meiji Shrine Walk", description: "Wander through the forested paths of Tokyo's most famous Shinto shrine.", cost: "Free", category: "sightseeing" },
    { title: "Harajuku Crepes", description: "Sample premium crepes on Takeshita Street.", cost: "$8", category: "dining" },
    { title: "Shibuya Sky Sunset", description: "Watch the sun set behind Mt. Fuji from Shibuya Sky.", cost: "$20", category: "sightseeing" },
    { title: "Senso-ji Temple Tour", description: "Explore Tokyo's oldest Buddhist temple in Asakusa.", cost: "Free", category: "sightseeing" },
    { title: "Akihabara Electric Town", description: "Walk through retro gaming and anime shops.", cost: "Free", category: "sightseeing" },
    { title: "Tsukiji Sushi Tasting", description: "Sample fresh sashimi and tamagoyaki at Tsukiji Outer Market.", cost: "$35", category: "dining" },
    { title: "teamLab Planets", description: "Immerse yourself in a digital, water-based art museum.", cost: "$32", category: "sightseeing" },
    { title: "Shinjuku Gyoen National Garden", description: "Relax in one of Tokyo's largest and most beautiful parks.", cost: "$5", category: "sightseeing" },
    { title: "Shimokitazawa Vintage Hunt", description: "Browse second-hand clothing shops and record stores.", cost: "Free", category: "other" },
    { title: "Roppongi Hills View", description: "Enjoy panoramic night views of the Tokyo Tower.", cost: "$18", category: "sightseeing" },
  ],
  paris: [
    { title: "Eiffel Tower Climb", description: "Ascend the iconic landmark for sweeping views of the Seine.", cost: "$28", category: "sightseeing" },
    { title: "Seine River Cruise", description: "Glided past historic bridges and monuments on a glass-topped boat.", cost: "$15", category: "sightseeing" },
    { title: "Louvre Museum Tour", description: "See the Mona Lisa and Venus de Milo in the world's largest art museum.", cost: "$22", category: "sightseeing" },
    { title: "Montmartre Artist Walk", description: "Climb the cobblestone streets to the Sacré-Cœur Basilica.", cost: "Free", category: "sightseeing" },
    { title: "Luxembourg Gardens Picnic", description: "Enjoy fresh baguettes and cheese in the royal gardens.", cost: "$10", category: "dining" },
    { title: "Palace of Versailles", description: "Take a day trip to explore the Hall of Mirrors and royal gardens.", cost: "$25", category: "sightseeing" },
    { title: "Musée d'Orsay", description: "Admire the world's largest collection of impressionist masterpieces.", cost: "$16", category: "sightseeing" },
    { title: "Champs-Élysées Stroll", description: "Walk the grand avenue to the Arc de Triomphe.", cost: "Free", category: "sightseeing" },
    { title: "Marais District Shopping", description: "Browse trendy boutiques and local galleries.", cost: "Free", category: "other" },
    { title: "Sainte-Chapelle Stained Glass", description: "Marvel at the 13th-century Gothic stained glass windows.", cost: "$12", category: "sightseeing" },
  ],
  zermatt: [
    { title: "Gornergrat Cogwheel Railway", description: "Ride the historic train to the 3,089-meter overlook.", cost: "$85", category: "sightseeing" },
    { title: "Matterhorn Museum", description: "Learn about Zermatt's history and Matterhorn ascents.", cost: "$12", category: "sightseeing" },
    { title: "Car-free Village Explorer", description: "Walk Bahnhofstrasse and admire traditional wooden barns.", cost: "Free", category: "sightseeing" },
    { title: "Matterhorn Glacier Paradise", description: "Ascend the highest cable car in Europe.", cost: "$95", category: "sightseeing" },
    { title: "Five Lakes Trail Hike", description: "Hike the scenic path reflecting the Matterhorn in alpine lakes.", cost: "Free", category: "sightseeing" },
    { title: "Fondue at Saycheese!", description: "Indulge in traditional Swiss cheese fondue.", cost: "$45", category: "dining" },
    { title: "Sunnegga Funicular", description: "Take the underground funicular to the sunny terrace.", cost: "$30", category: "sightseeing" },
    { title: "Gorner Gorge Walkway", description: "Walk wooden paths suspended over a thundering glacial river.", cost: "$6", category: "sightseeing" },
    { title: "Riffelsee Reflection Photo", description: "Capture the Matterhorn reflected in the still lake water.", cost: "Free", category: "other" },
    { title: "Alpine Pasture Stroll", description: "Walk through fields of wildflowers with grazing sheep.", cost: "Free", category: "sightseeing" },
  ],
  reykjavik: [
    { title: "Blue Lagoon Geothermal Spa", description: "Soak in silica-rich geothermal waters.", cost: "$85", category: "sightseeing" },
    { title: "Hallgrímskirkja Cathedral", description: "Visit the iconic church and enjoy panoramic city views.", cost: "$10", category: "sightseeing" },
    { title: "Golden Circle Tour", description: "See Gullfoss waterfall, Geysir, and Þingvellir National Park.", cost: "$65", category: "sightseeing" },
    { title: "Harpa Concert Hall", description: "Admire the award-winning glass architecture by the harbor.", cost: "Free", category: "sightseeing" },
    { title: "Laugavegur Shopping", description: "Explore Reykjavik's main street for local crafts and wool.", cost: "Free", category: "other" },
    { title: "Perlan Museum", description: "Explore an interactive ice cave and planetarium.", cost: "$35", category: "sightseeing" },
    { title: "Northern Lights Chase", description: "Embark on a night bus tour to spot the Aurora Borealis.", cost: "$55", category: "sightseeing" },
    { title: "Whale Watching Cruise", description: "Sail from the old harbor to spot minke and humpback whales.", cost: "$80", category: "sightseeing" },
    { title: "Tjörnin Pond Walk", description: "Stroll around the city pond feeding ducks and swans.", cost: "Free", category: "sightseeing" },
    { title: "Black Sand Beach Day Trip", description: "Visit Vik's dramatic basalt columns and crashing waves.", cost: "$90", category: "sightseeing" },
  ],
  ubud: [
    { title: "Tegallalang Rice Terraces", description: "Walk the beautiful terraced slopes at sunrise.", cost: "$5", category: "sightseeing" },
    { title: "Sacred Monkey Forest", description: "Encounter Balinese long-tailed monkeys in their jungle temple.", cost: "$8", category: "sightseeing" },
    { title: "Ubud Art Market", description: "Browse locally handcrafted woodcarvings and woven bags.", cost: "Free", category: "other" },
    { title: "Campuhan Ridge Walk", description: "Enjoy a scenic trek over lush green valleys.", cost: "Free", category: "sightseeing" },
    { title: "Tegenungan Waterfall", description: "Swim in the pool of a thundering jungle waterfall.", cost: "$3", category: "sightseeing" },
    { title: "Balinese Cooking Class", description: "Learn to prepare traditional dishes using local spices.", cost: "$35", category: "dining" },
    { title: "Saraswati Temple", description: "Admire the water temple dedicated to the goddess of wisdom.", cost: "Free", category: "sightseeing" },
    { title: "Balinese Massage Spa", description: "Relax with a traditional full-body massage.", cost: "$25", category: "other" },
    { title: "Goa Gajah (Elephant Cave)", description: "Explore the 9th-century sanctuary and bathing pools.", cost: "$4", category: "sightseeing" },
    { title: "Traditional Dance Show", description: "Watch a dramatic Kecak or Legong dance performance.", cost: "$10", category: "sightseeing" },
  ],
  tromso: [
    { title: "Fjord Cruise", description: "Sail through Arctic fjords on a silent electric catamaran.", cost: "$95", category: "sightseeing" },
    { title: "Northern Lights Chase", description: "Chase the aurora with an experienced local guide.", cost: "$120", category: "sightseeing" },
    { title: "Fjellheisen Cable Car", description: "Ascend Mount Storsteinen for views of Tromsø island.", cost: "$30", category: "sightseeing" },
    { title: "Arctic Cathedral", description: "Visit the architectural landmark featuring stained glass.", cost: "$7", category: "sightseeing" },
    { title: "Polaria Aquarium", description: "Watch bearded seals and learn about polar environments.", cost: "$20", category: "sightseeing" },
    { title: "Tromsø Ice Domes", description: "Tour a magical hotel built entirely of snow and ice.", cost: "$85", category: "sightseeing" },
    { title: "Dog Sledding", description: "MUSH through snowy landscapes with friendly huskies.", cost: "$150", category: "sightseeing" },
    { title: "Ølhallen Pub Visit", description: "Sample Norwegian craft beers at Tromsø's oldest pub.", cost: "$15", category: "dining" },
    { title: "Telegrafbukta Beach", description: "Enjoy Arctic beach views and stargazing.", cost: "Free", category: "sightseeing" },
    { title: "Mack Brewery Tour", description: "Learn about the history of the world's northernmost brewery.", cost: "$25", category: "other" },
  ],
  bali: [
    { title: "Uluwatu Temple Cliff Walk", description: "Explore the clifftop temple overlooking the Indian Ocean.", cost: "$5", category: "sightseeing" },
    { title: "Kelingking Beach Lookout", description: "Admire the famous T-Rex shaped cliff on Nusa Penida.", cost: "$10", category: "sightseeing" },
    { title: "Tanah Lot Temple Sunset", description: "Watch the sun set behind the iconic offshore pilgrimage temple.", cost: "$6", category: "sightseeing" },
    { title: "Seminyak Beach Day", description: "Relax on sandy beaches and visit trendy beach clubs.", cost: "Free", category: "other" },
    { title: "Mount Batur Sunrise Trek", description: "Hike the active volcano for a spectacular sunrise.", cost: "$45", category: "sightseeing" },
    { title: "Waterbom Bali", description: "Spend the day at Asia's top-rated water park.", cost: "$35", category: "sightseeing" },
    { title: "Ulun Danu Bratan Temple", description: "Visit the famous lake temple in the Bedugul highlands.", cost: "$5", category: "sightseeing" },
    { title: "Jimbaran Bay Seafood Dinner", description: "Enjoy grilled seafood right on the sandy beach.", cost: "$30", category: "dining" },
    { title: "Tirta Empul Holy Springs", description: "Participate in a traditional Balinese purification ritual.", cost: "$4", category: "sightseeing" },
    { title: "Nusa Dua Snorkeling", description: "Swim with tropical fish and explore coral reefs.", cost: "$25", category: "sightseeing" },
  ]
};

// Generic fallback activity pool
const GENERIC_POOL = [
  { title: "City Landmarks Tour", description: "Explore the most famous historical and cultural monuments.", cost: "Free", category: "sightseeing" as const },
  { title: "Local Food Walk", description: "Sample traditional street food and regional specialties.", cost: "$20", category: "dining" as const },
  { title: "Scenic Viewpoint Hike", description: "Walk to a high overlook for panoramic photos.", cost: "Free", category: "sightseeing" as const },
  { title: "Central Park Stroll", description: "Relax in the city's main public park.", cost: "Free", category: "sightseeing" as const },
  { title: "Museum of Fine Arts", description: "Browse world-class art collections and exhibits.", cost: "$15", category: "sightseeing" as const },
  { title: "Boutique Shopping", description: "Explore independent shops and local designer boutiques.", cost: "Free", category: "other" as const },
  { title: "Traditional Market Visit", description: "Experience the bustling local marketplace.", cost: "Free", category: "other" as const },
  { title: "Sunset River Cruise", description: "Enjoy evening views from a scenic boat ride.", cost: "$30", category: "sightseeing" as const },
  { title: "Local Cafe Coffee", description: "Relax with a specialty coffee and pastry.", cost: "$8", category: "dining" as const },
  { title: "Botanical Gardens", description: "Walk through themed glasshouses and flower exhibitions.", cost: "$12", category: "sightseeing" as const },
];

export const mockCopilotService: AICopilotService = {
  async generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary> {
    const destination = preferences.destination || "Tokyo";
    const duration = preferences.duration || 5;
    const budgetLevel = preferences.budget || "moderate";
    const travelStyle = preferences.style || "balanced";
    const travelerCompanions = preferences.companions || "solo";

    // 1. Simulate streaming thoughts / introductory text
    const introText = `Analyzing your travel preferences...\n\nDestination: ${destination}\nDuration: ${duration} Days\nStyle: ${travelStyle}\nBudget: ${budgetLevel}\nCompanions: ${travelerCompanions}\n\nI am crafting a bespoke, dynamic itinerary tailored to your interests in ${
      preferences.interests?.join(", ") || "culture and sightseeing"
    }. Let's design something extraordinary.`;

    if (onTextChunk) {
      const words = introText.split(" ");
      for (let i = 0; i < words.length; i++) {
        onTextChunk(words[i] + " ");
        await sleep(25 + Math.random() * 20); // Fast typing speed
      }
    } else {
      await sleep(1200);
    }

    // 2. Resolve activity pool for destination
    const key = destination.toLowerCase().replace(/[^a-z0-9]/g, "");
    let pool = ACTIVITY_POOLS[key];
    if (!pool) {
      // Find partial match
      const matchedKey = Object.keys(ACTIVITY_POOLS).find(k => key.includes(k) || k.includes(key));
      pool = matchedKey ? ACTIVITY_POOLS[matchedKey] : GENERIC_POOL;
    }

    // 3. Generate exactly N days
    const days: TripItinerary["days"] = [];
    for (let dayNum = 1; dayNum <= duration; dayNum++) {
      // Pick 2 unique activities for this day
      const actIdx1 = (dayNum * 2 - 2) % pool.length;
      const actIdx2 = (dayNum * 2 - 1) % pool.length;

      const rawAct1 = pool[actIdx1];
      const rawAct2 = pool[actIdx2];

      days.push({
        day: dayNum,
        title: `Explore ${rawAct1.title.split(" ")[0]} & ${rawAct2.title.split(" ")[0]}`,
        activities: [
          {
            time: "09:30 AM",
            title: rawAct1.title,
            description: rawAct1.description,
            cost: rawAct1.cost
          },
          {
            time: "02:30 PM",
            title: rawAct2.title,
            description: rawAct2.description,
            cost: rawAct2.cost
          }
        ],
        restaurants: [
          {
            name: `Local ${destination} Bistro`,
            type: "Regional Cuisine",
            cost: budgetLevel === "luxury" ? "$75" : budgetLevel === "budget" ? "$15" : "$30",
            description: "A cozy spot serving fresh, authentic local dishes."
          }
        ]
      });
    }

    // 4. Scale budget based on duration and budget level
    const costPerDay = budgetLevel === "luxury" ? 500 : budgetLevel === "budget" ? 80 : 180;
    const accommodationPerNight = budgetLevel === "luxury" ? 450 : budgetLevel === "budget" ? 60 : 140;
    
    const totalAccom = accommodationPerNight * (duration - 1 || 1);
    const totalDaily = costPerDay * duration;
    const totalBudgetNum = totalAccom + totalDaily;

    const budgetBreakdown = [
      { category: "Accommodation", cost: `$${totalAccom.toLocaleString()}` },
      { category: "Activities & Food", cost: `$${totalDaily.toLocaleString()}` }
    ];

    // 5. Select Hotel
    const hotelNames: Record<string, string> = {
      tokyo: "Aman Tokyo",
      paris: "Le Meurice Paris",
      zermatt: "The Omnia Zermatt",
      reykjavik: "The Reykjavik EDITION",
      ubud: "Mandapa, Ritz-Carlton",
      tromso: "Clarion Hotel The Edge",
      bali: "Alila Villas Uluwatu"
    };
    const resolvedHotel = hotelNames[key] || `${destination} Grand Resort`;

    return {
      overview: `A premium ${duration}-day journey in ${destination}, tailored for a ${travelStyle} pace with ${travelerCompanions} travelers.`,
      days,
      budget: {
        total: `$${totalBudgetNum.toLocaleString()}`,
        breakdown: budgetBreakdown
      },
      hotels: [
        {
          name: resolvedHotel,
          rating: "4.8",
          price: `$${accommodationPerNight}/night`,
          description: "Premium lodging selected based on your budget and style."
        }
      ],
      packingList: ["Comfortable travel shoes", "Local currency / Cards", "Universal adapter", "Weather-appropriate layers"],
      hiddenGems: [`Secret viewpoint overlooking ${destination}`, "Quiet local cafe"],
      safetyTips: [`Standard travel precautions apply in ${destination}. Stay hydrated and keep emergency numbers handy.`]
    };
  }
};
