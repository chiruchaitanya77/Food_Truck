export interface GeoInfo {
  ip: string;
  city: string | null;
  country: string | null;
  region: string | null;
  lat: number | null;
  lon: number | null;
}

export function getRealIp(req: import("express").Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const firstIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(",")[0].trim();
    if (firstIp && firstIp !== "::1" && firstIp !== "127.0.0.1") return firstIp;
  }
  return req.ip || "unknown";
}

export async function geolocateIp(ip: string): Promise<GeoInfo> {
  const base: GeoInfo = { ip, city: null, country: null, region: null, lat: null, lon: null };
  // if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("172.") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
  //   return base;
  // }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,regionName,lat,lon`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return base;
    const data = await res.json() as any;
    if (data.status !== "success") return base;
    return {
      ip,
      city: data.city || null,
      country: data.country || null,
      region: data.regionName || null,
      lat: data.lat || null,
      lon: data.lon || null,
    };
  } catch {
    return base;
  }
}


export async function resolveLocation(
    ip: string,
    latitude?: number,
    longitude?: number
): Promise<GeoInfo> {
  // 1️⃣ Try IP first
  const geo = await geolocateIp(ip);

  if (geo.city && geo.country) {
    return geo; // ✅ IP worked
  }

  // 2️⃣ Fallback to lat/lon
  if (typeof latitude === "number" && typeof longitude === "number") {
    try {
      const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (res.ok) {
        const data = await res.json();

        return {
          ip,
          city: data.city || data.locality || null,
          country: data.countryName || null,
          region: data.principalSubdivision || null,
          lat: latitude,
          lon: longitude,
        };
      }
    } catch (err) {
      console.error("Reverse geo failed:", err);
    }
  }

  // 3️⃣ Final fallback (return whatever IP gave)
  return geo;
}
