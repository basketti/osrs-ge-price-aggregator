#!/bin/bash

node index.js
cd public
gzip < prices.json > prices.json.gz
sha1sum prices.json.gz > prices.json.gz.chksum
