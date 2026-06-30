import { WeatherProvider, WeatherData } from "./weather-provider";
import { MockWeatherProvider } from "./mock-weather-provider";
import { VoyageLogger } from "@/lib/logger";

export class OpenWeatherProvider implements WeatherProvider {
  id = "open-weather";
  name = "OpenWeather API Provider";

  private fallback = new MockWeatherProvider();
  private apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

  async getForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    if (!this.apiKey) {
      VoyageLogger.warn(
        "OpenWeatherProvider",
        "NEXT_PUBLIC_OPENWEATHER_KEY is missing. Falling back to MockWeatherProvider."
      );
      return this.fallback.getForecast(lat, lng, date);
    }

    try {
      VoyageLogger.info("OpenWeatherProvider", `Fetching real-time weather for coordinates: [${lat}, ${lng}]`);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API returned status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map OpenWeather conditions to Voyage weather conditions
      const rawCondition = data.weather?.[0]?.main?.toLowerCase() || "clear";
      let condition: WeatherData["condition"] = "sunny";

      if (rawCondition.includes("rain") || rawCondition.includes("drizzle")) {
        condition = "rainy";
      } else if (rawCondition.includes("cloud")) {
        condition = "cloudy";
      } else if (rawCondition.includes("snow")) {
        condition = "snowy";
      } else if (rawCondition.includes("wind") || rawCondition.includes("storm")) {
        condition = "windy";
      }

      return {
        temp: Math.round(data.main?.temp ?? 20),
        condition,
        humidity: Math.round(data.main?.humidity ?? 60),
        description: data.weather?.[0]?.description || "Mild weather.",
      };
    } catch (err) {
      VoyageLogger.error(
        "OpenWeatherProvider",
        "Failed to fetch weather from OpenWeather API. Falling back to MockWeatherProvider.",
        err
      );
      return this.fallback.getForecast(lat, lng, date);
    }
  }
}
export const openWeatherProvider = new OpenWeatherProvider();
