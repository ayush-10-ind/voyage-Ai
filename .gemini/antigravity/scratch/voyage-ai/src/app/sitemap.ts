import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["", "/explore", "/about"].map((route) => ({
    url: `${SITE_CONFIG.url}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return [...routes];
}
