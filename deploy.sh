#!/bin/bash
echo "[INFO] switch to deployment branch and rebase from master"
git checkout gh-pages
git rebase master
echo "[INFO] Prod-Build"
ng build --prod --base-href https://morpfl.github.io/geoapp/
sudo ngh -e "moritz.pfluegner45@gmail.com" -n "Moritz Pflügner" --dir=dist/geo-app
echo "[INFO] switch back to master"
git checkout master

