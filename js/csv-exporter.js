/**
 * CSV Exporter
 * Responsible for generating CSV files from line segment data
 */

// Function to generate CSV content from line segments
function generateCSV(lineSegments, kmlData, selectedFolderIds) {
    // Group segments by original polygon
    const segmentsByPolygon = groupSegmentsByPolygon(lineSegments);
    
    // Generate CSV header
    let csvContent = 'Polygon Name,Direction (degrees),Length (feet),Layer Name\n';
    
    // Process each polygon's segments
    for (const polygonId in segmentsByPolygon) {
        const segments = segmentsByPolygon[polygonId];
        
        // Get folder name for this polygon
        const folderInfo = getPolygonFolderInfo(polygonId, kmlData, selectedFolderIds);
        
        // Add each segment to CSV
        segments.forEach(segment => {
            // Calculate bearing
            const bearing = calculateBearing(segment.coordinates[0], segment.coordinates[1]);
            
            // Extract length from segment name (remove the apostrophe)
            const length = segment.name.replace("'", "");
            
            // Get folder name from segment
            const folderName = segment.folderInfo ? segment.folderInfo.folderName : "Unknown";
            
            // Add row to CSV
            csvContent += `"${escapeCSV(segment.originalPolygonName || 'Unknown')}",${bearing.toFixed(2)},${length},"${escapeCSV(folderName)}"\n`;
        });
    }
    
    return csvContent;
}

// Group line segments by their original polygon
function groupSegmentsByPolygon(lineSegments) {
    const groups = {};
    
    lineSegments.forEach(segment => {
        const polygonId = segment.originalPolygonId || 'unknown';
        
        if (!groups[polygonId]) {
            groups[polygonId] = [];
        }
        
        groups[polygonId].push(segment);
    });
    
    return groups;
}

// Get folder information for a polygon
function getPolygonFolderInfo(polygonId, kmlData, selectedFolderIds) {

    // Default values
    const result = {
        folderName: 'Unknown',
        folderId: null
    };
    
    // Check if this is a standalone placemark
    if (polygonId.startsWith('Standalone-')) {
        result.folderName = 'Standalone Placemarks';
        return result;
    }
    
    // Extract folder index from polygon ID (format: "FolderName-index")
    const parts = polygonId.split('-');
    if (parts.length >= 2) {
        const folderNameParts = parts.slice(0, -1); // All but the last part
        result.folderName = folderNameParts.join('-');
    }
    
    return result;
}

// Calculate bearing between two points (in degrees)
function calculateBearing(startPoint, endPoint) {
    // Convert to radians
    const startLat = startPoint.lat * Math.PI / 180;
    const startLon = startPoint.lon * Math.PI / 180;
    const endLat = endPoint.lat * Math.PI / 180;
    const endLon = endPoint.lon * Math.PI / 180;
    
    // Calculate y and x components
    const y = Math.sin(endLon - startLon) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLon - startLon);
    
    // Calculate bearing in radians and convert to degrees
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    
    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;
    
    return bearing;
}

// Escape special characters for CSV
function escapeCSV(text) {
    if (!text) return '';
    
    // If text contains quotes, commas, or newlines, escape it properly
    if (text.includes('"') || text.includes(',') || text.includes('\n')) {
        return text.replace(/"/g, '""');
    }
    
    return text;
}