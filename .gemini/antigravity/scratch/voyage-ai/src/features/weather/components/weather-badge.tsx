import React, { useState, useEffect } from "react";
import { weatherProvider } from "../providers/mock-weather-provider";
import { WeatherData } from "../providers/weather-provider";
import { Icons } from "@/components/ui/icons";
import { VoyageLogger } from "@/lib/logger";

interface WeatherBadgeProps {
  lat?: number;
  lng?: number;
  date: string;
}

export function WeatherBadge({ lat = 35.6762, lng = 139.6503, date }: WeatherBadgeProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      VoyageLogger.info("Navigation", "Transition: Travel Brain → Weather (Loading Weather Badges)");
      setLoading(true);
      try {
        const data = await weatherProvider.getForecast(lat, lng, date);
        setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather forecast:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng, date]);

  if (loading || !weather) {
    return (
      <div className="h-5 w-12 bg-white/5 animate-pulse rounded-md border border-white/5" />
    );
  }

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Icons.weatherSun className="h-3.5 w-3.5 text-amber-400" />;
      case "rainy":
        return <Icons.weatherCloud className="h-3.5 w-3.5 text-blue-400" />; // Fallback to cloud with blue color
      case "windy":
      case "cloudy":
      default:
        return <Icons.weatherCloud className="h-3.5 w-3.5 text-muted-foreground/80" />;
    }
  };

  return (
    <div
      title={`${weather.temp}°C - ${weather.description}`}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-muted-foreground hover:text-white hover:border-white/10 transition-colors pointer-events-auto cursor-help"
    >
      {getWeatherIcon()}
      <span className="font-bold text-white/90">{weather.temp}°C</span>
    </div>
  );
}
