#!/bin/bash
echo "[INFO] Prod-Build"
ng build --prod --base-href https://morpfl.github.io/geoapp/
sudo ngh -e "moritz.pfluegner45@gmail.com" -n "Moritz Pflügner" --dir=dist/geo-app


