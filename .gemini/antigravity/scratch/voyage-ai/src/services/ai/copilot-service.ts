import { TripPreferences, TripItinerary } from "@/features/copilot/types";
import { DestinationKnowledgeEngine } from "@/features/destination-intelligence/engine/knowledge-engine";
import { DestinationRecommendationEngine } from "@/features/destination-intelligence/engine/recommendation-engine";
import { DestinationKnowledge, Attraction } from "@/features/destination-intelligence/types";

export interface AICopilotService {
  generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getNearbyDetails = (attractionTitle: string, knowledge: DestinationKnowledge): string => {
  const recs = knowledge.nearbyRecommendations[attractionTitle];
  if (!recs) {
    return `\n\n📍 Nearby Recommendations:\n• Cafe: Local Cafe (3m walk)\n• Restaurant: Traditional Diner (5m walk)\n• Restrooms: Public facility (2m walk)\n• Parking: Available nearby\n• Metro/Transit: Central Station (4m walk)\n• Emergency: Police Station (1 km away)\n• Estimated Walking Time: 8 mins`;
  }

  return `\n\n📍 Nearby Recommendations:\n• Cafe: ${recs.cafes[0] || "Local Cafe"}\n• Restaurant: ${recs.restaurants[0] || "Traditional Diner"}\n• Restrooms: ${recs.restrooms[0] || "Public facility"}\n• Parking: ${recs.parking[0] || "Available nearby"}\n• Metro/Transit: ${recs.metroStations[0] || "Central Station"}\n• Emergency: ${recs.emergencyServices[0] || "Police Station"}\n• Estimated Walking Time: 10 mins`;
};

export const mockCopilotService: AICopilotService = {
  async generateItinerary(
    preferences: TripPreferences,
    onTextChunk?: (chunk: string) => void
  ): Promise<TripItinerary> {
    const destination = preferences.destination || "Tokyo";
    const duration = preferences.duration || 5;
    const budgetLevel = preferences.budget || "moderate";
    const travelStyle = preferences.style || preferences.travelStyle || "balanced";
    const travelerCompanions = preferences.companions || "solo";
    const travelers = preferences.travelers || 1;
    const transportationPreference = preferences.transportationPreference || "Public Transport";

    // 1. Fetch destination intelligence knowledge
    const knowledge = await DestinationKnowledgeEngine.getKnowledge(destination);

    // 2. Stream AI thoughts enriched with Destination Knowledge context
    const introText = `[AI Planner Engine] Loading knowledge context for ${knowledge.destination}, ${knowledge.country}...
- Best Season: ${knowledge.bestSeason}
- Safety Score: ${knowledge.safetyScore}/100 | Timezone: ${knowledge.timezone}
- Currency: ${knowledge.currency} | Language: ${knowledge.language}
- Packing Recommendation: ${knowledge.travelTips.packingTips.slice(0,2).join(", ")}
- Common Tourist Scams to avoid: ${knowledge.travelTips.touristScams[0] || "None registered"}

Generating custom itinerary based on ${travelers} traveler(s) (${travelerCompanions}), budget style "${budgetLevel}", and travel pace "${travelStyle}". Selecting curated attractions, 2+ hidden gems, and traditional dining spots.`;

    if (onTextChunk) {
      const words = introText.split(" ");
      for (let i = 0; i < words.length; i++) {
        onTextChunk(words[i] + " ");
        await sleep(15 + Math.random() * 10);
      }
    } else {
      await sleep(1000);
    }

    // 3. Build scheduled days
    const days: TripItinerary["days"] = [];
    const destKey = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

    // Structured scheduler for major preset destinations
    if (destKey === "agra") {
      // Day 1
      days.push({
        day: 1,
        title: "Iconic Taj Mahal Sunrise & Historic Agra Fort",
        activities: [
          {
            time: "06:00 AM",
            title: "Taj Mahal",
            description: knowledge.mustVisitAttractions[0].description + getNearbyDetails("Taj Mahal", knowledge),
            cost: knowledge.mustVisitAttractions[0].cost,
            category: "sightseeing"
          },
          {
            time: "09:00 AM",
            title: "Breakfast at Deviram Sweets",
            description: knowledge.dining.streetFood[0].description,
            cost: "$2",
            category: "dining"
          },
          {
            time: "10:30 AM",
            title: "Agra Fort Tour",
            description: knowledge.mustVisitAttractions[1].description + getNearbyDetails("Agra Fort", knowledge),
            cost: knowledge.mustVisitAttractions[1].cost,
            category: "sightseeing"
          },
          {
            time: "01:30 PM",
            title: "Lunch at Sheroes Hangout Cafe",
            description: "[Hidden Gem] " + knowledge.hiddenGems[0].description + getNearbyDetails("Sheroes Hangout", knowledge),
            cost: "Pay what you wish",
            category: "dining"
          },
          {
            time: "03:30 PM",
            title: "Tomb of Itmad-ud-Daulah (Baby Taj)",
            description: knowledge.mustVisitAttractions[4].description + getNearbyDetails("Itmad-ud-Daulah", knowledge),
            cost: knowledge.mustVisitAttractions[4].cost,
            category: "sightseeing"
          },
          {
            time: "05:00 PM",
            title: "Mehtab Bagh Sunset Observation",
            description: knowledge.mustVisitAttractions[3].description + getNearbyDetails("Mehtab Bagh", knowledge),
            cost: knowledge.mustVisitAttractions[3].cost,
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Peshawri (ITC Mughal)", type: "Mughlai Fine Dining", cost: "$45", description: knowledge.dining.fineDining[0].description }
        ]
      });

      // Day 2
      days.push({
        day: 2,
        title: "Fatehpur Sikri Excursion & Mughal Heritage Walk",
        activities: [
          {
            time: "09:00 AM",
            title: "Fatehpur Sikri Historic Fortification",
            description: knowledge.mustVisitAttractions[2].description + getNearbyDetails("Fatehpur Sikri", knowledge),
            cost: knowledge.mustVisitAttractions[2].cost,
            category: "sightseeing"
          },
          {
            time: "01:00 PM",
            title: "Mughalai Lunch at Local Bistro",
            description: "Sample traditional chicken korma and freshly baked naans.",
            cost: "$12",
            category: "dining"
          },
          {
            time: "03:00 PM",
            title: "Agra Jama Masjid Visit",
            description: knowledge.mustVisitAttractions[5].description + getNearbyDetails("Jama Masjid", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "05:00 PM",
            title: "Mughal Heritage Walk in Kachhpura",
            description: "[Hidden Gem] " + knowledge.hiddenGems[4].description + getNearbyDetails("Mughal Heritage Walk", knowledge),
            cost: "$12",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Salt Cafe Kitchen & Bar", type: "Multi-cuisine Rooftop", cost: "$15", description: knowledge.dining.cafes[0].description }
        ]
      });

      // Add day 3 if duration >= 3
      if (duration >= 3) {
        days.push({
          day: 3,
          title: "Village Culture & Wildlife Conservation",
          activities: [
            {
              time: "09:00 AM",
              title: "Keetham Lake Bird Sanctuary",
              description: "[Hidden Gem] " + knowledge.hiddenGems[3].description,
              cost: "$5",
              category: "sightseeing"
            },
            {
              time: "01:00 PM",
              title: "Korai Village Local Experience",
              description: "[Hidden Gem] " + knowledge.hiddenGems[1].description,
              cost: "$10",
              category: "sightseeing"
            },
            {
              time: "04:00 PM",
              title: "Chini Ka Rauza Persian Tile Tomb",
              description: "[Hidden Gem] " + knowledge.hiddenGems[2].description,
              cost: "Free",
              category: "sightseeing"
            }
          ],
          restaurants: [
            { name: "Deviram Sweets Lunch", type: "Local Indian Street Food", cost: "$5", description: "Puffed pooris with aloo sabzi and fresh buttermilk." }
          ]
        });
      }
    } else if (destKey === "paris") {
      // Day 1
      days.push({
        day: 1,
        title: "Eiffel Tower Ascent & Louvre Museum Classics",
        activities: [
          {
            time: "09:30 AM",
            title: "Louvre Museum Tour",
            description: knowledge.mustVisitAttractions[1].description + getNearbyDetails("Louvre Museum", knowledge),
            cost: knowledge.mustVisitAttractions[1].cost,
            category: "sightseeing"
          },
          {
            time: "02:00 PM",
            title: "Eiffel Tower Climb",
            description: knowledge.mustVisitAttractions[0].description + getNearbyDetails("Eiffel Tower", knowledge),
            cost: knowledge.mustVisitAttractions[0].cost,
            category: "sightseeing"
          },
          {
            time: "04:30 PM",
            title: "Shakespeare and Company Bookstore",
            description: "[Hidden Gem] " + knowledge.hiddenGems[0].description + getNearbyDetails("Shakespeare and Company", knowledge),
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Le Jules Verne", type: "Modern French Gastronomy", cost: "$180", description: knowledge.dining.fineDining[0].description }
        ]
      });

      // Day 2
      days.push({
        day: 2,
        title: "Gothic Notre Dame & Montmartre Sunset Art Walk",
        activities: [
          {
            time: "09:00 AM",
            title: "Notre Dame Cathedral",
            description: knowledge.mustVisitAttractions[2].description + getNearbyDetails("Notre Dame Cathedral", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "11:30 AM",
            title: "Wander Le Marais Boutiques",
            description: "Explore narrow paths, mansions, and local fashion houses.",
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "01:00 PM",
            title: "Lunch at L'As du Fallafel",
            description: knowledge.dining.streetFood[0].description,
            cost: "$10",
            category: "dining"
          },
          {
            time: "04:30 PM",
            title: "Montmartre & Sacré-Cœur Sunset View",
            description: knowledge.mustVisitAttractions[3].description + getNearbyDetails("Montmartre", knowledge),
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Café de Flore", type: "Classic Parisian Bistro", cost: "$25", description: knowledge.dining.cafes[0].description }
        ]
      });

      if (duration >= 3) {
        days.push({
          day: 3,
          title: "Promenade Plantée Elevated Walkway & Left Bank Culture",
          activities: [
            {
              time: "10:00 AM",
              title: "Promenade Plantée elevated parkway",
              description: "[Hidden Gem] " + knowledge.hiddenGems[1].description,
              cost: "Free",
              category: "sightseeing"
            },
            {
              time: "02:00 PM",
              title: "Latin Quarter Bookstore & Cafe Crawl",
              description: "Explore the narrow paths, vintage book stalls, and intellectual atmosphere.",
              cost: "Free",
              category: "sightseeing"
            }
          ],
          restaurants: [
            { name: "Boulangerie Local", type: "Fresh Pastries & Sandwiches", cost: "$8", description: "Fresh butter croissants, baguettes, and tarts." }
          ]
        });
      }
    } else if (destKey === "tokyo") {
      // Day 1
      days.push({
        day: 1,
        title: "Asakusa Temple Traditions & Interactive teamLab Art",
        activities: [
          {
            time: "09:00 AM",
            title: "teamLab Planets",
            description: knowledge.mustVisitAttractions[3].description + getNearbyDetails("teamLab Planets", knowledge),
            cost: knowledge.mustVisitAttractions[3].cost,
            category: "sightseeing"
          },
          {
            time: "12:00 PM",
            title: "Tsukiji Outer Market Lunch",
            description: "Sample fresh tamagoyaki, oysters, and premium sushi rolls.",
            cost: "$20",
            category: "dining"
          },
          {
            time: "02:30 PM",
            title: "Asakusa Senso-ji Temple",
            description: knowledge.mustVisitAttractions[1].description + getNearbyDetails("Asakusa Temple (Senso-ji)", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "05:30 PM",
            title: "Yanaka Ginza Retro Walk",
            description: "[Hidden Gem] " + knowledge.hiddenGems[0].description + getNearbyDetails("Yanaka Ginza", knowledge),
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Chatei Hatou", type: "Kissaten specialty coffee", cost: "$12", description: knowledge.dining.cafes[0].description }
        ]
      });

      // Day 2
      days.push({
        day: 2,
        title: "Shibuya Sky View & Akihabara Electric Town",
        activities: [
          {
            time: "10:30 AM",
            title: "Akihabara Electric Town anime walk",
            description: knowledge.mustVisitAttractions[2].description + getNearbyDetails("Akihabara Electric Town", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "02:30 PM",
            title: "Shibuya Crossing & Shibuya Sky view",
            description: knowledge.mustVisitAttractions[0].description + getNearbyDetails("Shibuya Crossing", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "06:00 PM",
            title: "Golden Gai tiny micro-bars crawl",
            description: "[Hidden Gem] " + knowledge.hiddenGems[1].description,
            cost: "$15",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Sukiyabashi Jiro", type: "Edomae Sushi Omakase", cost: "$250", description: knowledge.dining.fineDining[0].description }
        ]
      });

      if (duration >= 3) {
        days.push({
          day: 3,
          title: "Ueno Park & Traditional Markets",
          activities: [
            {
              time: "09:30 AM",
              title: "Ueno Park & National Museum",
              description: "Explore the shrines, lotus ponds, and Japan's oldest national museum collections.",
              cost: "$6",
              category: "sightseeing"
            },
            {
              time: "01:00 PM",
              title: "Ameyoko street food tasting",
              description: "Sample takoyaki, grilled skewers, and fresh fruit skewers at the bustling market.",
              cost: "$10",
              category: "dining"
            }
          ],
          restaurants: [
            { name: "Ichiran Ramen", type: "Classic Tonkotsu Ramen", cost: "$10", description: "Dine in private booths with customized noodle textures." }
          ]
        });
      }
    } else if (destKey === "ladakh") {
      // Day 1
      days.push({
        day: 1,
        title: "Leh Acclimatization & Scenic Shanti Stupa Sunset",
        activities: [
          {
            time: "09:00 AM",
            title: "Acclimatization walk in Leh Main Bazar",
            description: "A relaxed walk through Leh markets to adjust to the high 3,500m elevation.",
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "02:00 PM",
            title: "Leh Palace Exploration",
            description: "Explore the 17th-century former royal palace built in Tibetan architecture.",
            cost: "$4",
            category: "sightseeing"
          },
          {
            time: "05:00 PM",
            title: "Shanti Stupa Sunset Photography",
            description: "Watch the sun set behind Leh valley from the white-domed peace pagoda.",
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "The Tibetan Kitchen", type: "Authentic Tibetan & Ladakhi", cost: "$10", description: knowledge.dining.fineDining[0].description }
        ]
      });

      // Day 2
      days.push({
        day: 2,
        title: "Khardung La Pass Ascent & Nubra Valley Camels",
        activities: [
          {
            time: "08:00 AM",
            title: "Drive through Khardung La Pass",
            description: knowledge.mustVisitAttractions[2].description + getNearbyDetails("Khardung La", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "01:00 PM",
            title: "Diskit Monastery & Nubra Sand Dunes",
            description: knowledge.mustVisitAttractions[1].description + getNearbyDetails("Nubra Valley", knowledge),
            cost: "$2",
            category: "sightseeing"
          },
          {
            time: "04:30 PM",
            title: "Bactrian double-humped camel riding in Hunder",
            description: "Enjoy a safari ride on double-humped camels through the cold desert dunes.",
            cost: "$6",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Leh Central Bakery", type: "Ladakhi Bread & Tea", cost: "$3", description: knowledge.dining.streetFood[0].description }
        ]
      });

      // Day 3
      days.push({
        day: 3,
        title: "Pangong Lake Color Changes & Turtuk Village Walk",
        activities: [
          {
            time: "08:00 AM",
            title: "Pangong Lake Shoreline Photography",
            description: knowledge.mustVisitAttractions[0].description + getNearbyDetails("Pangong Lake", knowledge),
            cost: "$1",
            category: "sightseeing"
          },
          {
            time: "02:00 PM",
            title: "Turtuk Village Baltic Culture",
            description: "[Hidden Gem] " + knowledge.hiddenGems[0].description,
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Leh Cafe Sol", type: "Travelers Cafe", cost: "$8", description: knowledge.dining.cafes[0].description }
        ]
      });

      if (duration >= 4) {
        days.push({
          day: 4,
          title: "Magnetic Hill Gravity Wonders & Lamayuru Moonland",
          activities: [
            {
              time: "10:00 AM",
              title: "Magnetic Hill gravity experience",
              description: knowledge.mustVisitAttractions[3].description + getNearbyDetails("Magnetic Hill", knowledge),
              cost: "Free",
              category: "sightseeing"
            },
            {
              time: "03:00 PM",
              title: "Lamayuru Moonland Lunar Landscapes",
              description: "[Hidden Gem] " + knowledge.hiddenGems[1].description,
              cost: "Free",
              category: "sightseeing"
            }
          ],
          restaurants: [
            { name: "Lakeside Camp Diner", type: "Hearty Indian Thali", cost: "$5", description: "Hot dal, rice, and mixed vegetables cooked in high altitude kitchens." }
          ]
        });
      }
    } else if (destKey === "jaipur") {
      // Day 1
      days.push({
        day: 1,
        title: "Hawa Mahal Sunrise & Nahargarh Fort Sunset View",
        activities: [
          {
            time: "09:00 AM",
            title: "Hawa Mahal Palace of Winds",
            description: knowledge.mustVisitAttractions[0].description + getNearbyDetails("Hawa Mahal", knowledge),
            cost: knowledge.mustVisitAttractions[0].cost,
            category: "sightseeing"
          },
          {
            time: "10:30 AM",
            title: "City Palace Royal Residence",
            description: knowledge.mustVisitAttractions[2].description + getNearbyDetails("City Palace", knowledge),
            cost: knowledge.mustVisitAttractions[2].cost,
            category: "sightseeing"
          },
          {
            time: "01:00 PM",
            title: "Lunch at Rawat Mishthan Bhandar",
            description: knowledge.dining.streetFood[1].description,
            cost: "$3",
            category: "dining"
          },
          {
            time: "02:30 PM",
            title: "Jantar Mantar Stone Observatory",
            description: knowledge.mustVisitAttractions[3].description + getNearbyDetails("Jantar Mantar", knowledge),
            cost: knowledge.mustVisitAttractions[3].cost,
            category: "sightseeing"
          },
          {
            time: "05:00 PM",
            title: "Nahargarh Fort Sunset Observationpoint",
            description: knowledge.mustVisitAttractions[4].description + getNearbyDetails("Nahargarh Fort", knowledge),
            cost: knowledge.mustVisitAttractions[4].cost,
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "Chokhi Dhani Dinner", type: "Rajasthani Cultural Feast", cost: "$15", description: "An open-air cultural village experience with traditional dances, camel rides, and pure ghee thalis." }
        ]
      });

      // Day 2
      days.push({
        day: 2,
        title: "Amer Fort Hill Climb & Stepwell Hidden Gems",
        activities: [
          {
            time: "09:00 AM",
            title: "Amer Fort",
            description: knowledge.mustVisitAttractions[1].description + getNearbyDetails("Amer Fort", knowledge),
            cost: knowledge.mustVisitAttractions[1].cost,
            category: "sightseeing"
          },
          {
            time: "12:30 PM",
            title: "Panna Meena Ka Kund Stepwell",
            description: "[Hidden Gem] " + knowledge.hiddenGems[0].description + getNearbyDetails("Panna Meena Ka Kund", knowledge),
            cost: "Free",
            category: "sightseeing"
          },
          {
            time: "02:00 PM",
            title: "Anokhi Museum of block printing",
            description: "[Hidden Gem] " + knowledge.hiddenGems[3].description + getNearbyDetails("Anokhi Museum", knowledge),
            cost: "$2",
            category: "sightseeing"
          },
          {
            time: "04:30 PM",
            title: "Jal Mahal Lakeside Photography",
            description: knowledge.mustVisitAttractions[5].description + getNearbyDetails("Jal Mahal", knowledge),
            cost: "Free",
            category: "sightseeing"
          }
        ],
        restaurants: [
          { name: "1135 AD", type: "Royal Gastronomy (inside Amer Fort)", cost: "$35", description: knowledge.dining.fineDining[0].description }
        ]
      });

      if (duration >= 3) {
        days.push({
          day: 3,
          title: "Monkey Temple Adventure & Jewelry Collection",
          activities: [
            {
              time: "09:30 AM",
              title: "Amrapali Museum Jewelry Tour",
              description: "[Hidden Gem] " + knowledge.hiddenGems[2].description,
              cost: "$8",
              category: "sightseeing"
            },
            {
              time: "12:30 PM",
              title: "Shopping at Johari & Bapu Bazaar",
              description: "Explore the bustling markets for lac bangles, hand-dyed textiles, and mojri footwear.",
              cost: "Free",
              category: "other"
            },
            {
              time: "03:30 PM",
              title: "Galta Ji Monkey Temple Walk",
              description: "[Hidden Gem] " + knowledge.hiddenGems[1].description,
              cost: "Free",
              category: "sightseeing"
            }
          ],
          restaurants: [
            { name: "Wind View Cafe", type: "Hawa Mahal Rooftop view cafe", cost: "$6", description: knowledge.dining.cafes[0].description }
          ]
        });
      }
    } else {
      // General scheduler fallback for other cities
      const mustVisits = DestinationRecommendationEngine.getPersonalizedAttractions(knowledge, preferences.interests || [], travelerCompanions, budgetLevel);
      const gems = [...knowledge.hiddenGems];
      const selectedDining = DestinationRecommendationEngine.getPersonalizedDining(knowledge, budgetLevel);

      for (let dayNum = 1; dayNum <= duration; dayNum++) {
        const mustIdx1 = ((dayNum - 1) * 2) % mustVisits.length;
        const mustIdx2 = ((dayNum - 1) * 2 + 1) % mustVisits.length;
        const gemIdx = (dayNum - 1) % gems.length;

        const dayActivities = [
          {
            time: "09:30 AM",
            title: mustVisits[mustIdx1]?.title || `${destination} Downtown Explorer`,
            description: (mustVisits[mustIdx1]?.description || "Explore central city streets.") + getNearbyDetails(mustVisits[mustIdx1]?.title || "Downtown", knowledge),
            cost: mustVisits[mustIdx1]?.cost || "Free",
            category: "sightseeing" as const
          },
          {
            time: "01:00 PM",
            title: "Traditional Lunch Stall",
            description: selectedDining[0]?.description || "Sample authentic local dishes.",
            cost: selectedDining[0]?.averageCost || "$10",
            category: "dining" as const
          },
          {
            time: "03:00 PM",
            title: mustVisits[mustIdx2]?.title || `${destination} Cultural Center`,
            description: (mustVisits[mustIdx2]?.description || "Discover local heritage.") + getNearbyDetails(mustVisits[mustIdx2]?.title || "Cultural Center", knowledge),
            cost: mustVisits[mustIdx2]?.cost || "Free",
            category: "sightseeing" as const
          },
          {
            time: "05:00 PM",
            title: gems[gemIdx]?.title || `${destination} Hidden Overlook`,
            description: "[Hidden Gem] " + (gems[gemIdx]?.description || "A scenic and quiet spot popular with locals.") + getNearbyDetails(gems[gemIdx]?.title || "Hidden Overlook", knowledge),
            cost: gems[gemIdx]?.cost || "Free",
            category: "sightseeing" as const
          }
        ];

        days.push({
          day: dayNum,
          title: `Discover ${dayActivities[0].title.split(" ")[0]} & Hidden spots`,
          activities: dayActivities,
          restaurants: [
            {
              name: selectedDining[1]?.name || "Local Bistro",
              type: selectedDining[1]?.cuisine || "Regional Cuisine",
              cost: selectedDining[1]?.averageCost || "$15",
              description: selectedDining[1]?.description || "A cozy eatery offering traditional plates."
            }
          ]
        });
      }
    }

    // 4. Calculate budget totals based on averageCosts of this destination
    const costAccommodationPerNight = budgetLevel === "luxury" ? 280 : budgetLevel === "budget" ? 35 : 110;
    const costSightseeingPerDay = parseFloat(knowledge.averageCosts.sightseeing.replace(/[^0-9.]/g, "")) || 15;
    const costFoodPerDay = parseFloat(knowledge.averageCosts.food.replace(/[^0-9.]/g, "")) || 20;

    const accommodationTotal = costAccommodationPerNight * (duration - 1 || 1);
    const activityFoodTotal = (costSightseeingPerDay + costFoodPerDay) * duration * travelers;
    const totalBudgetVal = accommodationTotal + activityFoodTotal;

    const budgetBreakdown = [
      { category: "Lodging & Stays", cost: `$${accommodationTotal.toLocaleString()}` },
      { category: "Activities, Food, Transit", cost: `$${activityFoodTotal.toLocaleString()}` }
    ];

    // Determine lodging recommendation names dynamically
    const destNameClean = knowledge.destination;
    const hotelName = budgetLevel === "luxury" 
      ? `Grand ${destNameClean} Heritage Resort` 
      : budgetLevel === "budget" 
        ? `${destNameClean} Backpacker Dorms` 
        : `${destNameClean} Boutique Hotel & Suites`;

    return {
      overview: `A comprehensive ${duration}-day journey in ${knowledge.destination}, ${knowledge.country}, tailored for a ${travelStyle} style with ${travelers} traveler(s) (${travelerCompanions}). Stays: ${hotelName}, Transit: ${transportationPreference}.`,
      days,
      budget: {
        total: `$${totalBudgetVal.toLocaleString()}`,
        breakdown: budgetBreakdown
      },
      hotels: [
        {
          name: hotelName,
          rating: "4.7",
          price: `$${costAccommodationPerNight}/night`,
          description: `Recommended lodging matching your ${budgetLevel} budget. Perfect location with easy transit access.`
        }
      ],
      packingList: knowledge.travelTips.packingTips,
      hiddenGems: knowledge.hiddenGems.map(h => h.title),
      safetyTips: [
        `Safety Score: ${knowledge.safetyScore}/100. Emergency services contact: Police: ${knowledge.emergencyContacts.police}, Medical: ${knowledge.emergencyContacts.medical}.`,
        knowledge.travelTips.touristScams[0] || "Be aware of local street touts and unlicensed guides."
      ],
      travelers,
      companions: travelerCompanions
    };
  }
};
