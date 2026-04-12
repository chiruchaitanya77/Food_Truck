import { useState, useEffect } from "react";

export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
}

let cachedLocation: GeoLocation | null = null;
let pendingPromise: Promise<GeoLocation> | null = null;

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string | null; country: string | null }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en", "User-Agent": "ShakeCrazy/1.0" } }
    );
    if (!res.ok) return { city: null, country: null };
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      null;
    const country = data.address?.country || null;
    return { city, country };
  } catch {
    return { city: null, country: null };
  }
}

function requestGeoLocation(): Promise<GeoLocation> {
  if (cachedLocation) return Promise.resolve(cachedLocation);
  if (pendingPromise) return pendingPromise;

  pendingPromise = new Promise<GeoLocation>((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: null, longitude: null, city: null, country: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { city, country } = await reverseGeocode(latitude, longitude);
        const result: GeoLocation = { latitude, longitude, city, country };
        cachedLocation = result;
        pendingPromise = null;
        resolve(result);
      },
      () => {
        const result: GeoLocation = { latitude: null, longitude: null, city: null, country: null };
        pendingPromise = null;
        resolve(result);
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  });

  return pendingPromise;
}

export function useGeoLocation(): GeoLocation {
  const [geo, setGeo] = useState<GeoLocation>(
    cachedLocation ?? { latitude: null, longitude: null, city: null, country: null }
  );

  useEffect(() => {
    if (cachedLocation) {
      setGeo(cachedLocation);
      return;
    }
    requestGeoLocation().then(setGeo);
  }, []);

  return geo;
}

export { requestGeoLocation };
