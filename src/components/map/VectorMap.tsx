'use client';

import React, { useEffect, useRef, useState } from 'react';

import Script from 'next/script';

import { useLocation } from '@/hooks/location_context';

import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';

// ─── ICON & EVENT SETUP ──────────────────────────────────────────────────────
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet_images/marker-icon-2x.png',
    iconUrl: '/leaflet_images/marker-icon.png',
    shadowUrl: '/leaflet_images/marker-shadow.png'
});
if (!(L.DomEvent as any).fakeStop) {
    (L.DomEvent as any).fakeStop = (e: any) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
    };
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [9.145, 40.489673];
const DEFAULT_ZOOM = 7;

// ─── BASE‐LAYER CONTROL (imperative) ────────────────────────────────────────
function BaseLayerControl({ gmReady }: { gmReady: boolean }) {
    const map = useMap();
    const controlRef = useRef<L.Control.Layers>(null);
    const layerRefs = useRef<{ [name: string]: L.Layer }>({});

    useEffect(() => {
        // 1) Initially add a fallback OSM so you see something immediately:
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        layerRefs.current['OSM Streets'] = osm;

        // 2) Create a simple Layers control with only OSM for now:
        controlRef.current = L.control
            .layers({ 'OSM Streets': osm }, undefined, { position: 'bottomright' })
            .addTo(map);

        return () => {
            controlRef.current?.remove();
            map.removeLayer(osm);
        };
    }, [map]);

    useEffect(() => {
        if (!gmReady || !controlRef.current) return;
        // 3) Google is ready: remove old control & layers
        controlRef.current.remove();
        Object.values(layerRefs.current).forEach((lyr) => map.removeLayer(lyr));

        // 4) Recreate all three base‐layers
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });
        const roads = (L as any).gridLayer.googleMutant({
            type: 'roadmap',
            maxZoom: 19,
            pane: 'tilePane'
        });
        const hybrid = (L as any).gridLayer.googleMutant({
            type: 'hybrid', // satellite + labels
            maxZoom: 19,
            pane: 'tilePane'
        });

        // 5) Add default (roads)
        roads.addTo(map);

        // 6) Build control with all three
        controlRef.current = L.control
            .layers(
                {
                    'Google Roads': roads,
                    'Google Satellite': hybrid,
                    'OSM Streets': osm
                },
                undefined,
                { position: 'bottomright' }
            )
            .addTo(map);

        // 7) Keep refs for cleanup
        layerRefs.current = { osm, roads, hybrid };
    }, [gmReady, map]);

    return null;
}

// ─── VECTOR‐TILE LAYER ───────────────────────────────────────────────────────
function VectorTileLayer({ url }: { url: string }) {
    const map = useMap();
    const getColorByScore = (score: number) => {
        const t = Math.max(0, Math.min(1, (score + 1) / 2));
        const r = Math.round((1 - t) * 255);
        const g = Math.round(t * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}00`;
    };

    useEffect(() => {
        const layer = new (L as any).VectorGrid.Protobuf(url, {
            rendererFactory: (L.canvas as any).tile,
            interactive: false,
            pane: 'overlayPane',
            vectorTileLayerStyles: {}
        });

        layer.once('load', () => {
            const styles: Record<string, any> = {};
            layer.getDataLayerNames().forEach((name: string) => {
                styles[name] = (props: any) => ({
                    fill: true,
                    color: props.outlineColor || 'transparent',
                    weight: props.weight ?? 1,
                    fillColor: props.score != null ? getColorByScore(props.score) : props.color || 'transparent',
                    fillOpacity: props.opacity ?? 0.6,
                    radius: props.radius ?? 10
                });
            });
            layer.options.vectorTileLayerStyles = styles;
            layer.redraw();
        });

        layer.addTo(map);
        return () => void map.removeLayer(layer);
    }, [map, url]);

    return null;
}

// ─── CLICK HANDLER ───────────────────────────────────────────────────────────
function ClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    const { setLat, setLng } = useLocation();
    useMapEvents({
        click(e) {
            console.log('Clicked on map:', e.latlng);
            setLat(e.latlng.lat);
            setLng(e.latlng.lng);
            onClick(e.latlng);
        }
    });
    return null;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function VectorMap({ url }: { url: string }) {
    const [markerPos, setMarkerPos] = useState<L.LatLng | null>(null);
    const [gmReady, setGmReady] = useState(false);

    return (
        <>
            {/* 1) Load Google Maps JS key from .env.local, no index.html edits */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                strategy='afterInteractive'
                onLoad={() => setGmReady(true)}
                onError={(e) => console.error('Google Maps failed to load', e)}
            />

            {/* 2) Map container */}
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                zoomControl
                preferCanvas>
                {/* 3) Imperative base‐layer control */}
                <BaseLayerControl gmReady={gmReady} />

                {/* 4) Your PBF vector‐tiles on overlayPane */}
                <VectorTileLayer url={url} />

                {/* 5) Click to place marker */}
                <ClickHandler onClick={setMarkerPos} />

                {/* 6) Marker & popup */}
                {markerPos && (
                    <Marker position={markerPos}>
                        <Popup>
                            Lat: {markerPos.lat.toFixed(5)}
                            <br />
                            Lng: {markerPos.lng.toFixed(5)}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </>
    );
}
