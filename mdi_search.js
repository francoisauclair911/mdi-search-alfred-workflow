#!/usr/bin/env osascript -l JavaScript

ObjC.import('stdlib');

function run(argv) {
    const query = argv[0].toLowerCase();
    const iconData = JSON.parse(readFile('./mdi-icons.json'));
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

    return JSON.stringify({ items });
}

function readFile(file) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app.read(Path(file));
}

function generateSVG(path) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}
