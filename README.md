# KML Polygon to Line Segments Converter
## User Guide

This document explains how to use the KML Polygon to Line Segments Converter tool, designed for users familiar with Google My Maps or similar mapping software.

## Overview

This tool converts polygons in KML files into individual line segments, providing length measurements and directional information for each segment. It's particularly useful when you need to:

* Measure the perimeter segments of properties, parcels, or features
* Extract precise measurements from existing map data
* Create a detailed CSV report of boundary dimensions
* Split complex data into manageable visualizations

## Getting Started

### Prerequisites

* A KML file containing polygon data
* A modern web browser (Chrome, Firefox, Edge, or Safari)

### Basic Workflow

1. **Upload**: Select or drag-and-drop your KML file
2. **Select**: Choose which folders/layers to process
3. **Process**: Generate line segments with measurements
4. **Download**: Export as KML and/or CSV files

## Detailed Instructions

### Step 1: Upload Your KML File

1. Open the tool in your web browser
2. Click "Select a KML file" or drag and drop your file onto the highlighted area
3. Wait for the file to be parsed (large files may take a moment)

**Tip**: The tool works with KML files exported from Google My Maps, ArcGIS, QGIS, and other mapping software.

### Step 2: Select Folders to Process

After uploading, you'll see a list of folders/layers from your KML file:

1. Check the boxes next to the folders you want to process
2. Each folder will show how many polygons it contains
3. Click "Process Selected Folders" to continue

**Tip**: "Standalone Placemarks" represents any polygons not organized into folders.

### Step 3: View the Results

The tool will process your selection and generate:

1. **Line Segments KML**: A KML file containing individual line segments with length labels
2. **Processing Log**: Details about skipped segments (zero-length) and duplicates
3. **Statistics**: Summary of processing results

### Step 4: Download the Results

1. **KML Files**: Click "Download Line Segments KML" to get the processed KML file
   * If you have more than 2000 segments, multiple KML files will be generated
   * Each file will contain up to 2000 segments to ensure compatibility with various mapping tools

2. **CSV Report**: Click "Download CSV Report" to get a spreadsheet containing:
   * Polygon name
   * Direction (compass bearing in degrees)
   * Length (in feet)
   * Folder name

## Importing Results into Google My Maps

### Importing KML

1. Go to [Google My Maps](https://www.google.com/mymaps)
2. Create a new map or open an existing one
3. Click "Import" in the left panel
4. Select your downloaded line_segments.kml file
5. Choose how to title your placemarks (typically by "name")

### Working with the Imported Data

Once imported into Google My Maps:

1. **Line segments** will appear as individual lines, labeled with their length in feet
2. **Styling**: Click on a layer to change the appearance of the lines (color, thickness)
3. **Visibility**: Toggle layers on/off using the checkboxes in the layer panel

**Tip**: If your original KML had many polygons, the line segments may be split across multiple KML files. Import each file as a separate layer.

## Working with CSV Data

The CSV file provides additional details not visible in the KML:

1. Open in spreadsheet software (Excel, Google Sheets, etc.)
2. Sort or filter:
   * By polygon to group all segments of a single feature
   * By length to find the shortest/longest segments
   * By direction to find segments pointing a certain way

**Tip**: The direction is provided as a compass bearing (0-360°), where 0° is North, 90° is East, etc.

## Troubleshooting

* **Missing labels**: Some mapping software may not display labels by default. Look for label settings in your mapping software.
* **Too many segments**: If your map becomes slow, try importing only select KML files or filtering the data.
* **Zero-length segments**: The tool automatically removes segments shorter than 10cm to clean up the data.
* **Duplicate segments**: The tool removes duplicate segments (like shared boundaries between adjacent polygons).

## Technical Notes

* Line segment measurements are in feet
* Bearings are compass bearings (0-360°)
* The tool handles up to 2000 elements per KML file for maximum compatibility
* Coordinates are preserved from the original file with full precision

This tool helps bridge the gap between polygon-based mapping and the need for detailed linear measurements, making it easier to extract precise dimensional data from your existing maps.