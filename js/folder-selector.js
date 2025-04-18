/**
 * Folder Selector
 * Responsible for allowing users to select which folders to process
 */

// Function to display folder selection UI
function displayFolderSelection(kmlData) {
    const folderSelection = document.getElementById('folderSelection');
    const folderList = document.getElementById('folderList');
    const processSelectedBtn = document.getElementById('processSelectedBtn');
    
    // Clear previous content
    folderList.innerHTML = '';
    
    // Add standalone placemarks option if there are any
    if (kmlData.placemarks && kmlData.placemarks.length > 0) {
        const polygonCount = kmlData.placemarks.filter(p => p.type === "Polygon").length;
        
        if (polygonCount > 0) {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'standalone';
            checkbox.checked = true;
            checkbox.dataset.folderId = 'standalone';
            
            const label = document.createElement('label');
            label.htmlFor = 'standalone';
            label.innerHTML = `Standalone Placemarks <span class="folder-count">(${polygonCount} polygons)</span>`;
            
            folderItem.appendChild(checkbox);
            folderItem.appendChild(label);
            folderList.appendChild(folderItem);
        }
    }
    
    // Add folders
    if (kmlData.folders && kmlData.folders.length > 0) {
        kmlData.folders.forEach((folder, index) => {
            const polygonCount = folder.placemarks.filter(p => p.type === "Polygon").length;
            
            if (polygonCount > 0) {
                const folderItem = document.createElement('div');
                folderItem.className = 'folder-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `folder-${index}`;
                checkbox.checked = true;
                checkbox.dataset.folderId = `folder-${index}`;
                
                const label = document.createElement('label');
                label.htmlFor = `folder-${index}`;
                label.innerHTML = `${folder.name || `Folder ${index + 1}`} <span class="folder-count">(${polygonCount} polygons)</span>`;
                
                folderItem.appendChild(checkbox);
                folderItem.appendChild(label);
                folderList.appendChild(folderItem);
            }
        });
    }
    
    // Show folder selection and process button
    if (folderList.children.length > 0) {
        folderSelection.style.display = 'block';
        processSelectedBtn.style.display = 'block';
    } else {
        // No polygons found
        document.getElementById('processingInfo').textContent = "No polygons found in the KML file.";
    }
}

// Function to get selected folder IDs
function getSelectedFolderIds() {
    const checkboxes = document.querySelectorAll('#folderList input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.dataset.folderId);
}