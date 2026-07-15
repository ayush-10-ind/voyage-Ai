import { DestinationKnowledgeProvider } from "./knowledge-provider";
import { DestinationKnowledge } from "../types";
import { AUTHENTIC_DESTINATIONS } from "../data/authentic-destinations";
import { VoyageLogger } from "@/lib/logger";

export class MockKnowledgeProvider implements DestinationKnowledgeProvider {
  name = "MockKnowledgeProvider";

  async fetchDestinationKnowledge(destination: string): Promise<DestinationKnowledge | null> {
    const key = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    
    VoyageLogger.info("DestinationIntelligence", `Querying authentic destination knowledge for: "${destination}"`);

    const matchedKey = Object.keys(AUTHENTIC_DESTINATIONS).find(
      k => k === key || key.includes(k) || k.includes(key)
    );

    if (matchedKey) {
      VoyageLogger.info("DestinationIntelligence", `Match found: "${matchedKey}" in authentic database.`);
      return AUTHENTIC_DESTINATIONS[matchedKey];
    }
    
    // Default fallback to Tokyo to ensure no crashes
    VoyageLogger.warn("DestinationIntelligence", `No direct match for "${destination}". Falling back to Tokyo.`);
    return AUTHENTIC_DESTINATIONS["tokyo"];
  }
}
