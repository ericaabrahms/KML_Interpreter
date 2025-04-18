/**
 * KML Parser
 * Responsible for parsing KML files and extracting data
 */

// Function to parse KML file
async function parseKML(kmlFile) {
    try {
        // Read the KML file
        const kmlText = await readKMLFile(kmlFile);
        
        // Parse XML
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, "text/xml");
        
        // Extract data
        const result = {
            placemarks: extractPlacemarks(kmlDoc),
            folders: extractFolders(kmlDoc),
            groundOverlays: extractGroundOverlays(kmlDoc),
            styles: extractStyles(kmlDoc),
            networkLinks: extractNetworkLinks(kmlDoc),
            originalKml: kmlText
        };
        
        return result;
    } catch (error) {
        console.error("Error parsing KML:", error);
        throw error;
    }
}

// Function to read KML file
async function readKMLFile(file) {
    // If file is a File object
    if (file instanceof File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    } else {
        throw new Error("Unsupported input format");
    }
}

// Extract placemarks from KML
function extractPlacemarks(kmlDoc) {
    const placemarks = [];
    const placemarksElements = kmlDoc.getElementsByTagName("Placemark");
    
    for (let i = 0; i < placemarksElements.length; i++) {
        const placemark = placemarksElements[i];
        const placemarkObj = {
            id: placemark.getAttribute("id") || null,
            name: getElementValue(placemark, "name"),
            description: getElementValue(placemark, "description"),
            styleUrl: getElementValue(placemark, "styleUrl"),
            coordinates: []
        };
        
        // Extract coordinates based on geometry type
        const point = placemark.getElementsByTagName("Point")[0];
        const lineString = placemark.getElementsByTagName("LineString")[0];
        const polygon = placemark.getElementsByTagName("Polygon")[0];
        
        if (point) {
            placemarkObj.type = "Point";
            placemarkObj.coordinates = parseCoordinates(getElementValue(point, "coordinates"));
        } else if (lineString) {
            placemarkObj.type = "LineString";
            placemarkObj.coordinates = parseCoordinates(getElementValue(lineString, "coordinates"));
        } else if (polygon) {
            placemarkObj.type = "Polygon";
            const outerBoundary = polygon.getElementsByTagName("outerBoundaryIs")[0];
            if (outerBoundary) {
                const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
                if (linearRing) {
                    placemarkObj.coordinates = parseCoordinates(getElementValue(linearRing, "coordinates"));
                }
            }
            
            // Handle inner boundaries (holes in polygons)
            const innerBoundaries = polygon.getElementsByTagName("innerBoundaryIs");
            if (innerBoundaries.length > 0) {
                placemarkObj.innerBoundaries = [];
                for (let j = 0; j < innerBoundaries.length; j++) {
                    const linearRing = innerBoundaries[j].getElementsByTagName("LinearRing")[0];
                    if (linearRing) {
                        placemarkObj.innerBoundaries.push(
                            parseCoordinates(getElementValue(linearRing, "coordinates"))
                        );
                    }
                }
            }
        }
        
        placemarks.push(placemarkObj);
    }
    
    return placemarks;
}

// Extract folders from KML
function extractFolders(kmlDoc) {
    const folders = [];
    const folderElements = kmlDoc.getElementsByTagName("Folder");
    
    for (let i = 0; i < folderElements.length; i++) {
        const folder = folderElements[i];
        const folderObj = {
            id: folder.getAttribute("id") || null,
            name: getElementValue(folder, "name"),
            description: getElementValue(folder, "description"),
            placemarks: []
        };
        
        // Extract placemarks within this folder
        const folderPlacemarks = folder.getElementsByTagName("Placemark");
        for (let j = 0; j < folderPlacemarks.length; j++) {
            const placemark = folderPlacemarks[j];
            const placemarkObj = {
                id: placemark.getAttribute("id") || null,
                name: getElementValue(placemark, "name"),
                description: getElementValue(placemark, "description"),
                styleUrl: getElementValue(placemark, "styleUrl")
            };
            
            // Add geometry details simplified
            const point = placemark.getElementsByTagName("Point")[0];
            const lineString = placemark.getElementsByTagName("LineString")[0];
            const polygon = placemark.getElementsByTagName("Polygon")[0];
            
            if (point) {
                placemarkObj.type = "Point";
                placemarkObj.coordinates = parseCoordinates(getElementValue(point, "coordinates"));
            } else if (lineString) {
                placemarkObj.type = "LineString";
                placemarkObj.coordinates = parseCoordinates(getElementValue(lineString, "coordinates"));
            } else if (polygon) {
                placemarkObj.type = "Polygon";
                const outerBoundary = polygon.getElementsByTagName("outerBoundaryIs")[0];
                if (outerBoundary) {
                    const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
                    if (linearRing) {
                        placemarkObj.coordinates = parseCoordinates(getElementValue(linearRing, "coordinates"));
                    }
                }
            }
            
            folderObj.placemarks.push(placemarkObj);
        }
        
        folders.push(folderObj);
    }
    
    return folders;
}

