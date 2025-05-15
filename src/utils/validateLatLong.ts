interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

const ETHIOPIA_BOUNDS: Bounds = {
    north: 15.0,
    south: 3.5,
    east: 48.0,
    west: 33.0
};

export function isWithinBounds(lat: number, lng: number, bounds: Bounds = ETHIOPIA_BOUNDS): boolean {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return false;
    }

    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}
