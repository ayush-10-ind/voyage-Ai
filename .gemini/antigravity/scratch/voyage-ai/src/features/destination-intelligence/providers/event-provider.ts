import { EventsProvider, ProviderEvent } from "./interfaces";
import { Coordinate } from "../types";

const WORLD_EVENTS: Array<{
  id: string;
  destination: string;
  title: string;
  description: string;
  month: number;
  category: "festival" | "concert" | "sports" | "exhibition" | "holiday" | "other";
  venueName: string;
  coordinates: Coordinate;
}> = [
  {
    id: "cherry-blossom",
    destination: "tokyo",
    title: "Cherry Blossom Hanami Festival",
    description: "Famous peak Sakura blooms under lanterns and street food stalls.",
    month: 4,
    category: "festival",
    venueName: "Shinjuku Gyoen / Yoyogi Park",
    coordinates: { lat: 35.6852, lng: 139.7101 }
  },
  {
    id: "christmas-market-paris",
    destination: "paris",
    title: "Champs-Élysées Christmas Markets",
    description: "Gorgeous wooden chalets selling hot mulled wine, crepes, and ornaments.",
    month: 12,
    category: "festival",
    venueName: "Champs-Élysées Gardens",
    coordinates: { lat: 48.8684, lng: 2.3145 }
  },
  {
    id: "christmas-market-rome",
    destination: "rome",
    title: "Piazza Navona Christmas Fair",
    description: "Centuries-old holiday festival with carousels, street performers, and sweet treats.",
    month: 12,
    category: "festival",
    venueName: "Piazza Navona",
    coordinates: { lat: 41.8989, lng: 12.4731 }
  },
  {
    id: "diwali-india",
    destination: "jaipur",
    title: "Diwali Festival of Lights",
    description: "The entire Pink City is illuminated with lights, oil lamps, and fireworks.",
    month: 10,
    category: "festival",
    venueName: "Jaipur Old City Markets",
    coordinates: { lat: 26.9239, lng: 75.8267 }
  },
  {
    id: "taj-mahotsav",
    destination: "agra",
    title: "Taj Mahotsav Crafts Carnival",
    description: "Grand cultural celebration featuring folk music, heritage crafts, and local dining stalls.",
    month: 2,
    category: "festival",
    venueName: "Shilpgram Craft Village",
    coordinates: { lat: 27.1691, lng: 78.0475 }
  },
  {
    id: "jaipur-lit-fest",
    destination: "jaipur",
    title: "Jaipur Literature Festival",
    description: "The world's largest free literature festival hosting Nobel laureates and readers.",
    month: 1,
    category: "festival",
    venueName: "Diggi Palace Jaipur",
    coordinates: { lat: 26.9068, lng: 75.8082 }
  }
];

export class LocalEventProvider implements EventsProvider {
  name = "LocalEventProvider";

  async fetchEvents(destination: string, startDateStr: string, endDateStr: string): Promise<ProviderEvent[]> {
    const key = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    
    // Parse month from startDateStr
    let monthNum = new Date().getMonth() + 1;
    if (startDateStr) {
      const date = new Date(startDateStr);
      if (!isNaN(date.getTime())) {
        monthNum = date.getMonth() + 1;
      }
    }

    const matches = WORLD_EVENTS.filter(e => 
      e.destination.includes(key) || key.includes(e.destination)
    );

    return matches.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      startDate: startDateStr || "2026-04-01",
      endDate: endDateStr || "2026-04-05",
      venueName: m.venueName,
      coordinates: m.coordinates,
      category: m.category
    }));
  }
}
