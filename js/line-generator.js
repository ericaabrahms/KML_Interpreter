/**
 * Line Segment Generator
 * Responsible for creating line segments from polygons and calculating distances
 */

// Function to process KML data and generate line segments
function processKMLPolygons(kmlData) {
    // Create a new array to hold all line segments
    const lineSegments = [];
    
    // Process all placemarks that are polygons
    if (kmlData.placemarks && kmlData.placemarks.length > 0) {
        kmlData.placemarks.forEach(placemark => {
            if (placemark.type === "Polygon" && placemark.coordinates && placemark.coordinates.length > 0) {
                // Generate line segments for this polygon
                const segments = createLineSegmentsFromPolygon(placemark);
                lineSegments.push(...segments);
            }
        });
    }
    
    // Process placemarks inside folders
    if (kmlData.folders && kmlData.folders.length > 0) {
        kmlData.folders.forEach(folder => {
            if (folder.placemarks && folder.placemarks.length > 0) {
                folder.placemarks.forEach(placemark => {
                    if (placemark.type === "Polygon" && placemark.coordinates && placemark.coordinates.length > 0) {
                        // Generate line segments for this polygon
                        const segments = createLineSegmentsFromPolygon(placemark);
                        lineSegments.push(...segments);
                    }
                });
            }
        });
    }
    
    return lineSegments;
}

// Function to create line segments from polygon coordinates
function createLineSegmentsFromPolygon(polygon) {
    const segments = [];
    const coordinates = polygon.coordinates;
    
    // We need at least 2 points to form a line
    if (coordinates.length < 2) {
        return segments;
    }
    
    // Create a line segment between each consecutive pair of points
    for (let i = 0; i < coordinates.length - 1; i++) {
        const startPoint = coordinates[i];
        const endPoint = coordinates[i + 1];
        
        // Calculate the length of the line segment in meters
        const lengthInMeters = calculateDistance(startPoint, endPoint);
        
        // Convert to feet (1 meter = 3.28084 feet)
        const lengthInFeet = lengthInMeters * 3.28084;
        
        // Create a new line segment placemark with simplified name
        segments.push({
            type: "LineString",
            name: `${Math.round(lengthInFeet)}'`,
            coordinates: [startPoint, endPoint],
            originalPolygonId: polygon.id,
            originalPolygonName: polygon.name
        });
    }
    
    // Close the polygon by connecting the last point to the first point
    if (coordinates.length > 2) {
        const startPoint = coordinates[coordinates.length - 1];
        const endPoint = coordinates[0];
        
        // Calculate the length of the closing line segment in meters
        const lengthInMeters = calculateDistance(startPoint, endPoint);
        console.log(1, lengthInMeters)
        
        // Convert to feet
        const lengthInFeet = lengthInMeters * 3.28084;
        console.log(2, lengthInFeet)
        // Create a new line segment placemark for the closing segment with simplified name
        segments.push({
            type: "LineString",
            name: `${Math.round(lengthInFeet)}'`,
            coordinates: [startPoint, endPoint],
            originalPolygonId: polygon.id,
            originalPolygonName: polygon.name
        });
    }
    
    return segments;
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
    
    console.log(distance)
    return distance;
}