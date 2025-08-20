import { Injectable } from '@angular/core';
import * as leaflet from 'leaflet';

// OpenLayers types - we'll load dynamically
declare const ol: any;

@Injectable({
  providedIn: 'root'
})
export class Kaart3dService {
  
  private buildingLayer: leaflet.GeoJSON | null = null;
  private map3d: any = null;
  private currentContainer: HTMLElement | null = null;
  private vectorSource: any = null;

  /**
   * Initialize 3D map with OpenLayers + OSM (100% gratis!)
   * @param container HTML container element
   * @param onLocationSelect Callback for location selection
   */
  async init3dMap(container: HTMLElement, onLocationSelect: (lat: number, lng: number, address?: string) => void): Promise<any> {
    try {
      // Validate container
      if (!container) {
        throw new Error('Map container is null or undefined');
      }
      
      // Ensure container has proper styling first
      container.style.position = 'relative';
      container.style.width = '100%';
      container.style.height = '400px';
      container.style.minHeight = '400px';
      container.style.display = 'block';
      container.style.backgroundColor = '#f0f0f0';
      
      // Check container dimensions with retries
      let containerWidth = container.clientWidth;
      let containerHeight = container.clientHeight;
      console.log(`Map container dimensions: ${containerWidth}x${containerHeight}`);
      
      // Wait for container to be properly sized with multiple attempts
      let attempts = 0;
      while ((containerWidth === 0 || containerHeight === 0) && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        containerWidth = container.clientWidth;
        containerHeight = container.clientHeight;
        console.log(`Map container dimensions attempt ${attempts + 1}: ${containerWidth}x${containerHeight}`);
        attempts++;
      }
      
      if (containerWidth === 0 || containerHeight === 0) {
        console.warn(`Map container still has invalid dimensions: ${containerWidth}x${containerHeight}. Proceeding anyway.`);
        // Force minimum size
        container.style.width = '371px';
        container.style.height = '400px';
      }
      
      // Load OpenLayers dynamically
      if (typeof ol === 'undefined') {
        await this.loadOpenLayersScript();
      }
      
      // Validate that required OL objects exist
      if (!ol || !ol.Map || !ol.View || !ol.layer || !ol.source) {
        throw new Error('OpenLayers not properly loaded');
      }
      
      this.currentContainer = container;
      
      // Create vector source for 3D buildings
      this.vectorSource = new ol.source.Vector();
      
      // Create 3D-style building layer with gray colors and WebGL-like shadows
      const buildingLayer = new ol.layer.Vector({
        source: this.vectorSource,
        declutter: true, // Improve performance
        style: (feature: any, resolution: number) => {
          const height = feature.get('height') || 10;
          
          // Create multiple shadow layers for depth effect
          const styles = [];
          
          // Deep shadow (furthest back)
          styles.push(new ol.style.Style({
            geometry: (feature: any) => {
              const geom = feature.getGeometry();
              if (geom) {
                const cloned = geom.clone();
                const offset = height * 0.00006; // Larger offset for deep shadow
                cloned.translate(offset, -offset);
                return cloned;
              }
              return null;
            },
            fill: new ol.style.Fill({
              color: 'rgba(0, 0, 0, 0.15)' // Light shadow
            }),
            zIndex: 0
          }));
          
          // Medium shadow
          styles.push(new ol.style.Style({
            geometry: (feature: any) => {
              const geom = feature.getGeometry();
              if (geom) {
                const cloned = geom.clone();
                const offset = height * 0.00004;
                cloned.translate(offset, -offset);
                return cloned;
              }
              return null;
            },
            fill: new ol.style.Fill({
              color: 'rgba(0, 0, 0, 0.25)'
            }),
            zIndex: 1
          }));
          
          // Close shadow (darkest)
          styles.push(new ol.style.Style({
            geometry: (feature: any) => {
              const geom = feature.getGeometry();
              if (geom) {
                const cloned = geom.clone();
                const offset = height * 0.00002;
                cloned.translate(offset, -offset);
                return cloned;
              }
              return null;
            },
            fill: new ol.style.Fill({
              color: 'rgba(0, 0, 0, 0.4)'
            }),
            zIndex: 2
          }));
          
          // Main building (gray with subtle height variation)
          const grayIntensity = Math.max(120, Math.min(180, 140 + (height - 15) * 2)); // Subtle variation
          styles.push(new ol.style.Style({
            fill: new ol.style.Fill({
              color: `rgb(${grayIntensity}, ${grayIntensity}, ${grayIntensity})`
            }),
            stroke: new ol.style.Stroke({
              color: '#ffffff',
              width: 0.5
            }),
            zIndex: Math.floor(height) + 3 // Higher buildings render on top
          }));
          
          // Top highlight (lighter gray, slight offset for 3D effect)
          if (height > 10) {
            styles.push(new ol.style.Style({
              geometry: (feature: any) => {
                const geom = feature.getGeometry();
                if (geom) {
                  const cloned = geom.clone();
                  const offset = height * 0.000015;
                  cloned.translate(-offset, offset);
                  return cloned;
                }
                return null;
              },
              fill: new ol.style.Fill({
                color: `rgb(${Math.min(255, grayIntensity + 40)}, ${Math.min(255, grayIntensity + 40)}, ${Math.min(255, grayIntensity + 40)})`
              }),
              stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 0.3
              }),
              zIndex: Math.floor(height) + 4
            }));
          }
          
          return styles;
        }
      });
      
