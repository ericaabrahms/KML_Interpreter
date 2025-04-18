/**
 * Line Segment Generator
 * Responsible for creating line segments from polygons and calculating distances
 */

// Function to process KML data and generate line segments
function processKMLPolygons(kmlData, selectedFolderIds, logs) {
    // Create a new array to hold all line segments
    const lineSegments = [];
    
    // Set to track unique line segments for deduplication
    const uniqueSegments = new Set();
    
    // Statistics
    const stats = {
        processedPolygons: 0,
        generatedSegments: 0,
        zeroLengthSegments: 0,
        duplicateSegments: 0
    };
    
    logs.push("Starting to process polygons...");
    
    // Process standalone placemarks if selected
    if (selectedFolderIds.includes('standalone') && kmlData.placemarks && kmlData.placemarks.length > 0) {
        kmlData.placemarks.forEach((placemark, index) => {
            if (placemark.type === "Polygon" && placemark.coordinates && placemark.coordinates.length > 0) {
                stats.processedPolygons++;
                // Generate line segments for this polygon
                processPolygon(placemark, lineSegments, uniqueSegments, stats, logs, `Standalone-${index}`);
            }
        });
    }
    
    // Process placemarks inside selected folders
    if (kmlData.folders && kmlData.folders.length > 0) {
        kmlData.folders.forEach((folder, folderIndex) => {
            if (selectedFolderIds.includes(`folder-${folderIndex}`) && folder.placemarks && folder.placemarks.length > 0) {
                const folderName = folder.name || `Folder ${folderIndex + 1}`;
                
                folder.placemarks.forEach((placemark, placemarkIndex) => {
                    if (placemark.type === "Polygon" && placemark.coordinates && placemark.coordinates.length > 0) {
                        stats.processedPolygons++;
                        // Generate line segments for this polygon
                        processPolygon(placemark, lineSegments, uniqueSegments, stats, logs, `${folderName}-${placemarkIndex}`);
                    }
                });
            }
        });
    }
    
    logs.push(`Processing complete. Generated ${lineSegments.length} unique line segments.`);
    logs.push(`Skipped ${stats.zeroLengthSegments} zero-length segments and ${stats.duplicateSegments} duplicate segments.`);
    
    return { lineSegments, stats };
}

// Function to process a single polygon
function processPolygon(polygon, lineSegments, uniqueSegments, stats, logs, identifierPrefix) {
    const coordinates = polygon.coordinates;
    
    // We need at least 2 points to form a line
    if (coordinates.length < 2) {
        logs.push(`Skipping polygon ${identifierPrefix}: Not enough points (${coordinates.length})`);
        return;
    }
    
    // Create a line segment between each consecutive pair of points
    for (let i = 0; i < coordinates.length - 1; i++) {
        const startPoint = coordinates[i];
        const endPoint = coordinates[i + 1];
        
        // Add line segment (if valid)
        addLineSegment(startPoint, endPoint, polygon, lineSegments, uniqueSegments, stats, logs, `${identifierPrefix}-segment-${i+1}`);
    }
    
    // Close the polygon by connecting the last point to the first point
    if (coordinates.length > 2) {
        const startPoint = coordinates[coordinates.length - 1];
        const endPoint = coordinates[0];
        
        // Add closing line segment (if valid)
        addLineSegment(startPoint, endPoint, polygon, lineSegments, uniqueSegments, stats, logs, `${identifierPrefix}-segment-closing`);
    }
}

// Function to add a line segment if it's valid (non-zero length and not a duplicate)
function addLineSegment(startPoint, endPoint, polygon, lineSegments, uniqueSegments, stats, logs, identifier) {
    // Calculate the length of the line segment in meters
    const lengthInMeters = calculateDistance(startPoint, endPoint);
    
    // Check for zero-length segments (with a small epsilon for floating point precision)
    const EPSILON = 0.1; // 10cm
    if (lengthInMeters < EPSILON) {
        stats.zeroLengthSegments++;
        logs.push(`Skipping zero-length segment ${identifier}: Points too close (${lengthInMeters.toFixed(2)} meters)`);
        return;
    }
    
    // Convert to feet (1 meter = 3.28084 feet)
    const lengthInFeet = lengthInMeters * 3.28084;
    
    // Create a unique identifier for this segment to detect duplicates
    // Sort coordinates to ensure the same segment in reverse direction is also detected
    const segmentKey = getSegmentKey(startPoint, endPoint);
    
    // Check if this segment already exists
    if (uniqueSegments.has(segmentKey)) {
        stats.duplicateSegments++;
        logs.push(`Skipping duplicate segment ${identifier}: ${Math.round(lengthInFeet)}' (${segmentKey})`);
        return;
    }
    
    // Add to set of unique segments
    uniqueSegments.add(segmentKey);
    
    stats.generatedSegments++;
    
    // Create a new line segment placemark with simplified name
    lineSegments.push({
        type: "LineString",
        name: `${Math.round(lengthInFeet)}'`,
        coordinates: [startPoint, endPoint],
        originalPolygonId: polygon.id,
        originalPolygonName: polygon.name
    });
}

// Function to create a unique key for a segment based on coordinates
function getSegmentKey(point1, point2) {
    // Sort points to ensure the same segment in reverse direction gets the same key
    const orderedPoints = [
        { lon: point1.lon, lat: point1.lat, alt: point1.alt },
        { lon: point2.lon, lat: point2.lat, alt: point2.alt }
    ].sort((a, b) => {
        if (a.lon !== b.lon) return a.lon - b.lon;
        if (a.lat !== b.lat) return a.lat - b.lat;
        return a.alt - b.alt;
    });
    
    // Create a key string using 6 decimal places for precision
    return `${orderedPoints[0].lon.toFixed(6)},${orderedPoints[0].lat.toFixed(6)},${orderedPoints[0].alt.toFixed(1)}-${orderedPoints[1].lon.toFixed(6)},${orderedPoints[1].lat.toFixed(6)},${orderedPoints[1].alt.toFixed(1)}`;
}

// Function to calculate distance between two points in meters using Haversine formula
function calculateDistance(point1, point2) {
    // Earth's radius in meters
    const R = 6371000;
    
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
    const deltaLon = (point2.lon - point1.lon) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}