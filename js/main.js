/**
 * Main Application Logic
 * Responsible for DOM interactions and coordinating the workflow
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const kmlOutput = document.getElementById('kmlOutput');
    const jsonOutput = document.getElementById('jsonOutput');
    const originalKmlOutput = document.getElementById('originalKmlOutput');
    const downloadKmlBtn = document.getElementById('downloadKml');
    const processingInfo = document.getElementById('processingInfo');
    const tabs = document.querySelectorAll('.tab');
    
    // State
    let processedKml = null;
    
    // Function to process KML file
    async function processKMLFile(file) {
        try {
            processingInfo.textContent = "Processing KML file...";
            
            // Parse the KML file
            const kmlData = await parseKML(file);
            
            // Display original KML
            originalKmlOutput.textContent = kmlData.originalKml;
            
            // Display parsed JSON
            jsonOutput.textContent = JSON.stringify(kmlData, null, 2);
            
            // Generate line segments
            const lineSegments = processKMLPolygons(kmlData);
            
            // Generate KML document
            processedKml = generateKMLDocument(lineSegments);
            
            // Display new KML
            kmlOutput.textContent = processedKml;
            
            // Count the polygons and line segments
            const polygonCount = countPolygons(kmlData);
            const lineSegmentCount = countLineSegments(processedKml);
            
            processingInfo.textContent = `Processed ${polygonCount} polygons and created ${lineSegmentCount} line segments with lengths in feet.`;
            
            // Enable download button
            downloadKmlBtn.disabled = false;
        } catch (error) {
            console.error("Error processing KML file:", error);
            processingInfo.textContent = `Error: ${error.message}`;
            kmlOutput.textContent = "An error occurred while processing the KML file.";
            jsonOutput.textContent = "An error occurred while processing the KML file.";
            originalKmlOutput.textContent = "An error occurred while processing the KML file.";
        }
    }
    
    // File input change handler
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            processKMLFile(file);
        }
    });
    
    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            processKMLFile(file);
        }
    });
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update tab active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content visibility
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            if (tabName === 'newKml') {
                document.getElementById('newKmlTab').style.display = 'block';
            } else if (tabName === 'original') {
                document.getElementById('originalTab').style.display = 'block';
            } else if (tabName === 'json') {
                document.getElementById('jsonTab').style.display = 'block';
            }
        });
    });
    
    // Download button handler
    downloadKmlBtn.addEventListener('click', () => {
        if (processedKml) {
            const blob = new Blob([processedKml], { type: 'application/vnd.google-earth.kml+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'line_segments.kml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
});