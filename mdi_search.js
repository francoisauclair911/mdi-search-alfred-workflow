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

        const matchingIcons = icons.filter(icon => 
            icon.n.toLowerCase().includes(query) || 
            icon.al.some(alias => alias.toLowerCase().includes(query))
        );

        const items = await Promise.all(matchingIcons.map(async icon => {
            const svgPath = await generateAndSaveSVG(icon.n, icon.p);
            return {
                uid: icon.n,
                title: icon.n,
                subtitle: `Aliases: ${icon.al.join(', ')}`,
                arg: icon.p,
                icon: {
                    path: svgPath
                }
            };
        }));

        console.log(JSON.stringify({ items }));
    } catch (error) {
        console.log(JSON.stringify({ 
            items: [{
                uid: 'error',
                title: 'Error occurred',
                subtitle: error.message,
                arg: 'error'
            }]
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
