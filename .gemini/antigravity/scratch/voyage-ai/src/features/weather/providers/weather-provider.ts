export interface WeatherData {
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy";
  humidity: number;
  description: string;
}

export interface WeatherProvider {
  id: string;
  name: string;
  getForecast(lat: number, lng: number, date: string): Promise<WeatherData>;
}
