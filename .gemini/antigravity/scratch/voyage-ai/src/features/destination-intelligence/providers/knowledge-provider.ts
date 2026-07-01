import { DestinationKnowledge } from "../types";

export interface DestinationKnowledgeProvider {
  name: string;
  fetchDestinationKnowledge(destination: string): Promise<DestinationKnowledge | null>;
}
