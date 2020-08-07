# osrs-ge-price-aggregator

Takes prices from the oldschool runescape wiki and rsbuddy, and aggregates current
price data into a single JSON file.

## Usage

After installing node, run `npm install` in the directory to download dependencies.
Afterwards simply call `node index.js` and it'll aggregate ge prices into a
`prices.json` file in the same directory.

## Update script

Using the update script runs the program like above, but then zips and generates
a chksum for that.