// Extract ground overlays
function extractGroundOverlays(kmlDoc) {
    const overlays = [];
    const overlayElements = kmlDoc.getElementsByTagName("GroundOverlay");
    
    for (let i = 0; i < overlayElements.length; i++) {
        const overlay = overlayElements[i];
        const overlayObj = {
            id: overlay.getAttribute("id") || null,
            name: getElementValue(overlay, "name"),
            description: getElementValue(overlay, "description"),
            icon: getElementValue(overlay, "Icon") ? getElementValue(overlay.getElementsByTagName("Icon")[0], "href") : null
        };
        
        // Extract LatLonBox information
        const latLonBox = overlay.getElementsByTagName("LatLonBox")[0];
        if (latLonBox) {
            overlayObj.bounds = {
                north: parseFloat(getElementValue(latLonBox, "north")),
                south: parseFloat(getElementValue(latLonBox, "south")),
                east: parseFloat(getElementValue(latLonBox, "east")),
                west: parseFloat(getElementValue(latLonBox, "west")),
                rotation: parseFloat(getElementValue(latLonBox, "rotation") || 0)
            };
        }
        
        overlays.push(overlayObj);
    }
    
    return overlays;
}

// Extract styles
function extractStyles(kmlDoc) {
    const styles = [];
    const styleElements = kmlDoc.getElementsByTagName("Style");
    
    for (let i = 0; i < styleElements.length; i++) {
        const style = styleElements[i];
        const styleObj = {
            id: style.getAttribute("id") || null,
            iconStyle: {},
            lineStyle: {},
            polyStyle: {},
            labelStyle: {}
        };
        
        // Extract IconStyle
        const iconStyle = style.getElementsByTagName("IconStyle")[0];
        if (iconStyle) {
            styleObj.iconStyle = {
                scale: parseFloat(getElementValue(iconStyle, "scale") || 1),
                icon: getElementValue(iconStyle, "Icon") ? 
                    getElementValue(iconStyle.getElementsByTagName("Icon")[0], "href") : null
            };
            
            // Extract color if available
            const color = getElementValue(iconStyle, "color");
            if (color) {
                styleObj.iconStyle.color = color;
            }
        }
        
        // Extract LineStyle
        const lineStyle = style.getElementsByTagName("LineStyle")[0];
        if (lineStyle) {
            styleObj.lineStyle = {
                color: getElementValue(lineStyle, "color"),
                width: parseFloat(getElementValue(lineStyle, "width") || 1)
            };
        }
        
        // Extract PolyStyle
        const polyStyle = style.getElementsByTagName("PolyStyle")[0];
        if (polyStyle) {
            styleObj.polyStyle = {
                color: getElementValue(polyStyle, "color"),
                fill: getElementValue(polyStyle, "fill") !== "0",
                outline: getElementValue(polyStyle, "outline") !== "0"
            };
        }
        
        // Extract LabelStyle
        const labelStyle = style.getElementsByTagName("LabelStyle")[0];
        if (labelStyle) {
            styleObj.labelStyle = {
                color: getElementValue(labelStyle, "color"),
                scale: parseFloat(getElementValue(labelStyle, "scale") || 1)
            };
        }
        
        styles.push(styleObj);
    }
    
    return styles;
}

// Extract network links
function extractNetworkLinks(kmlDoc) {
    const links = [];
    const linkElements = kmlDoc.getElementsByTagName("NetworkLink");
    
    for (let i = 0; i < linkElements.length; i++) {
        const link = linkElements[i];
        const linkObj = {
            id: link.getAttribute("id") || null,
            name: getElementValue(link, "name"),
            description: getElementValue(link, "description"),
            refreshVisibility: getElementValue(link, "refreshVisibility") === "1",
            flyToView: getElementValue(link, "flyToView") === "1"
        };
        
        // Extract Link information
        const linkInfo = link.getElementsByTagName("Link")[0];
        if (linkInfo) {
            linkObj.href = getElementValue(linkInfo, "href");
            linkObj.refreshMode = getElementValue(linkInfo, "refreshMode");
            linkObj.refreshInterval = parseFloat(getElementValue(linkInfo, "refreshInterval") || 0);
            linkObj.viewRefreshMode = getElementValue(linkInfo, "viewRefreshMode");
            linkObj.viewRefreshTime = parseFloat(getElementValue(linkInfo, "viewRefreshTime") || 0);
        }
        
        links.push(linkObj);
    }
    
    return links;
}

// Helper function to parse coordinates
function parseCoordinates(coordinatesStr) {
    if (!coordinatesStr) return [];
    
    return coordinatesStr.trim().split(/\s+/).map(coordSet => {
        const [lon, lat, alt = 0] = coordSet.split(',').map(parseFloat);
        return { lon, lat, alt };
    });
}

// Helper function to get element value
function getElementValue(parent, tagName) {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent : null;
}

// Helper function to count polygons in parsed KML data
function countPolygons(kmlData) {
    let count = 0;
    
    // Count placemarks that are polygons
    if (kmlData.placemarks) {
        kmlData.placemarks.forEach(placemark => {
            if (placemark.type === "Polygon") {
                count++;
            }
        });
    }
    
    // Count placemarks inside folders
    if (kmlData.folders) {
        kmlData.folders.forEach(folder => {
            if (folder.placemarks) {
                folder.placemarks.forEach(placemark => {
                    if (placemark.type === "Polygon") {
                        count++;
                    }
                });
            }
        });
    }
    
    return count;
}