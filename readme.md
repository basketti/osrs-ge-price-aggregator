# osrs-ge-price-aggregator

Takes prices from the oldschool runescape wiki and rsbuddy, and aggregates current
price data into a single JSON file.

## Usage

After installing node, run `npm install` in the directory to download dependencies.
Afterwards simply call `node index.js` and it'll aggregate ge prices into a
`prices.json` file in the `public` directory, creating it if needed.

## Update script

Using the `update.sh` script generates the `prices.json`, zips it into `prices.json.gz`,
then generates a SHA1 chksum of the `prices.json.gz` into `prices.json.gz.chksum`.