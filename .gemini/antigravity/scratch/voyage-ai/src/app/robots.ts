import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/settings/", "/admin/"],
    },
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
