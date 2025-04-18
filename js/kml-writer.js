/**
 * KML Writer
 * Responsible for generating KML documents from line segment data
 */

// Function to generate the final KML document with just line segments in a folder
function generateKMLDocument(lineSegments) {
    // Start building the KML document
    let kmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    kmlContent += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
    
    // Add a folder for line segments only
    kmlContent += '<Folder>\n';
    kmlContent += '  <n>Line Segments</n>\n';
    kmlContent += '  <description>Generated line segments from polygons with lengths in feet</description>\n';
    
    // Add a style for line segments
    kmlContent += '  <Style id="lineSegmentStyle">\n';
    kmlContent += '    <LineStyle>\n';
    kmlContent += '      <color>ff0000ff</color>\n'; // Red lines
    kmlContent += '      <width>3</width>\n';
    kmlContent += '    </LineStyle>\n';
    kmlContent += '    <LabelStyle>\n';
    kmlContent += '      <scale>0.8</scale>\n';
    kmlContent += '    </LabelStyle>\n';
    kmlContent += '  </Style>\n';
    
    // Add all line segments inside the folder
    if (lineSegments.length > 0) {
        lineSegments.forEach(segment => {
            kmlContent += '  <Placemark>\n';
            kmlContent += `    <name>${escapeXML(segment.name)}</name>\n`;
            kmlContent += '    <styleUrl>#lineSegmentStyle</styleUrl>\n';
            kmlContent += '    <LineString>\n';
            kmlContent += '      <tessellate>1</tessellate>\n';
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
    const matches = kmlString.match(/<n>\d+'/g);
    return matches ? matches.length : 0;
}