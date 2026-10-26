
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "./Checkposts.css";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const defaultCenter = [20.5937, 78.9629];

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13, { duration: 1 });
  }, [center, map]);

  return null;
}

function createIcon(color) {
  return L.divIcon({
    className: "checkpost-marker",
    html: `<div style="background:${color};width:18px;height:18px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0005"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const checkpostIcon = createIcon("#2563eb");
const userIcon = createIcon("#16a34a");

export default function Checkposts() {
  const [center, setCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [radius, setRadius] = useState("10000");
  const [query, setQuery] = useState("police");
  const [selectedPlace, setSelectedPlace] = useState(null);

  async function findNearby() {
    setLoading(true);
    setError("");
    setPlaces([]);
    setSelectedPlace(null);

    const [lat, lon] = center;
    const distance = Number(radius);

    const filters = query === "checkpost"
      ? [
          'node["amenity"="police"]["name"~"check.?post|checkpoint",i]',
          'way["amenity"="police"]["name"~"check.?post|checkpoint",i]',
          'relation["amenity"="police"]["name"~"check.?post|checkpoint",i]',
        ]
      : [
          'node["amenity"="police"]',
          'way["amenity"="police"]',
          'relation["amenity"="police"]',
        ];

    const queryText = `
      [out:json][timeout:25];
      (
        ${filters.map((f) => `${f}(around:${distance},${lat},${lon});`).join("\n")}
      );
      out center tags;
    `;

    try {
      const response = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: queryText }),
      });

      if (!response.ok) {
        throw new Error("Map search is temporarily unavailable. Try again.");
      }

      const data = await response.json();

      const results = (data.elements || [])
        .map((item) => {
          const itemLat = item.lat ?? item.center?.lat;
          const itemLon = item.lon ?? item.center?.lon;

          if (itemLat == null || itemLon == null) return null;

          const distanceKm = calculateDistance(lat, lon, itemLat, itemLon);

          return {
            id: `${item.type}-${item.id}`,
            name: item.tags?.name || "Unnamed police location",
            lat: itemLat,
            lon: itemLon,
            distanceKm,
            type: item.tags?.amenity || "police",
            verified: false,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setPlaces(results);

      if (!results.length) {
        setError("No matching locations found in this area. Try a larger search radius.");
      }
    } catch (err) {
      setError(err.message || "Unable to search map locations.");
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Location services are not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserLocation(location);
        setCenter(location);
        setError("");
      },
      () => {
        setError("Location permission denied or unavailable. You can still search the map manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    if (userLocation) findNearby();
    // Search once after the user explicitly shares their location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  return (
    <main className="checkposts-page">
      <header className="checkposts-header">
        <div>
          <p className="checkposts-eyebrow">LOCATION SERVICES</p>
          <h1>Checkposts & Nearby Locations</h1>
          <p>Explore mapped police locations and access directions.</p>
        </div>
        <button className="location-button" onClick={useMyLocation}>
          Use My Location
        </button>
      </header>

      <section className="checkposts-controls">
        <label>
          Search category
          <select value={query} onChange={(e) => setQuery(e.target.value)}>
            <option value="police">Police stations and mapped police locations</option>
            <option value="checkpost">Locations named as checkposts</option>
          </select>
        </label>

        <label>
          Search radius
          <select value={radius} onChange={(e) => setRadius(e.target.value)}>
            <option value="3000">3 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="25000">25 km</option>
          </select>
        </label>

        <button onClick={findNearby} disabled={loading}>
          {loading ? "Searching..." : "Search Map"}
        </button>
      </section>

      {error && <p className="checkposts-message">{error}</p>}

      <section className="checkposts-layout">
        <div className="checkposts-map">
          <MapContainer center={center} zoom={5} scrollWheelZoom>
            <MapUpdater center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>Your approximate device location</Popup>
              </Marker>
            )}

            {places.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lon]}
                icon={checkpostIcon}
                eventHandlers={{
                  click: () => setSelectedPlace(place),
                }}
              >
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  {place.distanceKm.toFixed(2)} km away
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="checkposts-results">
          <h2>Search Results</h2>
          <p className="results-caption">
            {places.length} mapped location(s) found
          </p>

          {places.map((place) => (
            <article className="checkpost-card" key={place.id}>
              <h3>{place.name}</h3>
              <p>{place.distanceKm.toFixed(2)} km from search center</p>
              <p className="unverified-label">
                Not independently verified
              </p>

              <div className="checkpost-actions">
                <button onClick={() => {
                  setSelectedPlace(place);
                  setCenter([place.lat, place.lon]);
                }}>
                  Show on Map
                </button>

                <a
                  href={`https://www.openstreetmap.org/directions?from=${center[0]},${center[1]}&to=${place.lat},${place.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Directions
                </a>

                <button onClick={() => {
                  setSelectedPlace(place);
                  document.getElementById("incident-report")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}>
                  Report Incident
                </button>
              </div>
            </article>
          ))}

          {!loading && places.length === 0 && (
            <p>Use your location or search the map to find mapped locations.</p>
          )}
        </aside>
      </section>

      <section className="incident-placeholder" id="incident-report">
        <h2>Report an Incident</h2>
        <p>
          {selectedPlace
            ? `Selected location: ${selectedPlace.name}`
            : "Choose a location from the map or results list to begin a report."}
        </p>
        <p>
          Next, we will connect this section to the backend so reports are
          stored securely and assigned a reference number.
        </p>
      </section>
    </main>
  );
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}
