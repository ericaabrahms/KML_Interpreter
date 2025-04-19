/**
 * KML Writer
 * Responsible for generating KML documents from line segment data
 */

// Function to generate KML documents with line segments split into chunks if needed
function generateKMLDocuments(lineSegments) {
    const MAX_ITEMS_PER_FILE = 2000;
    const results = [];
    
    // Split segments into chunks if needed
    if (lineSegments.length > MAX_ITEMS_PER_FILE) {
        const chunkCount = Math.ceil(lineSegments.length / MAX_ITEMS_PER_FILE);
        
        for (let i = 0; i < chunkCount; i++) {
            const startIdx = i * MAX_ITEMS_PER_FILE;
            const endIdx = Math.min(startIdx + MAX_ITEMS_PER_FILE, lineSegments.length);
            const chunk = lineSegments.slice(startIdx, endIdx);
            
            const kml = generateSingleKMLDocument(chunk, `Line Segments (Part ${i+1} of ${chunkCount})`);
            results.push({
                fileName: `line_segments_part_${i+1}_of_${chunkCount}.kml`,
                content: kml
            });
        }
    } else {
        // Single file is enough
        const kml = generateSingleKMLDocument(lineSegments, 'Line Segments');
        results.push({
            fileName: 'line_segments.kml',
            content: kml
        });
    }
    
    return results;
}

// Function to generate a single KML document
function generateSingleKMLDocument(lineSegments, title) {
    // Start building the KML document
    let kmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kmlContent += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    
    // Add a folder for line segments only
    kmlContent += '<Folder>\n';
    kmlContent += `  <name>${escapeXML(title)}</name>\n`;
    kmlContent += '  <description>Generated line segments from polygons with lengths in feet</description>\n';
    
    // Add styles for line segments with different label visibility settings
    kmlContent += '  <Style id="lineSegmentStyle">\n';
    kmlContent += '    <LineStyle>\n';
    kmlContent += '      <color>ff0000ff</color>\n'; // Red lines
    kmlContent += '      <width>3</width>\n';
    kmlContent += '    </LineStyle>\n';
    kmlContent += '    <LabelStyle>\n';
    kmlContent += '      <color>ff0000ff</color>\n'; // Red text
    kmlContent += '      <scale>1.0</scale>\n'; // Increased scale for better visibility
    kmlContent += '    </LabelStyle>\n';
    kmlContent += '    <BalloonStyle>\n';
    kmlContent += '      <text><![CDATA[<b>$[name]</b>]]></text>\n';
    kmlContent += '    </BalloonStyle>\n';
    kmlContent += '  </Style>\n';
    
    // Add all line segments inside the folder
    if (lineSegments.length > 0) {
        lineSegments.forEach(segment => {
            kmlContent += '  <Placemark>\n';
            kmlContent += `    <name>${escapeXML(segment.name)}</name>\n`;
            kmlContent += '    <styleUrl>#lineSegmentStyle</styleUrl>\n';
            
            // Add explicit label element to ensure the name is displayed
            kmlContent += '    <ExtendedData>\n';
            kmlContent += '      <Data name="label">\n';
            kmlContent += `        <value>${escapeXML(segment.name)}</value>\n`;
            kmlContent += '      </Data>\n';
            kmlContent += '    </ExtendedData>\n';
            
            // Set visibility for the segment
            kmlContent += '    <visibility>1</visibility>\n';
            
            // Add LineString geometry
            kmlContent += '    <LineString>\n';
            kmlContent += '      <tessellate>1</tessellate>\n';
            
            // Calculate center point for label placement (midpoint of line)
            const midPoint = calculateMidpoint(segment.coordinates[0], segment.coordinates[1]);
            
            // Add explicit label point
            kmlContent += '      <altitudeMode>clampToGround</altitudeMode>\n';
            kmlContent += '      <extrude>1</extrude>\n'; // Helps with label visibility
            
            kmlContent += '      <coordinates>\n';
            kmlContent += `        ${segment.coordinates.map(coord => `${coord.lon},${coord.lat},${coord.alt}`).join(' ')}\n`;
            kmlContent += '      </coordinates>\n';
            kmlContent += '    </LineString>\n';
            kmlContent += '  </Placemark>\n';
        });
    }
    
    // Close the folder and KML document
    kmlContent += '</Folder>\n';
    kmlContent += '</kml>';
    
    return kmlContent;
}

// Helper function to calculate midpoint of a line segment
function calculateMidpoint(point1, point2) {
    const midLon = (point1.lon + point2.lon) / 2;
    const midLat = (point1.lat + point2.lat) / 2;
    const midAlt = (point1.alt + point2.alt) / 2;
    
    return { lon: midLon, lat: midLat, alt: midAlt };
}

// Helper function to escape XML special characters
function escapeXML(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Helper function to count line segments in KML string
function countLineSegments(kmlString) {
    // Count segments by looking for the specific pattern of the names
    const matches = kmlString.match(/<name>\d+'/g);
    return matches ? matches.length : 0;
}