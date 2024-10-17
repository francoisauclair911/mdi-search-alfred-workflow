const fs = require('fs');
const path = require('path');

function run(argv) {
    const query = argv[0].toLowerCase();
    const iconData = JSON.parse(fs.readFileSync(path.join(__dirname, 'mdi-icons.json'), 'utf8'));
    const icons = iconData.i;

    const matchingIcons = icons.filter(icon => 
        icon.n.toLowerCase().includes(query) || 
        icon.al.some(alias => alias.toLowerCase().includes(query))
    );

    const items = matchingIcons.map(icon => ({
        title: icon.n,
        subtitle: `Aliases: ${icon.al.join(', ')}`,
        arg: icon.p,
        icon: {
            path: `data:image/svg+xml,${encodeURIComponent(generateSVG(icon.p))}`
        }
    }));

    console.log(JSON.stringify({ items }));
}

function generateSVG(path) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}

module.exports = { run };
