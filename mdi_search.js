const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'icon_cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function kebabToCamelCase(str) {
    return 'mdi' + str.split('-').map((part, index) => 
        index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
}

async function run(argv) {
    // Use console.error for debug logging
    console.error("Raw arguments:", argv);
    try {
        let query = argv.join(' ').toLowerCase();
        console.error("🚀 ~ run ~ query:", query);
        
        const isSvgQuery = query.endsWith('/svg') || query.endsWith('/svg ');
        if (isSvgQuery) {
            query = query.slice(0, -5).trim(); // Remove ' /svg' from the end
        }
        
        if (query.length < 1) {
            console.log(JSON.stringify({
                items: [{
                    uid: 'wait',
                    title: 'Please enter at least 2 characters',
                    subtitle: 'Waiting for more input...',
                    arg: 'wait'
                }],
                debugInfo: {
                    query: query,
                    queryLength: query.length,
                    isSvgQuery: isSvgQuery
                }
            }));
            return;
        }

        const iconData = await getCachedOrFetchIconData();
        const icons = iconData.i;

        const matchingIcons = icons.filter(icon => {
            const name = icon.n.toLowerCase();
            const aliases = icon.al ? icon.al.map(alias => alias.toLowerCase()) : [];
            return name === query || name.startsWith(query) || aliases.some(alias => alias === query || alias.startsWith(query));
        });

        const items = await Promise.all(matchingIcons.map(async icon => {
            const svgPath = await generateAndSaveSVG(icon.n, icon.p);
            const camelCaseName = kebabToCamelCase(icon.n);
            const importStatement = `import { ${camelCaseName} } from '@mdi/js'`;
            return {
                uid: icon.n,
                title: icon.n,
                subtitle: isSvgQuery ? 'Copy SVG path' : importStatement,
                arg: isSvgQuery ? icon.p : importStatement,
                icon: {
                    path: svgPath
                },
                mods: {
                    alt: {
                        subtitle: `Aliases: ${icon.al ? icon.al.join(', ') : 'None'}`,
                        arg: icon.n
                    }
                }
            };
        }));
        
        // Add debugging information
        const debugInfo = {
            totalMatches: matchingIcons.length,
            displayedMatches: items.length,
            query: query,
            matchingIconNames: matchingIcons.map(icon => icon.n)
        };

        // Use console.error for debug logging
        console.error("Debug info:", JSON.stringify(debugInfo));
        console.log(JSON.stringify({ items }));
    } catch (error) {
        console.error("Error:", error);
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
    await fsPromises.mkdir(path.join(__dirname, 'icons'), { recursive: true });

    // Check if the file already exists
    try {
        await fsPromises.access(svgFilePath);
        // If the file exists, just return the path
        return svgFilePath;
    } catch (error) {
        // If the file doesn't exist, generate and save it
        const svgContent = generateSVG(iconPath);
        await fsPromises.writeFile(svgFilePath, svgContent, 'utf8');
        return svgFilePath;
    }
}

async function getCachedOrFetchIconData() {
    try {
        const cachedData = await readCacheFile();
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            console.error("Using cached icon data");
            return cachedData.data;
        }
    } catch (error) {
        console.error("Error reading cache:", error);
    }

    console.error("Fetching fresh icon data");
    const iconDataUrl = 'https://pictogrammers.com/data/mdi-7.4.47.json';
    const response = await fetch(iconDataUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const iconData = await response.json();
    
    await writeCacheFile(iconData);
    return iconData;
}

async function readCacheFile() {
    const data = await fsPromises.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeCacheFile(data) {
    const cacheData = {
        timestamp: Date.now(),
        data: data
    };
    await fsPromises.writeFile(CACHE_FILE, JSON.stringify(cacheData), 'utf8');
}

run(process.argv.slice(2));
