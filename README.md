# MDI Icon Search for Alfred

This script provides a powerful Material Design Icons (MDI) search functionality for Alfred, allowing users to quickly find and use MDI icons in their projects.

## Features

- Fast icon search by name or alias
- Display import statements for easy use in projects
- SVG path copying for direct SVG usage
- Caching mechanism for improved performance
- Alias display with modifier key

## Usage

1. Open Alfred
2. Type the keyword for this workflow (default is 'mdi')
3. Enter your search query
4. Press Enter to copy the import statement or SVG path

### Modifiers

- **Default**: Shows the import statement
- **Alt**: Displays icon aliases
- **Add '/svg' or 's' at the end**: Copies the SVG path instead of the import statement

## API Documentation

The main script `mdi_search.js` exposes the following key functions:

### `run(argv)`

The main function that processes the user's query and returns matching icons.

- **Parameters**: 
  - `argv`: An array of command-line arguments (the user's query split into words)
- **Returns**: Logs a JSON string to stdout with matching icon items

### `generateAndSaveSVG(iconName, iconPath)`

Generates an SVG file for a given icon and saves it to the filesystem.

- **Parameters**:
  - `iconName`: The name of the icon
  - `iconPath`: The SVG path data for the icon
- **Returns**: A Promise that resolves to the path of the saved SVG file

### `getCachedOrFetchIconData()`

Retrieves icon data from cache if available and not expired, otherwise fetches fresh data.

- **Returns**: A Promise that resolves to the icon data object

### `readCacheFile()`

Reads the cached icon data from the filesystem.

- **Returns**: A Promise that resolves to the parsed cache data

### `writeCacheFile(data)`

Writes icon data to the cache file.

- **Parameters**:
  - `data`: The icon data to be cached

## Caching

The script uses a caching mechanism to improve performance:

- Cache duration: 24 hours
- Cache file location: `icon_cache.json` in the script's directory

## Error Handling

Errors are logged to stderr and displayed in Alfred's interface for user feedback.

## Dependencies

- Node.js
- `fs` and `path` modules (built-in)
- `fetch` API (for HTTP requests)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
