const fs = require('fs');
const path = require('path');

async function run(argv) {
    try {
        const query = argv[0] ? argv[0].toLowerCase() : '';
        const iconDataUrl = 'https://pictogrammers.com/data/mdi-7.4.47.json';

        const response = await fetch(iconDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const iconData = await response.json();
        const icons = iconData.i;

        const matchingIcons = icons.filter(icon => {
            const name = icon.n.toLowerCase();
            const aliases = icon.al ? icon.al.map(alias => alias.toLowerCase()) : [];
            return name.includes(query) || aliases.some(alias => alias.includes(query));
        });

        // Limit the number of icons we process to 50
        const limitedIcons = matchingIcons.slice(0, 50);

        const items = await Promise.all(limitedIcons.map(async icon => {
            const svgPath = await generateAndSaveSVG(icon.n, icon.p);
            return {
                uid: icon.n,
                title: icon.n,
                subtitle: `Aliases: ${icon.al ? icon.al.join(', ') : 'None'}`,
                arg: icon.p,
                icon: {
                    path: svgPath
                }
            };
        }));
        
        // Add debugging information
        const debugInfo = {
            totalMatches: matchingIcons.length,
            displayedMatches: items.length,
            query: query
        };

        console.log(JSON.stringify({ items, debugInfo }));
    } catch (error) {
        console.log(JSON.stringify({ 
            items: [{
                uid: 'error',
                title: 'Error occurred',
                subtitle: error.message,
                arg: 'error'
            }],
            debugInfo: {
                error: error.message
            }
        }));
    }
}

function generateSVG(path) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="white"/></svg>`;
}

async function generateAndSaveSVG(iconName, iconPath) {
    const svgFileName = `${iconName}.svg`;
    const svgFilePath = path.join(__dirname, 'icons', svgFileName);

    // Ensure the icons directory exists
    await fs.promises.mkdir(path.join(__dirname, 'icons'), { recursive: true });

    // Check if the file already exists
    try {
        await fs.promises.access(svgFilePath);
        // If the file exists, just return the path
        return svgFilePath;
    } catch (error) {
        // If the file doesn't exist, generate and save it
        const svgContent = generateSVG(iconPath);
        await fs.promises.writeFile(svgFilePath, svgContent, 'utf8');
        return svgFilePath;
    }
}

run(process.argv.slice(2));
