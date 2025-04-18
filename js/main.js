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
    const logOutput = document.getElementById('logOutput');
    const downloadKmlBtn = document.getElementById('downloadKml');
    const multiFileDownload = document.getElementById('multiFileDownload');
    const processingInfo = document.getElementById('processingInfo');
    const statsInfo = document.getElementById('statsInfo');
    const processSelectedBtn = document.getElementById('processSelectedBtn');
    const tabs = document.querySelectorAll('.tab');
    
    // State
    let parsedKmlData = null;
    let processedKml = null;
    let kmlDocuments = [];
    let processingLogs = [];
    
    // Function to process KML file
    async function processKMLFile(file) {
        try {
            processingInfo.textContent = "Parsing KML file...";
            statsInfo.textContent = "";
            
            // Clear previous state
            parsedKmlData = null;
            processedKml = null;
            kmlDocuments = [];
            processingLogs = [];
            
            // Reset UI
            document.getElementById('folderSelection').style.display = 'none';
            document.getElementById('processSelectedBtn').style.display = 'none';
            document.getElementById('folderList').innerHTML = '';
            multiFileDownload.innerHTML = '';
            kmlOutput.textContent = "Processed KML with line segments will appear here.";
            logOutput.textContent = "Processing log will appear here.";
            
            // Parse the KML file
            parsedKmlData = await parseKML(file);
            
            // Display original KML
            originalKmlOutput.textContent = parsedKmlData.originalKml;
            
            // Display parsed JSON
            jsonOutput.textContent = JSON.stringify(parsedKmlData, null, 2);
            
            // Display folder selection UI
            processingInfo.textContent = "Please select folders to process:";
            displayFolderSelection(parsedKmlData);
            
        } catch (error) {
            console.error("Error processing KML file:", error);
            processingInfo.textContent = `Error: ${error.message}`;
            logOutput.textContent = `Error: ${error.message}`;
            kmlOutput.textContent = "An error occurred while processing the KML file.";
            jsonOutput.textContent = "An error occurred while processing the KML file.";
            originalKmlOutput.textContent = "An error occurred while processing the KML file.";
        }
    }
    
    // Function to process selected folders
    function processSelectedFolders() {
        try {
            if (!parsedKmlData) {
                processingInfo.textContent = "No KML data to process. Please upload a file first.";
                return;
            }
            
            // Get selected folder IDs
            const selectedFolderIds = getSelectedFolderIds();
            
            if (selectedFolderIds.length === 0) {
                processingInfo.textContent = "No folders selected. Please select at least one folder to process.";
                return;
            }
            
            processingInfo.textContent = "Processing polygons...";
            processingLogs = [];
            
            // Count polygons in selected folders
            const totalPolygons = countPolygonsInFolders(parsedKmlData, selectedFolderIds);
            processingLogs.push(`Selected ${selectedFolderIds.length} folder(s) containing ${totalPolygons} polygons.`);
            
            // Generate line segments, skipping 0-length segments and removing duplicates
            const { lineSegments, stats } = processKMLPolygons(parsedKmlData, selectedFolderIds, processingLogs);
            
            // Generate KML documents (split if needed)
            kmlDocuments = generateKMLDocuments(lineSegments);
            
            // Display first KML document
            if (kmlDocuments.length > 0) {
                processedKml = kmlDocuments[0].content;
                kmlOutput.textContent = processedKml;
                
                // Display all logs
                logOutput.textContent = processingLogs.join('\n');
                
                // Show download options
                if (kmlDocuments.length === 1) {
                    // Single file download
                    downloadKmlBtn.disabled = false;
                    multiFileDownload.innerHTML = '';
                } else {
                    // Multiple file downloads
                    downloadKmlBtn.disabled = true;
                    displayMultiFileDownloads(kmlDocuments);
                }
                
                // Display statistics
                statsInfo.innerHTML = `
                    <h3>Processing Statistics</h3>
                    <p>Processed ${stats.processedPolygons} polygons</p>
                    <p>Generated ${lineSegments.length} unique line segments</p>
                    <p>Skipped ${stats.zeroLengthSegments} zero-length segments</p>
                    <p>Eliminated ${stats.duplicateSegments} duplicate segments</p>
                    <p>Output split into ${kmlDocuments.length} KML file(s)</p>
                `;
                
                processingInfo.textContent = `Processing complete! Generated ${lineSegments.length} unique line segments in ${kmlDocuments.length} file(s).`;
            } else {
                kmlOutput.textContent = "No line segments were generated.";
                processingInfo.textContent = "Processing complete, but no line segments were generated.";
                statsInfo.textContent = "";
            }
            
        } catch (error) {
            console.error("Error processing folders:", error);
            processingInfo.textContent = `Error: ${error.message}`;
            logOutput.textContent = `Error: ${error.message}\n\n${processingLogs.join('\n')}`;
        }
    }
    
    // Function to display multiple file download links
    function displayMultiFileDownloads(documents) {
        multiFileDownload.innerHTML = '<h4>Download KML Files:</h4><div class="file-list"></div>';
        const fileList = multiFileDownload.querySelector('.file-list');
        
        documents.forEach((doc, index) => {
            const fileLink = document.createElement('a');
            fileLink.className = 'file-link';
            fileLink.textContent = doc.fileName;
            fileLink.href = '#';
            fileLink.addEventListener('click', (e) => {
                e.preventDefault();
                downloadKmlFile(doc.content, doc.fileName);
            });
            fileList.appendChild(fileLink);
        });
    }
    
    // Function to download a KML file
    function downloadKmlFile(content, fileName) {
        const blob = new Blob([content], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
    
    // Process selected folders button handler
    processSelectedBtn.addEventListener('click', processSelectedFolders);
    
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
            } else if (tabName === 'log') {
                document.getElementById('logTab').style.display = 'block';
            }
        });
    });
    
    // Download button handler
    downloadKmlBtn.addEventListener('click', () => {
        if (processedKml) {
            downloadKmlFile(processedKml, 'line_segments.kml');
        }
    });
});