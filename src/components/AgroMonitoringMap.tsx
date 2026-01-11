/**
 * AgroMonitoring Map Component
 * Production-ready Leaflet.js map for displaying AgroMonitoring polygons
 * 
 * Features:
 * - OpenStreetMap tiles (no Mapbox)
 * - GeoJSON polygon rendering with advanced NDVI coloring
 * - Dynamic centering and bounds fitting
 * - Clickable polygons with metadata popups
 * - Permanent NDVI Legend
 * - Rendering fixes (black background prevention)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertTriangle, RefreshCw, MapPin, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    getAllPolygons,
    getPolygonWeather,
    getPolygonNDVI,
    getPolygonSoil,
    getPolygonCenter,
    calculateBounds,
    kelvinToCelsius,
    getNDVIColor,
    getNDVIStatus,
    AgroMonitoringError,
} from '@/lib/agroMonitoringService';
import type { AgroPolygon, AgroWeather, AgroNDVIData, AgroSoilData } from '@/types/agroMonitoringTypes';
import { cn } from '@/lib/utils';

interface AgroMonitoringMapProps {
    onPolygonClick?: (polygonId: string) => void;
    showWeatherOverlay?: boolean;
    showNDVIOverlay?: boolean;
    refreshTrigger?: number;
    className?: string;
}

interface PolygonData {
    polygon: AgroPolygon;
    weather?: AgroWeather;
    ndvi?: AgroNDVIData | null;
    soil?: AgroSoilData;
}

export function AgroMonitoringMap({
    onPolygonClick,
    showWeatherOverlay = false,
    showNDVIOverlay = true,
    refreshTrigger = 0,
    className,
}: AgroMonitoringMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const polygonLayers = useRef<Map<string, L.GeoJSON>>(new Map());
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    const [loading, setLoading] = useState(true);
    const [tilesLoaded, setTilesLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [polygonData, setPolygonData] = useState<PolygonData[]>([]);

    const { toast } = useToast();

    // ===================================
    // INITIALIZE MAP
    // ===================================
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        try {
            // Create map instance
            map.current = L.map(mapContainer.current, {
                center: [23.8103, 90.4125], // Default center (Bangladesh)
                zoom: 7,
                zoomControl: false, // We'll add it manually for better position
                attributionControl: true,
            });

            // Add Esri World Imagery Tiles (Satellite View)
            tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19,
            });

            tileLayerRef.current.addTo(map.current);

            // Access internal tile loading state
            tileLayerRef.current.on('load', () => {
                setTilesLoaded(true);
            });

            // Fallback: if tiles load super fast (cached)
            setTimeout(() => setTilesLoaded(true), 1000);

            // Add zoom control to bottom right
            L.control.zoom({ position: 'bottomright' }).addTo(map.current);

            // Force map invalidation to fix rendering issues
            setTimeout(() => {
                map.current?.invalidateSize();
            }, 200);

        } catch (err) {
            console.error('[AgroMonitoringMap] Map initialization failed:', err);
            setError('ম্যাপ লোড করতে ব্যর্থ');
            setLoading(false);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (map.current) {
                map.current.invalidateSize();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // ===================================
    // FETCH POLYGON DATA
    // ===================================
    const fetchPolygonData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all polygons
            const polygons = await getAllPolygons();

            if (polygons.length === 0) {
                throw new AgroMonitoringError(
                    'No polygons found',
                    'কোনো পলিগন পাওয়া যায়নি',
                    404
                );
            }

            // Fetch additional data for each polygon (in parallel)
            const dataPromises = polygons.map(async (polygon) => {
                const [weather, ndvi, soil] = await Promise.allSettled([
                    getPolygonWeather(polygon.id),
                    getPolygonNDVI(polygon.id),
                    getPolygonSoil(polygon.id),
                ]);

                return {
                    polygon,
                    weather: weather.status === 'fulfilled' ? weather.value : undefined,
                    ndvi: ndvi.status === 'fulfilled' ? ndvi.value : null,
                    soil: soil.status === 'fulfilled' ? soil.value : undefined,
                };
            });

            const data = await Promise.all(dataPromises);
            setPolygonData(data);

            // Fit map to polygon bounds
            if (map.current && polygons.length > 0) {
                const bounds = calculateBounds(polygons);
                if (bounds) {
                    map.current.fitBounds(bounds, { padding: [50, 50] });
                }
            }

        } catch (err) {
            console.error('[AgroMonitoringMap] Failed to fetch polygon data:', err);

            const errorMessage = err instanceof AgroMonitoringError
                ? err.messageBn
                : 'ডেটা লোড করতে ব্যর্থ';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data on mount and refresh trigger
    useEffect(() => {
        fetchPolygonData();
    }, [fetchPolygonData, refreshTrigger]);

    // ===================================
    // RENDER POLYGONS ON MAP
    // ===================================
    useEffect(() => {
        if (!map.current || polygonData.length === 0) return;

        // Clear existing polygon layers
        polygonLayers.current.forEach(layer => {
            if (map.current) {
                map.current.removeLayer(layer);
            }
        });
        polygonLayers.current.clear();

        // Render each polygon
        polygonData.forEach(({ polygon, weather, ndvi, soil }) => {
            if (!map.current) return;

            // Determine polygon color based on NDVI
            let fillColor = '#3b82f6'; // Default blue
            if (showNDVIOverlay && ndvi?.data?.mean !== undefined) {
                fillColor = getNDVIColor(ndvi.data.mean);
            }

            // Create GeoJSON layer
            const geoJsonLayer = L.geoJSON(polygon.geo_json, {
                style: {
                    color: '#ffffff', // White border
                    weight: 2,
                    opacity: 1,
                    fillColor: fillColor,
                    fillOpacity: 0.6,
                },
                onEachFeature: (feature, layer) => {
                    // Create popup content
                    const center = getPolygonCenter(polygon);
                    const areaHectares = polygon.area.toFixed(2);

                    let ndviMean = 0;
                    if (ndvi?.data?.mean !== undefined) ndviMean = ndvi.data.mean;
                    const { statusBn } = getNDVIStatus(ndviMean);

                    let popupContent = `
            <div style="font-family: system-ui, sans-serif; min-width: 220px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                ${polygon.name || 'পলিগন #' + polygon.id.slice(-6)}
              </h3>
              
              <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280;">এলাকা:</span>
                  <span style="font-weight: 600; color: #374151;">${areaHectares} হেক্টর</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280;">অবস্থান:</span>
                  <span style="font-weight: 500; font-family: monospace; font-size: 11px; color: #4b5563;">
                    ${center[0].toFixed(3)}, ${center[1].toFixed(3)}
                  </span>
                </div>
          `;

                    // Add NDVI data if available
                    if (ndvi?.data?.mean !== undefined) {
                        const ndviPercent = (ndvi.data.mean * 100).toFixed(0);
                        const ndviColor = getNDVIColor(ndvi.data.mean);

                        popupContent += `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #6b7280; font-weight: 500;">NDVI স্বাস্থ্য:</span>
                    <span style="font-weight: 700; color: ${ndviColor}; background: ${ndviColor}15; padding: 2px 6px; rounded: 4px; border-radius: 4px;">
                        ${statusBn} (${ndviPercent}%)
                    </span>
                 </div>
              </div>
            `;
                    }

                    // Add weather data if available
                    if (weather?.main) {
                        const tempC = kelvinToCelsius(weather.main.temp).toFixed(1);
                        popupContent += `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                  <div style="background: #f3f4f6; padding: 6px; border-radius: 6px; text-align: center;">
                    <span style="display: block; font-size: 10px; color: #6b7280;">তাপমাত্রা</span>
                    <span style="font-weight: 600; color: #1f2937;">${tempC}°C</span>
                  </div>
                  <div style="background: #f3f4f6; padding: 6px; border-radius: 6px; text-align: center;">
                    <span style="display: block; font-size: 10px; color: #6b7280;">আর্দ্রতা</span>
                    <span style="font-weight: 600; color: #1f2937;">${weather.main.humidity}%</span>
                  </div>
              </div>
            `;
                    }

                    popupContent += `</div></div>`;

                    // Bind popup
                    layer.bindPopup(popupContent, {
                        maxWidth: 300,
                        className: 'agro-popup',
                    });

                    // Handle click
                    layer.on('click', () => {
                        onPolygonClick?.(polygon.id);

                        // Highlight selection style
                        polygonLayers.current.forEach((l) => {
                            l.resetStyle();
                        });

                        // Type assertion for Leaflet Path methods
                        if ('setStyle' in layer) {
                            (layer as L.Path).setStyle({
                                weight: 3,
                                color: '#000',
                                fillOpacity: 0.8
                            });
                        }
                    });

                    // Highlight on hover
                    layer.on('mouseover', () => {
                        if ('setStyle' in layer) {
                            (layer as L.Path).setStyle({
                                weight: 3,
                                fillOpacity: 0.8
                            });
                        }
                    });

                    layer.on('mouseout', () => {
                        // Only reset if not selected (simplified logic for now)
                        if ('setStyle' in layer) {
                            (layer as L.Path).setStyle({
                                weight: 2,
                                color: '#ffffff',
                                fillOpacity: 0.6
                            });
                        }
                    });
                },
            });

            geoJsonLayer.addTo(map.current);
            polygonLayers.current.set(polygon.id, geoJsonLayer);
        });

    }, [polygonData, showNDVIOverlay, onPolygonClick]);

    // ===================================
    // SYNC SATELLITE CONTEXT (Innovation Edge)
    // ===================================
    useEffect(() => {
        if (polygonData.length > 0) {
            // Find the most critical polygon (lowest NDVI or active warning)
            const criticalPoly = polygonData.find(d => d.ndvi?.data?.mean !== undefined && d.ndvi.data.mean < 0.3);

            if (criticalPoly && criticalPoly.weather && criticalPoly.ndvi?.data?.mean) {
                const context = {
                    ndvi: criticalPoly.ndvi.data.mean,
                    status: 'Low/Stressed',
                    temp: kelvinToCelsius(criticalPoly.weather.main.temp).toFixed(1),
                    humidity: criticalPoly.weather.main.humidity,
                    alert: 'Possible Nitrogen Deficiency or Water Stress detected from Satellite'
                };
                sessionStorage.setItem('currentSatelliteContext', JSON.stringify(context));
                console.log('Satellite Context Synced:', context);
            } else {
                // Fallback: Use the first polygon's data if available
                const first = polygonData[0];
                if (first && first.weather && first.ndvi?.data?.mean) {
                    const context = {
                        ndvi: first.ndvi.data.mean,
                        status: getNDVIStatus(first.ndvi.data.mean).status,
                        temp: kelvinToCelsius(first.weather.main.temp).toFixed(1),
                        humidity: first.weather.main.humidity,
                        alert: 'Routine Check'
                    };
                    sessionStorage.setItem('currentSatelliteContext', JSON.stringify(context));
                }
            }
        }
    }, [polygonData]);

    // ===================================
    // HANDLERS
    // ===================================
    const handleRecenter = useCallback(() => {
        if (!map.current || polygonData.length === 0) return;

        const polygons = polygonData.map(d => d.polygon);
        const bounds = calculateBounds(polygons);

        if (bounds) {
            map.current.invalidateSize(); // Ensure size is correct before fitting
            map.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [polygonData]);

    // ===================================
    // RENDER
    // ===================================
    return (
        <div className={cn('relative rounded-xl overflow-hidden border border-border bg-muted/20 w-full', className)}>
            {/* Map Container - Explicit ID for safety */}
            <div
                ref={mapContainer}
                id="agro-map-container"
                className="absolute inset-0 z-0 bg-[#f0f0f0]"
                style={{ height: '100%', width: '100%' }}
            />

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">AgroMonitoring ডেটা লোড হচ্ছে...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                    <div className="text-center p-6 max-w-sm">
                        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                        <h3 className="font-semibold text-lg mb-1">সমস্যা হয়েছে</h3>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button size="sm" variant="outline" onClick={() => fetchPolygonData()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            পুনরায় চেষ্টা করুন
                        </Button>
                    </div>
                </div>
            )}

            {/* Controls */}
            {(!loading || tilesLoaded) && !error && (
                <>
                    {/* Top Left - Info Badge */}
                    <div className="absolute top-3 left-3 z-[1000] flex gap-2">
                        <Badge variant="secondary" className="bg-background/95 backdrop-blur-md shadow-lg border border-border">
                            <MapPin className="w-3 h-3 mr-1" />
                            {polygonData.length} পলিগন
                        </Badge>
                    </div>

                    {/* Top Right - Action Buttons */}
                    <div className="absolute top-3 right-3 z-[1000] flex gap-2">
                        <div className="bg-background/95 backdrop-blur-md shadow-lg border border-border rounded-md flex">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-r-none border-r"
                                onClick={handleRecenter}
                                title="কেন্দ্রে ফিরুন"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-l-none"
                                onClick={() => fetchPolygonData()}
                                title="রিফ্রেশ করুন"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Bottom Left - Legend */}
                    {showNDVIOverlay && (
                        <div className="absolute bottom-3 left-3 z-[1000] bg-background/95 backdrop-blur-md rounded-lg px-3 py-2.5 shadow-lg border border-border w-52">
                            <div className="text-xs font-semibold mb-2 flex items-center justify-between">
                                NDVI স্বাস্থ্য সূচক
                                <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">MODIS/Sent.</span>
                            </div>

                            {/* Formula Display */}
                            <div className="mb-3 p-1.5 bg-muted/50 rounded text-[10px] font-mono text-center border border-border/50 text-muted-foreground">
                                NDVI = (NIR - Red) / (NIR + Red)
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                                        <span>চমৎকার (ঘন গাছপালা)</span>
                                    </div>
                                    <span className="opacity-70">&gt; 0.7</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                                        <span>ভাল</span>
                                    </div>
                                    <span className="opacity-70">0.6 - 0.7</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                                        <span>মাঝারি</span>
                                    </div>
                                    <span className="opacity-70">0.4 - 0.6</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                                        <span>দুর্বল</span>
                                    </div>
                                    <span className="opacity-70">0.2 - 0.4</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                                        <span>সংকটজনক</span>
                                    </div>
                                    <span className="opacity-70">&lt; 0.2</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Custom Popup Styles */}
            <style>{`
        .agro-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 0;
          border: 1px solid #e5e7eb;
        }
        .agro-popup .leaflet-popup-content {
          margin: 16px;
          line-height: 1.5;
        }
        .agro-popup .leaflet-popup-tip {
          background: white;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-left: none;
        }
        .agro-popup a.leaflet-popup-close-button {
          top: 12px;
          right: 12px;
          color: #9ca3af;
          padding: 0;
          width: 20px;
          height: 20px;
          font-size: 16px;
        }
        .agro-popup a.leaflet-popup-close-button:hover {
          color: #4b5563;
        }
      `}</style>
        </div>
    );
}

export default AgroMonitoringMap;
