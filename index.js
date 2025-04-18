

document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    try {
        const kmlData = await parseKML(file);
        console.log(kmlData);
    } catch (error) {
        console.error("Failed to parse KML:", error);
    }
});
