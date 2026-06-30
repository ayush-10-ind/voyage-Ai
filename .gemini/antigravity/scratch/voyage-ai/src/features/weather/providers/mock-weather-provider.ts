import { WeatherProvider, WeatherData } from "./weather-provider";

export class MockWeatherProvider implements WeatherProvider {
  id = "mock-weather";
  name = "Voyage Weather Intelligence (Simulated)";

  async getForecast(lat: number, lng: number, date: string): Promise<WeatherData> {
    // Stable hash based on lat, lng, and date string
    const dateSum = date ? date.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
    const hash = Math.abs(
      Math.floor(Math.sin(lat) * 12345 + Math.cos(lng) * 67890 + dateSum)
    ) % 100;

    const temp = 15 + (hash % 15); // Temp between 15°C and 30°C
    const humidity = 40 + (hash % 45); // Humidity between 40% and 85%

    const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy", "windy"];
    const condition = conditions[hash % conditions.length];

    const descriptions = {
      sunny: "Clear, sunny skies. Perfect for outdoor sightseeing.",
      cloudy: "Overcast clouds. Light breeze.",
      rainy: "Light rain showers expected. Consider carrying an umbrella.",
      windy: "Gusty winds. Cooler temperatures in open areas.",
      snowy: "Light snow flurries. Wrap up warm.",
    };

    return {
      temp: Math.round(temp),
      condition,
      humidity: Math.round(humidity),
      description: descriptions[condition] || "Mild conditions.",
    };
  }
}
export const weatherProvider = new MockWeatherProvider();
