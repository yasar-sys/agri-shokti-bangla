/**
 * AgroMonitoring Map Component
 * Production-ready Leaflet.js map for displaying AgroMonitoring polygons
 * 
 * Features:
 * - OpenStreetMap tiles (no Mapbox)
 * - GeoJSON polygon rendering
 * - Dynamic centering and bounds fitting
 * - Clickable polygons with metadata popups
 * - Mobile responsive
 * - Graceful error handling
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
    AgroMonitoringError,
} from '@/lib/agroMonitoringService';
import type { AgroPolygon, AgroWeather, AgroNDVIData, AgroSoilData } from '@/types/agroMonitoringTypes';
import { cn } from '@/lib/utils';

interface AgroMonitoringMapProps {
    onPolygonClick?: (polygonId: string) => void;
    showWeatherOverlay?: boolean;
    showNDVIOverlay?: boolean;
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
    className,
}: AgroMonitoringMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);
    const polygonLayers = useRef<Map<string, L.GeoJSON>>(new Map());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [polygonData, setPolygonData] = useState<PolygonData[]>([]);
    const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);

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
                zoom: 10,
                zoomControl: true,
                attributionControl: true,
            });

            // Add OpenStreetMap tiles (as required - no Mapbox)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map.current);

            // Move zoom control to bottom right
            map.current.zoomControl.setPosition('bottomright');

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

            toast({
                title: 'সফল',
                description: `${polygons.length}টি পলিগন লোড হয়েছে`,
            });

        } catch (err) {
            console.error('[AgroMonitoringMap] Failed to fetch polygon data:', err);

            const errorMessage = err instanceof AgroMonitoringError
                ? err.messageBn
                : 'ডেটা লোড করতে ব্যর্থ';

            setError(errorMessage);

            toast({
                title: 'ত্রুটি',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Fetch data on mount
    useEffect(() => {
        fetchPolygonData();
    }, [fetchPolygonData]);

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
            let fillOpacity = 0.3;

            if (showNDVIOverlay && ndvi?.data?.mean !== undefined) {
                const ndviValue = ndvi.data.mean;
                if (ndviValue > 0.6) {
                    fillColor = '#22c55e'; // Green - healthy
                } else if (ndviValue > 0.4) {
                    fillColor = '#eab308'; // Yellow - moderate
                } else if (ndviValue > 0.2) {
                    fillColor = '#f97316'; // Orange - stressed
                } else {
                    fillColor = '#ef4444'; // Red - poor
                }
                fillOpacity = 0.5;
            }

            // Create GeoJSON layer
            const geoJsonLayer = L.geoJSON(polygon.geo_json, {
                style: {
                    color: fillColor,
                    weight: 2,
                    opacity: 0.8,
                    fillColor: fillColor,
                    fillOpacity: fillOpacity,
                },
                onEachFeature: (feature, layer) => {
                    // Create popup content
                    const center = getPolygonCenter(polygon);
                    const areaHectares = polygon.area.toFixed(2);

                    let popupContent = `
            <div style="font-family: system-ui, sans-serif; min-width: 200px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1f2937;">
                ${polygon.name || 'পলিগন #' + polygon.id.slice(-6)}
              </h3>
              
              <div style="display: grid; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">এলাকা:</span>
                  <span style="font-weight: 600;">${areaHectares} হেক্টর</span>
                </div>
                
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">কেন্দ্র:</span>
                  <span style="font-weight: 600; font-family: monospace; font-size: 11px;">
                    ${center[0].toFixed(4)}, ${center[1].toFixed(4)}
                  </span>
                </div>
          `;

                    // Add NDVI data if available
                    if (ndvi?.data?.mean !== undefined) {
                        const ndviPercent = (ndvi.data.mean * 100).toFixed(0);
                        const ndviColor = ndvi.data.mean > 0.6 ? '#22c55e' : ndvi.data.mean > 0.4 ? '#eab308' : '#ef4444';
                        popupContent += `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">NDVI:</span>
                <span style="font-weight: 600; color: ${ndviColor};">${ndviPercent}%</span>
              </div>
            `;
                    }

                    // Add weather data if available
                    if (weather?.main) {
                        const tempC = kelvinToCelsius(weather.main.temp).toFixed(1);
                        popupContent += `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">তাপমাত্রা:</span>
                <span style="font-weight: 600;">${tempC}°C</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">আর্দ্রতা:</span>
                <span style="font-weight: 600;">${weather.main.humidity}%</span>
              </div>
            `;
                    }

                    // Add soil data if available
                    if (soil) {
                        const soilTempC = kelvinToCelsius(soil.t10).toFixed(1);
                        const moisturePercent = (soil.moisture * 100).toFixed(0);
                        popupContent += `
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">মাটির তাপমাত্রা:</span>
                <span style="font-weight: 600;">${soilTempC}°C</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6b7280;">মাটির আর্দ্রতা:</span>
                <span style="font-weight: 600;">${moisturePercent}%</span>
              </div>
            `;
                    }

                    popupContent += `
              </div>
            </div>
          `;

                    // Bind popup
                    layer.bindPopup(popupContent, {
                        maxWidth: 300,
                        className: 'agro-popup',
                    });

                    // Handle click
                    layer.on('click', () => {
                        setSelectedPolygonId(polygon.id);
                        onPolygonClick?.(polygon.id);
                    });

                    // Highlight on hover
                    layer.on('mouseover', () => {
                        layer.setStyle({ weight: 4, fillOpacity: fillOpacity + 0.2 });
                    });

                    layer.on('mouseout', () => {
                        layer.setStyle({ weight: 2, fillOpacity: fillOpacity });
                    });
                },
            });

            geoJsonLayer.addTo(map.current);
            polygonLayers.current.set(polygon.id, geoJsonLayer);
        });

    }, [polygonData, showNDVIOverlay, showWeatherOverlay, onPolygonClick]);

    // ===================================
    // HANDLERS
    // ===================================
    const handleRefresh = useCallback(() => {
        fetchPolygonData();
    }, [fetchPolygonData]);

    const handleRecenter = useCallback(() => {
        if (!map.current || polygonData.length === 0) return;

        const polygons = polygonData.map(d => d.polygon);
        const bounds = calculateBounds(polygons);

        if (bounds) {
            map.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [polygonData]);

    // ===================================
    // RENDER
    // ===================================
    return (
        <div className={cn('relative rounded-xl overflow-hidden border border-border bg-background h-full min-h-[400px]', className)}>
            {/* Map Container */}
            <div
                ref={mapContainer}
                className={cn(
                    'absolute inset-0 z-0',
                    (loading || error) && 'invisible'
                )}
            />

            {/* Loading State */}
            {loading && !error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">AgroMonitoring ডেটা লোড হচ্ছে...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
                    <div className="text-center p-6">
                        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
                        <p className="text-sm text-destructive font-medium mb-2">{error}</p>
                        <Button size="sm" variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            পুনরায় চেষ্টা করুন
                        </Button>
                    </div>
                </div>
            )}

            {/* Controls */}
            {!loading && !error && (
                <>
                    {/* Top Left - Info Badge */}
                    <div className="absolute top-3 left-3 z-[1000] flex gap-2">
                        <Badge variant="secondary" className="bg-background/95 backdrop-blur-md shadow-lg border border-border">
                            <MapPin className="w-3 h-3 mr-1" />
                            {polygonData.length} পলিগন
                        </Badge>

                        {showNDVIOverlay && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 backdrop-blur-md">
                                NDVI সক্রিয়
                            </Badge>
                        )}
                    </div>

                    {/* Top Right - Action Buttons */}
                    <div className="absolute top-3 right-3 z-[1000] flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-background/95 backdrop-blur-md shadow-lg border border-border"
                            onClick={handleRecenter}
                            title="কেন্দ্রে ফিরুন"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-background/95 backdrop-blur-md shadow-lg border border-border"
                            onClick={handleRefresh}
                            title="রিফ্রেশ করুন"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Bottom Left - Legend */}
                    {showNDVIOverlay && (
                        <div className="absolute bottom-3 left-3 z-[1000] bg-background/95 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-border">
                            <div className="text-xs font-medium mb-2">NDVI স্বাস্থ্য সূচক</div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span>ভাল</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span>মাঝারি</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span>দুর্বল</span>
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 0;
        }
        .agro-popup .leaflet-popup-content {
          margin: 16px;
        }
        .agro-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
        </div>
    );
}

export default AgroMonitoringMap;
