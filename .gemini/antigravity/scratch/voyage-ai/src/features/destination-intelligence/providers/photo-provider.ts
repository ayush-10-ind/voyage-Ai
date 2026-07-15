import { AUTHENTIC_DESTINATIONS } from "../data/authentic-destinations";
import { VoyageLogger } from "@/lib/logger";

export interface PlaceImageProvider {
  name: string;
  getImages(placeName: string, destination: string): Promise<string[]>;
}

// 1. Google Places Photos Provider (Live Client-Side Integration!)
export class GooglePlacesPhotoProvider implements PlaceImageProvider {
  name = "GooglePlacesPhotoProvider";
  
  async getImages(placeName: string, destination: string): Promise<string[]> {
    return new Promise((resolve) => {
      try {
        const google = (window as any).google;
        if (!google || !google.maps || !google.maps.places) {
          resolve([]);
          return;
        }

        VoyageLogger.info("PhotoProvider", `Querying Google Places Service for "${placeName}, ${destination}"`);
        const dummyDiv = document.createElement("div");
        const service = new google.maps.places.PlacesService(dummyDiv);

        service.findPlaceFromQuery(
          {
            query: `${placeName}, ${destination}`,
            fields: ["photos", "place_id"]
          },
          (results: any, status: any) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0]?.photos
            ) {
              const urls = results[0].photos.map((p: any) =>
                p.getUrl({ maxWidth: 800, maxHeight: 600 })
              );
              VoyageLogger.info("PhotoProvider", `Google Places returned ${urls.length} photos for "${placeName}".`);
              resolve(urls);
            } else {
              resolve([]);
            }
          }
        );
      } catch (e) {
        resolve([]);
      }
    });
  }
}

// 2. Wikipedia Live Search + Summary Image Provider (100% Live, CORS Enabled!)
export class WikipediaMediaProvider implements PlaceImageProvider {
  name = "WikipediaMediaProvider";
  
  async getImages(placeName: string, destination: string): Promise<string[]> {
    try {
      const cleanName = placeName.replace(/\[Hidden Gem\]\s*/i, "").trim();
      
      // Prevent querying generic restaurant terms on Wikipedia
      const generics = ["lunch", "dinner", "walk", "transit", "bistro", "cafe", "restaurant", "hotel"];
      if (generics.some(g => cleanName.toLowerCase().includes(g))) {
        return [];
      }

      // Step 1: Search Wikipedia to resolve the best matching page title
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanName + " " + destination)}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return [];

      const searchData = await searchRes.json();
      const firstResult = searchData.query?.search?.[0];
      if (!firstResult) return [];

      const resolvedTitle = firstResult.title;