      // Initialize OpenLayers map with beautiful OSM style
      // Use a try-catch for controls to ensure compatibility with different OL versions
      let mapControls: any[] = [];
      try {
        // Try modern OL controls API first
        if (ol.control && typeof ol.control.defaults === 'function') {
          const defaults = ol.control.defaults({
            attribution: false
          });
          if (defaults && typeof defaults.extend === 'function') {
            mapControls = defaults.extend([
              new ol.control.Zoom({
                className: 'custom-zoom-control'
              })
            ]);
          } else {
            mapControls = [
              new ol.control.Zoom({
                className: 'custom-zoom-control'
              }),
              new ol.control.Rotate()
            ];
          }
        } else {
          // Fallback to manual controls if defaults is not available
          mapControls = [
            new ol.control.Zoom({
              className: 'custom-zoom-control'
            }),
            new ol.control.Rotate()
          ];
        }
      } catch (controlError) {
        // If controls fail, use minimal controls
        console.warn('OpenLayers controls configuration failed, using minimal controls:', controlError);
        mapControls = [
          new ol.control.Zoom()
        ];
      }
      
      this.map3d = new ol.Map({
        target: container,
        layers: [
          // Base OSM layer met tile caching (30 dagen)
          new ol.layer.Tile({
            source: new ol.source.OSM({
              url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', // Humanitarian OSM - mooiere kleuren
              cacheSize: 2048, // Verhoog cache size voor betere prestaties
              crossOrigin: 'anonymous',
              // Cache tiles voor 30 dagen (2592000 seconden)
              imageLoadFunction: function(imageTile: any, src: string) {
                const cacheKey = `osm_tile_${src}`;
                const cachedTile = localStorage.getItem(cacheKey);
                
                if (cachedTile) {
                  const cacheData = JSON.parse(cachedTile);
                  const now = Date.now();
                  
                  // Check if cache is still valid (30 days)
                  if (now - cacheData.timestamp < 30 * 24 * 60 * 60 * 1000) {
                    imageTile.getImage().src = cacheData.data;
                    return;
                  } else {
                    localStorage.removeItem(cacheKey);
                  }
                }
                
                // Load and cache new tile
                const img = imageTile.getImage() as HTMLImageElement;
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                  // Convert to base64 and cache
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    try {
                      const dataUrl = canvas.toDataURL('image/png');
                      localStorage.setItem(cacheKey, JSON.stringify({
                        data: dataUrl,
                        timestamp: Date.now()
                      }));
                    } catch (e) {
                      // Storage might be full, ignore silently
                    }
                  }
                };
                img.src = src;
              }
            })
          }),
          buildingLayer
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([6.5665, 53.2194]), // Groningen
          zoom: 15,
          rotation: Math.PI / 3, // 60 degree pitch equivalent
          // Enable 3D-like perspective
          enableRotation: true,
          constrainResolution: true
        }),
        controls: mapControls
      });
      
      // Custom controls are added through the controls configuration above
      
      // Handle click events for location selection only
      this.map3d.on('click', (evt: any) => {
        const coordinate = evt.coordinate;
        const [lng, lat] = ol.proj.toLonLat(coordinate);
        onLocationSelect(lat, lng);
      });
      
      // Load 3D buildings with gray styling
      this.load3dBuildings();
      
      // Reload buildings when view changes
      this.map3d.getView().on('change:center', () => {
        this.debounce(() => this.load3dBuildings(), 500);
      });
      
      // Handle window resize
      const resizeObserver = new ResizeObserver(() => {
        if (this.map3d) {
          try {
            this.map3d.updateSize();
          } catch (e) {
            console.warn('Failed to update map size:', e);
          }
        }
      });
      
      resizeObserver.observe(container);
      
      // Store observer for cleanup
      (this as any).resizeObserver = resizeObserver;
      
      // Validate that map was created successfully
      if (!this.map3d) {
        throw new Error('Failed to create OpenLayers map');
      }
      
      // Force map size update after short delay
      setTimeout(() => {
        if (this.map3d) {
          try {
            this.map3d.updateSize();
            console.log('Map size updated successfully');
          } catch (e) {
            console.warn('Failed to update map size:', e);
          }
        }
      }, 300);
      
      return this.map3d;
      
    } catch (error) {
      console.error('3D kaart kon niet worden geladen:', error);
      // Clean up any partially created map
      if (this.map3d) {
        try {
          this.map3d.setTarget(null);
        } catch (e) {
          // Ignore cleanup errors
        }
        this.map3d = null;
      }
      return null;
    }
  }
  
  /**
   * Load OpenLayers script dynamically (gratis!)
   */
  private async loadOpenLayersScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof ol !== 'undefined' && ol.Map) {
        resolve();
        return;
      }
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="openlayers"]') || 
                           document.querySelector('script[src*="ol.js"]');
      if (existingScript) {
        // Wait a bit for it to load
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if (typeof ol !== 'undefined' && ol.Map) {
            clearInterval(checkInterval);
            resolve();
          } else if (attempts > 50) { // Wait max 5 seconds
            clearInterval(checkInterval);
            reject(new Error('OpenLayers failed to load in time'));
          }
        }, 100);
        return;
      }
      
      // Load CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/ol@10.2.1/ol.css';
      css.onload = () => {
        console.log('OpenLayers CSS loaded');
      };
      css.onerror = () => {
        console.warn('OpenLayers CSS failed to load');
      };
      document.head.appendChild(css);
      
      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ol@10.2.1/dist/ol.js';
      script.onload = () => {
        console.log('OpenLayers JS loaded');
        // Give it a moment to initialize
        setTimeout(() => {
          if (typeof ol !== 'undefined' && ol.Map) {
            resolve();
          } else {
            reject(new Error('OpenLayers loaded but not initialized'));
          }
        }, 100);
      };
      script.onerror = () => {
        reject(new Error('OpenLayers kon niet worden geladen - netwerkfout'));
      };
      document.head.appendChild(script);
      
      // Add timeout
      setTimeout(() => {
        if (typeof ol === 'undefined' || !ol.Map) {
          reject(new Error('OpenLayers load timeout'));
        }
      }, 10000); // 10 second timeout
    });
  }
  
  /**
   * Load 3D buildings with gray styling from Overpass API (gratis!)
   */
  private async load3dBuildings(): Promise<void> {
    if (!this.map3d || !this.vectorSource) return;
    
    try {
      // Clear existing buildings
      this.vectorSource.clear();
      
      const view = this.map3d.getView();
      const center = ol.proj.toLonLat(view.getCenter());
      const resolution = view.getResolution();
      
      // Calculate bounds based on current view
      const extent = view.calculateExtent(this.map3d.getSize());
      const [minLon, minLat] = ol.proj.toLonLat([extent[0], extent[1]]);
      const [maxLon, maxLat] = ol.proj.toLonLat([extent[2], extent[3]]);
      
      // Enhanced Overpass query for all buildings with height data
      const query = `
        [out:json][timeout:15];
        (
          way["building"](${minLat},${minLon},${maxLat},${maxLon});
          relation["building"](${minLat},${minLon},${maxLat},${maxLon});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      
      const data = await response.json();
      const buildings = this.processOverpassData(data.elements);
      
      // Add 3D extruded buildings to map
      buildings.forEach(building => {        
        const feature = new ol.Feature({
          geometry: new ol.geom.Polygon([building.coordinates]),
          height: building.height,
          buildingType: building.type || 'building',
          levels: Math.ceil(building.height / 3.5)
        });
        
        // Transform coordinates to map projection for 3D rendering
        feature.getGeometry()?.transform('EPSG:4326', 'EPSG:3857');
        this.vectorSource.addFeature(feature);
      });
      
    } catch (error) {
      console.warn('3D gebouwen konden niet worden geladen:', error);
    }
  }
  
  /**
   * Process Overpass data into colorful building objects
   */
  private processOverpassData(elements: any[]): any[] {
    const buildings: any[] = [];
    
    // Create nodes map
    const nodes: { [id: number]: any } = {};
    elements.forEach(element => {
      if (element.type === 'node') {
        nodes[element.id] = element;
      }
    });
    
    // Process ways into buildings
    elements.forEach(element => {
      if (element.type === 'way' && element.nodes && element.nodes.length >= 3) {
        try {
          const coordinates = element.nodes
            .map((nodeId: number) => {
              const node = nodes[nodeId];
              return node ? [node.lon, node.lat] : null;
            })
            .filter((coord: any) => coord !== null);
          
          if (coordinates.length >= 3) {
            // Close polygon
            coordinates.push(coordinates[0]);
            
            const tags = element.tags || {};
            const height = this.calculateBuildingHeight(tags);
            const buildingType = this.getBuildingType(tags);
            
            buildings.push({
              coordinates,
              height,
              type: buildingType
            });
          }
        } catch (e) {
          // Skip invalid geometries
        }
      }
    });
    
    return buildings;
  }
  
  /**
   * Calculate building height with smart defaults
   */
  private calculateBuildingHeight(tags: any): number {
    if (tags.height) {
      const height = parseFloat(tags.height);
      if (!isNaN(height)) return Math.max(3, Math.min(height, 200));
    }
    
    if (tags['building:levels']) {
      const levels = parseFloat(tags['building:levels']);
      if (!isNaN(levels)) return Math.max(3, levels * 3.5);
    }
    
    // Smart defaults based on building type
    const buildingType = tags.building;
    switch (buildingType) {
      case 'apartments': 
      case 'residential': return 12;
      case 'office': 
      case 'commercial': return 15;
      case 'hotel': return 18;
      case 'hospital': return 20;
      case 'university': 
      case 'school': return 10;
      case 'church': return 25;
      case 'skyscraper': return 80;
      case 'garage': 
      case 'shed': return 4;
      default: return 8;
    }
  }
  
  /**
   * Get building type for color coding
   */
  private getBuildingType(tags: any): string {
    return tags.building || 'residential';
  }
  

  
  
  /**
   * Set marker on 3D map with beautiful styling
   */
  setMarker3d(lat: number, lng: number, address?: string): void {
    if (!this.map3d) return;
    
    // Check if the map container is still valid
    if (!this.currentContainer || !document.body.contains(this.currentContainer)) {
      console.warn('Map container is no longer valid');
      return;
    }
    
    // Remove existing markers
    const existingLayers = this.map3d.getLayers().getArray();
    existingLayers.forEach((layer: any) => {
      if (layer.get('name') === 'marker-layer') {
        this.map3d.removeLayer(layer);
      }
    });
    
    // Create beautiful marker
    const markerFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([lng, lat]))
    });
    
    const markerStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#ef4444"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
            <circle cx="16" cy="16" r="4" fill="#ef4444"/>
          </svg>
        `),
        scale: 1.2,
        anchor: [0.5, 1]
      })
    });
    
    markerFeature.setStyle(markerStyle);
    
    const markerSource = new ol.source.Vector({
      features: [markerFeature]
    });
    
    const markerLayer = new ol.layer.Vector({
      source: markerSource
    });
    markerLayer.set('name', 'marker-layer');
    
    this.map3d.addLayer(markerLayer);
    
    // EERST pin plaatsen, DAN naar locatie navigeren (na korte delay)
    setTimeout(() => {
      const view = this.map3d.getView();
      view.animate({
        center: ol.proj.fromLonLat([lng, lat]),
        zoom: 18,
        duration: 1500
      });
    }, 200); // Pin wordt eerst getoond, dan navigatie
  }
  
  /**
   * Fallback add3dBuildings for Leaflet (existing implementation)
   */
  async add3dBuildings(kaart: leaflet.Map): Promise<void> {
    try {
      if (this.buildingLayer) {
        kaart.removeLayer(this.buildingLayer);
        this.buildingLayer = null;
      }
      
      // Check if map container is valid
      if (!kaart.getContainer()) {
        console.warn('Map container is not valid, skipping building load');
        return;
      }
      
      const bounds = kaart.getBounds();
      const query = `
        [out:json];
        (
          way["building"]["height"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          way["building"]["building:levels"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      
      // Check if response is OK
      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Overpass API rate limit reached, skipping building load');
          return;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Overpass API returned non-JSON response:', text.substring(0, 200));
        return;
      }
      
      const data = await response.json();
      const geoJsonData = this.convertToGeoJSON(data.elements);
      
      if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
        this.buildingLayer = leaflet.geoJSON(geoJsonData, {
          style: (feature) => {
            const height = this.getBuildingHeight(feature?.properties);
            return {
              color: '#ffffff',
              weight: 1,
              fillColor: '#8f8f8f', // Gray color
              fillOpacity: 0.8
            };
          },
          onEachFeature: (feature, layer) => {
            const height = this.getBuildingHeight(feature?.properties);
            if (height > 0) {
              layer.bindTooltip(`Gebouw: ${height}m hoog`, {
                permanent: false,
                direction: 'center'
              });
            }
          }
        });
        
        // Check if the map container is still valid before adding layer
        if (kaart.getContainer()) {
          this.buildingLayer.addTo(kaart);
        }
      }
    } catch (error) {
      console.warn('2D buildings konden niet worden geladen:', error);
    }
  }
  
  /**
   * Convert Overpass data to GeoJSON
   */
  private convertToGeoJSON(elements: any[]): any {
    const features: any[] = [];
    
    const nodes: { [id: number]: any } = {};
    elements.forEach(element => {
      if (element.type === 'node') {
        nodes[element.id] = element;
      }
    });
    
    elements.forEach(element => {
      if (element.type === 'way' && element.nodes && element.nodes.length >= 3) {
        try {
          const coordinates = element.nodes
            .map((nodeId: number) => {
              const node = nodes[nodeId];
              if (node) {
                return [node.lon, node.lat];
              }
              return null;
            })
            .filter((coord: any) => coord !== null);
          
          if (coordinates.length >= 3) {
            coordinates.push(coordinates[0]);
            
            const properties = element.tags || {};
            let height = 10;
            
            if (properties.height) {
              height = parseFloat(properties.height) || 10;
            } else if (properties['building:levels']) {
              height = (parseFloat(properties['building:levels']) || 3) * 3;
            }
            
            height = Math.max(3, Math.min(height, 200));
            
            features.push({
              type: 'Feature',
              properties: {
                ...properties,
                height: height
              },
              geometry: {
                type: 'Polygon',
                coordinates: [coordinates]
              }
            });
          }
        } catch (e) {
          // Skip invalid geometries
        }
      }
    });
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  }
  
  /**
   * Get building height from properties
   */
  private getBuildingHeight(properties: any): number {
    if (!properties) return 0;
    
    if (properties.height) {
      const height = parseFloat(properties.height);
      if (!isNaN(height)) return height;
    }
    
    if (properties['building:levels']) {
      const levels = parseFloat(properties['building:levels']);
      if (!isNaN(levels)) return levels * 3;
    }
    
    return 10;
  }
  
  /**
   * Remove 3D buildings from map
   */
  remove3dBuildings(kaart: leaflet.Map): void {
    if (this.buildingLayer) {
      kaart.removeLayer(this.buildingLayer);
      this.buildingLayer = null;
    }
  }
  
  /**
   * Set map tilt for Leaflet (fallback)
   */
  setMapTilt(kaart: leaflet.Map, tiltAngle: number = 30): void {
    const currentZoom = kaart.getZoom();
    if (currentZoom < 16) {
      kaart.setZoom(16);
    }
  }
  
  /**
   * Destroy 3D map
   */
  destroy3dMap(): void {
    if (this.map3d) {
      this.map3d.setTarget(null);
      this.map3d = null;
    }
    this.vectorSource = null;
    this.currentContainer = null;
    
    // Clean up ResizeObserver
    if ((this as any).resizeObserver) {
      (this as any).resizeObserver.disconnect();
      (this as any).resizeObserver = null;
    }
  }
  
  /**
   * Update map size manually - useful after container resize
   */
  updateMapSize(): void {
    if (this.map3d && this.currentContainer) {
      // Check if container dimensions are valid
      const containerWidth = this.currentContainer.clientWidth;
      const containerHeight = this.currentContainer.clientHeight;
      
      if (containerWidth > 0 && containerHeight > 0) {
        try {
          this.map3d.updateSize();
          console.log('Map size manually updated');
        } catch (error) {
          console.warn('Failed to update map size:', error);
        }
      }
    }
  }

  is3dAvailable(): boolean {
    return this.map3d !== null;
  }
  
  /**
   * Debounce utility function
   */
  private debounce(func: Function, wait: number): void {
    clearTimeout((this as any).debounceTimer);
    (this as any).debounceTimer = setTimeout(func, wait);
  }

  /**
   * Clean up expired tile cache entries (call on app startup)
   */
  static clearExpiredTileCache(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleanedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('osm_tile_')) {
        try {
          const cacheData = JSON.parse(localStorage.getItem(key) || '{}');
          // Remove tiles older than 30 days
          if (!cacheData.timestamp || now - cacheData.timestamp > 30 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        } catch (e) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 Kaart cache opgeruimd: ${cleanedCount} verouderde tiles verwijderd`);
    }
  }

  /**
   * Get current cache size and usage info
   */
  static getCacheInfo(): {totalTiles: number, estimatedSizeMB: number} {
    const keys = Object.keys(localStorage);
    const tileKeys = keys.filter(key => key.startsWith('osm_tile_'));
    let totalSize = 0;
    
    tileKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) totalSize += item.length;
      } catch (e) {
        // Ignore errors
      }
    });
    
    return {
      totalTiles: tileKeys.length,
      estimatedSizeMB: Math.round((totalSize * 2) / (1024 * 1024) * 100) / 100 // Base64 overhead ~2x
    };
  }
}