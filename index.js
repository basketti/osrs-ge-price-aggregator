const fetch = require('node-fetch');
const fs = require('fs-extra');

async function loadRSBuddy() {
	let data = await fetch("https://rsbuddy.com/exchange/summary.json");
	return await data.json();
}

async function loadWikiPrices() {
	let req = await fetch("https://oldschool.runescape.wiki/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=Module%3AGEPrices%2Fdata");
	let body = await req.json();
	let prices = {};
	for (let key in body.query.pages) {
		let lines = body.query.pages[key].revisions[0]["*"]
			.split("\n");
		for (let i = 1; i < lines.length - 1; i++) {
			let name = lines[i].split("\"")[1];
			let price = lines[i].split("=")[1].trim();
			if (prices[name])
				console.log("Duplicate " + name);
			prices[name] = parseInt(price);
		}
		break; // Only want first one, incase of duplicates?
	}
	return prices;
}

(async function doStoof() {
	let ambiguous = JSON.parse(await fs.readFile("./ambiguous.json"));
	if (!await fs.exists("./public")) {
		await fs.mkdir("./public");
	}
	let last = await fs.exists("./public/prices.json")
			? JSON.parse(await fs.readFile("./public/prices.json"))
			: {};
	let [wiki, rsbuddy] = await Promise.all([loadWikiPrices(), loadRSBuddy()]);

	let dupes = {};
	Object.values(rsbuddy)
		.forEach(o => dupes[o.name] = (dupes[o.name] || 0) + 1);

	let output = {};

	for (let wikiName in wiki) {
		let valid = false;
		if (!ambiguous[wikiName]) {
			if ((!dupes[wikiName] || dupes[wikiName] > 1)
				&& dupes[wikiName.split("(")[0].trim()] > 1) {
				// Print out template for adding to `ambiguous.json`
				console.log("\"" + wikiName + "\": ,");
			} else {
				for (let id in rsbuddy) {
					if (rsbuddy[id].name === wikiName) {
						valid = rsbuddy[id];
					}
				}
				if (!valid) {
					for (let id in rsbuddy) {
						if (rsbuddy[id].name === wikiName.split("(")[0].trim()) {
							valid = rsbuddy[id];
						}
					}
				}
			}
		} else {
			valid = rsbuddy[ambiguous[wikiName]];
		}
		if (!valid) {
			if (ambiguous[wikiName] !== -1)
				console.log("Unknown item: " + wikiName);
		} else {
			if (!last[valid.id]) {
				last[valid.id] = {
					ge_price: 0,
					buy_avg: 0,
					sell_avg: 0
				};
			}
			output[valid.id] = {
				// Use || here to use most recent non-0 value
				ge_price: wiki[wikiName] || last[valid.id].ge_price,
				buy_avg: valid.buy_average || last[valid.id].buy_avg,
				sell_avg: valid.sell_average || last[valid.id].sell_avg
			};
		}
	}
	fs.writeFile("./public/prices.json", JSON.stringify(output), null, 4);
})();