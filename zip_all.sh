#!/bin/bash
cd "$(dirname "$0")"
for dir in node/public-site node/private-site php/public-site php/private-site
do
  zipname=$(echo $dir | sed 's/\//-/g').zip
  zip -r "$zipname" "$dir"
done
echo "All ZIPs created."
