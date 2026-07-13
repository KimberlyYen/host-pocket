/**
 * TDX (Transport Data eXchange) OAuth + Tourism helpers.
 * https://tdx.transportdata.tw/
 */

const TOKEN_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
const NEARBY_URL = 'https://tdx.transportdata.tw/api/tourism/service/odata/V2/Tourism/Nearby';

let cachedToken = null;
let cachedExpiresAt = 0;

function isTdxConfigured() {
    return Boolean(process.env.TDX_CLIENT_ID && process.env.TDX_CLIENT_SECRET);
}

async function getAccessToken() {
    if (!isTdxConfigured()) {
        throw new Error('TDX is not configured. Set TDX_CLIENT_ID and TDX_CLIENT_SECRET.');
    }

    const now = Date.now();
    if (cachedToken && now < cachedExpiresAt - 60_000) {
        return cachedToken;
    }

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.TDX_CLIENT_ID,
        client_secret: process.env.TDX_CLIENT_SECRET
    });

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
        const message = data.error_description || data.error || `TDX token request failed (${response.status})`;
        throw new Error(message);
    }

    cachedToken = data.access_token;
    const expiresInSec = Number(data.expires_in) || 86400;
    cachedExpiresAt = now + (expiresInSec * 1000);
    return cachedToken;
}

/**
 * Nearby tourism POIs.
 * TDX uses X = longitude, Y = latitude.
 */
async function fetchNearbyTourism({ longitude, latitude, distance = 500 }) {
    const lng = Number(longitude);
    const lat = Number(latitude);
    // TDX Nearby rejects Distance > 1000 (returns HTTP 400 with empty body).
    const dist = Math.min(Math.max(Math.round(Number(distance) || 500), 1), 1000);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        throw new Error('Invalid coordinates. Expected numeric longitude (X) and latitude (Y).');
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Coordinates out of range.');
    }

    const token = await getAccessToken();
    // Round to ~0.1m precision — long float strings can confuse some TDX validators.
    const x = Number(lng.toFixed(6));
    const y = Number(lat.toFixed(6));
    const url = new URL(NEARBY_URL);
    url.searchParams.set('X', String(x));
    url.searchParams.set('Y', String(y));
    url.searchParams.set('Distance', String(dist));

    const response = await fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    const rawText = await response.text();
    let data = {};
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = { message: rawText };
    }

    if (!response.ok) {
        const message = data.error?.message
            || data.message
            || data.error
            || (response.status === 400
                ? 'TDX Nearby rejected the query (Distance must be 1–1000 meters).'
                : `TDX Nearby request failed (${response.status})`);
        const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
        err.status = response.status;
        throw err;
    }

    const value = normalizeNearbyValue(data);
    return {
        ok: true,
        x,
        y,
        distance: dist,
        count: value.length,
        value,
        raw: data
    };
}

function normalizeNearbyValue(data) {
    // Prefer a non-empty OData-style list; ignore empty `value: []` placeholders.
    if (Array.isArray(data?.value) && data.value.length) return data.value;
    if (Array.isArray(data) && data.length) return data;

    const groups = [
        ['attraction', data?.RelatedAttractions],
        ['restaurant', data?.RelatedRestaurants],
        ['hotel', data?.RelatedHotels],
        ['service', data?.RelatedTourismServiceSites],
        ['trail', data?.RelatedTrails],
        ['cycling', data?.RelatedCyclingRoutes],
        ['event', data?.RelatedEvents],
        ['bus', data?.RelatedBusStations],
        ['bus', data?.RelatedBusStops],
        ['bus', data?.RelatedInterCityBusStations],
        ['bus', data?.RelatedInterCityBusStops],
        ['bike', data?.RelatedBikeStations],
        ['metro', data?.RelatedMetroStations],
        ['rail', data?.RelatedThsrRailStations],
        ['rail', data?.RelatedTraRailStations],
        ['airport', data?.RelatedAirports],
        ['port', data?.RelatedPorts]
    ];

    const out = [];
    for (const [type, list] of groups) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            const name = item.AttractionName || item.RestaurantName || item.HotelName
                || item.TourismServiceName || item.TrailName || item.RouteName
                || item.EventName || item.StationName || item.Name || null;
            out.push({
                ...item,
                type,
                id: item.AttractionID || item.RestaurantID || item.HotelID
                    || item.TourismServiceID || item.TrailID || item.RouteID
                    || item.EventID || item.StationUID || item.StationID || null,
                name,
                AttractionName: item.AttractionName || (type === 'attraction' ? name : item.AttractionName),
                lat: item.PositionLat ?? item.Latitude ?? null,
                lng: item.PositionLon ?? item.Longitude ?? null
            });
        }
    }
    return out;
}

module.exports = {
    isTdxConfigured,
    getAccessToken,
    fetchNearbyTourism,
    normalizeNearbyValue
};
