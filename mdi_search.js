const fs = require('fs');
const path = require('path');

function run(argv) {
    console.error('Script started'); // Log script start

    try {
        const query = argv[0] ? argv[0].toLowerCase() : '';
        console.error(`Query: "${query}"`); // Log the query

        const iconDataPath = path.join(__dirname, 'mdi-icons.json');
        console.error(`Reading file: ${iconDataPath}`); // Log file path

        const iconData = JSON.parse(fs.readFileSync(iconDataPath, 'utf8'));
        const icons = iconData.i;

        console.error(`Total icons: ${icons.length}`); // Log total number of icons

        const matchingIcons = icons.filter(icon => 
            icon.n.toLowerCase().includes(query) || 
            icon.al.some(alias => alias.toLowerCase().includes(query))
        );

        console.error(`Matching icons: ${matchingIcons.length}`); // Log number of matching icons

        const items = matchingIcons.map(icon => ({
            title: icon.n,
            subtitle: `Aliases: ${icon.al.join(', ')}`,
            arg: icon.p,
            icon: {
                path: `data:image/svg+xml,${encodeURIComponent(generateSVG(icon.p))}`
            }
        }));

        console.log(JSON.stringify({ items }));
    } catch (error) {
        console.error('Error:', error.message);
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

module.exports = { run };