      // Step 2: Fetch the summary and page media for this resolved title
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(resolvedTitle.replace(/\s+/g, "_"))}`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) return [];

      const data = await summaryRes.json();
      const images: string[] = [];

      if (data.originalimage?.source) {
        images.push(data.originalimage.source);
      }
      if (data.thumbnail?.source && !images.includes(data.thumbnail.source)) {
        images.push(data.thumbnail.source);
      }

      if (images.length > 0) {
        VoyageLogger.info("PhotoProvider", `Live Wikipedia search resolved "${placeName}" to "${resolvedTitle}" and returned ${images.length} images.`);
      }

      return images;
    } catch (e) {
      return [];
    }
  }
}

// 3. Unsplash Thematic Stock Image Provider
export class UnsplashProvider implements PlaceImageProvider {
  name = "UnsplashProvider";
  
  async getImages(placeName: string, destination: string): Promise<string[]> {
    const q = placeName.toLowerCase();
    const dest = destination.toLowerCase();

    // 1. Food & Dining
    if (q.includes("lunch") || q.includes("dinner") || q.includes("bistro") || q.includes("restaurant") || q.includes("dining") || q.includes("food") || q.includes("eat")) {
      return ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80"];
    }
    // 2. Cafe & Coffee
    if (q.includes("cafe") || q.includes("coffee") || q.includes("espresso") || q.includes("tea")) {
      return ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80"];
    }
    // 3. Hotel / Room
    if (q.includes("hotel") || q.includes("hostel") || q.includes("stay") || q.includes("resort") || q.includes("inn")) {
      return ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80"];
    }
    // 4. Nature & Walk
    if (q.includes("walk") || q.includes("park") || q.includes("garden") || q.includes("promenade") || q.includes("lake") || q.includes("forest")) {
      return ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&auto=format&fit=crop&q=80"];
    }
    // 5. Transit & Train
    if (q.includes("transit") || q.includes("metro") || q.includes("train") || q.includes("bus") || q.includes("taxi")) {
      return ["https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=400&auto=format&fit=crop&q=80"];
    }

    // City Specific Fallbacks
    if (dest.includes("rome")) {
      return ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("tokyo")) {
      return ["https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("kyoto")) {
      return ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("paris")) {
      return ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("agra")) {
      return ["https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("jaipur")) {
      return ["https://images.unsplash.com/photo-1477587458883-471a5ed94245?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("london")) {
      return ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=80"];
    }
    if (dest.includes("newyork")) {
      return ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=80"];
    }

    return ["https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=400&auto=format&fit=crop&q=80"];
  }
}

// 4. Curated Mock Database Provider (Highly Reliable offline match)
export class MockImageProvider implements PlaceImageProvider {
  name = "MockImageProvider";
  
  async getImages(placeName: string, destination: string): Promise<string[]> {
    const key = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const cleanPlace = placeName.replace(/\[Hidden Gem\]\s*/i, "").toLowerCase().trim();
    
    const destData = AUTHENTIC_DESTINATIONS[key] || AUTHENTIC_DESTINATIONS["tokyo"];
    const allAtts = (destData.mustVisitAttractions || []).concat(destData.hiddenGems || []);
    
    const matched = allAtts.find(
      a => a.title.toLowerCase().trim() === cleanPlace || cleanPlace.includes(a.title.toLowerCase().trim())
    );
    if (matched && matched.images && matched.images.length > 0) {
      return matched.images;
    }

    const fallbacks: Record<string, string[]> = {
      tokyo: ["https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80"],
      kyoto: ["https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80"],
      rome: ["https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80"],
      paris: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80"],
      agra: ["https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&auto=format&fit=crop&q=80"],
      jaipur: ["https://images.unsplash.com/photo-1477587458883-471a5ed94245?w=400&auto=format&fit=crop&q=80"],
      ladakh: ["https://images.unsplash.com/photo-1596395819057-e37f55a8516f?w=400&auto=format&fit=crop&q=80"],
      newyork: ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=80"],
      london: ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=80"]
    };

    return fallbacks[key] || fallbacks["tokyo"];
  }
}

// Aggregate Photo Provider coordinating Cache (localStorage) and providers order
export class AggregatePhotoProvider implements PlaceImageProvider {
  name = "AggregatePhotoProvider";
  private providers: PlaceImageProvider[] = [
    new GooglePlacesPhotoProvider(),
    new WikipediaMediaProvider(),
    new UnsplashProvider(),
    new MockImageProvider()
  ];

  async getImages(placeName: string, destination: string): Promise<string[]> {
    const cacheKey = `place_photos_${placeName.replace(/\s+/g, "_")}_${destination}`;
    
    // 1. Check local cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { urls, timestamp } = JSON.parse(cached);
        const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays < 30 && urls && urls.length > 0) {
          return urls;
        }
      }
    } catch (e) {}

    // 2. Query providers in order
    for (const provider of this.providers) {
      try {
        const images = await provider.getImages(placeName, destination);
        if (images && images.length > 0) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              urls: images,
              timestamp: Date.now()
            }));
          } catch (e) {}
          return images;
        }
      } catch (e) {}
    }

    return [];
  }
}

export const placePhotoProvider = new AggregatePhotoProvider();
