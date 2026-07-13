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
    const dist = Math.min(Math.max(Number(distance) || 500, 1), 5000);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        throw new Error('Invalid coordinates. Expected numeric longitude (X) and latitude (Y).');
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Coordinates out of range.');
    }

    const token = await getAccessToken();
    const url = new URL(NEARBY_URL);
    url.searchParams.set('X', String(lng));
    url.searchParams.set('Y', String(lat));
    url.searchParams.set('Distance', String(dist));

    const response = await fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data.error?.message
            || data.message
            || data.error
            || `TDX Nearby request failed (${response.status})`;
        const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
        err.status = response.status;
        throw err;
    }

    const value = normalizeNearbyValue(data);
    return {
        ok: true,
        x: lng,
        y: lat,
        distance: dist,
        count: value.length,
        value,
        raw: data
    };
}

function normalizeNearbyValue(data) {
    if (Array.isArray(data?.value)) return data.value;
    if (Array.isArray(data)) return data;

    const groups = [
        ['attraction', data?.RelatedAttractions],
        ['restaurant', data?.RelatedRestaurants],
        ['hotel', data?.RelatedHotels],
        ['service', data?.RelatedTourismServiceSites],
        ['trail', data?.RelatedTrails],
        ['cycling', data?.RelatedCyclingRoutes],
        ['event', data?.RelatedEvents],
        ['bus', data?.RelatedBusStations]
    ];

    const out = [];
    for (const [type, list] of groups) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            out.push({
                type,
                id: item.AttractionID || item.RestaurantID || item.HotelID
                    || item.TourismServiceID || item.TrailID || item.RouteID
                    || item.EventID || item.StationUID || item.StationID || null,
                name: item.AttractionName || item.RestaurantName || item.HotelName
                    || item.TourismServiceName || item.TrailName || item.RouteName
                    || item.EventName || item.StationName || item.Name || null,
                lat: item.PositionLat ?? item.Latitude ?? null,
                lng: item.PositionLon ?? item.Longitude ?? null,
                ...item
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
