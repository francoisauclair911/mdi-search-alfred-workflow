async function run(argv) {
    console.log('Script started'); // Log script start

    try {
        const query = argv[0] ? argv[0].toLowerCase() : '';
        console.log(`Query: "${query}"`); // Log the query

        const iconDataUrl = 'https://pictogrammers.com/data/mdi-7.4.47.json';
        console.log(`Fetching data from: ${iconDataUrl}`); // Log URL

        const response = await fetch(iconDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const iconData = await response.json();
        const icons = iconData.icons;

        console.log(`Total icons: ${icons.length}`); // Log total number of icons

        const matchingIcons = icons.filter(icon => 
            icon.name.toLowerCase().includes(query) || 
            icon.aliases.some(alias => alias.toLowerCase().includes(query))
        );

        console.log(`Matching icons: ${matchingIcons.length}`); // Log number of matching icons

        const items = matchingIcons.map(icon => ({
            title: icon.name,
            subtitle: `Aliases: ${icon.aliases.join(', ')}`,
            arg: icon.data,
            icon: {
                path: `data:image/svg+xml,${encodeURIComponent(generateSVG(icon.data))}`
            }
        }));

        console.log(JSON.stringify({ items }));
    } catch (error) {
        console.log('Error:', error.message);
        console.log(JSON.stringify({ 
            items: [{
                title: 'Error occurred',
                subtitle: error.message,
                arg: 'error'
            }]
        }));
    }
}

function generateSVG(path) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}

// If this script is run directly (not imported as a module)
if (require.main === module) {
    run(process.argv.slice(2)).catch(error => {
        console.log('Unhandled error:', error);
        process.exit(1);
    });
}
