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

        const items = matchingIcons.map(icon => ({
            uid: icon.n,
            title: icon.n,
            subtitle: `Aliases: ${icon.al.join(', ')}`,
            arg: icon.p,
            icon: {
                path: `data:image/svg+xml,${encodeURIComponent(generateSVG(icon.p))}`
            }
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
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}

run(process.argv.slice(2));
