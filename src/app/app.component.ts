import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'proj4leaflet';
import { oberzentren } from './data/oberzentren';
import { grundzentren } from './data/grundzentren';
import { mittelzentren } from './data/mittelzentren';
import { gemeinden } from './data/gemeinden';
import { gitter_500m_pkw_mittelzentren } from './data/gitter_500m_pkw_mittelzentren';
import 'proj4';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mittelzentrumMarker, oberzentrumMarker } from './defs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'geo-app';
  CM_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  wmsVEBaseUrl = 'https://geodienste.sachsen.de/wms_geosn_verwaltungseinheiten/guest?';
  map: L.Map;
  // Class-Variables for Layers
  oberzentrenLayer: L.Proj.GeoJSON;
  mittelzentrenLayer: L.Proj.GeoJSON;
  gemeindenLayer: any;
  grundzentrenLayer: L.Proj.GeoJSON;
  gitterPkwMittelzentren: L.Proj.GeoJSON;
  // besserer Wert einschließlich threshold
  thresholdGreenOrange = 0.66;
  thresholdOrangeRed = 0.33;
  ampFG: FormGroup;
  gitterLayerIsActive = true;


  ngOnInit(): void{
    this.map = L.map('map').setView([50.8970, 14.0662], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: this.CM_ATTR}).addTo(this.map);
    const that = this;
    this.gemeindenLayer = L.Proj.geoJson(gemeinden, {
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties && feature.properties.raumbezeic && feature.properties.geog_name){
          const textToDisplay = feature.properties.geog_name + ': ' + feature.properties.raumbezeic;
          layer.bindPopup(textToDisplay);
          layer.on('click', e => {
            that.map.fitBounds(e.sourceTarget._bounds, {maxZoom: 12});
          });
        }
      }
    }).addTo(this.map);
    this.mittelzentrenLayer = L.Proj.geoJson(mittelzentren, {
      pointToLayer(feature, latlng): L.CircleMarker{
        return new L.CircleMarker(latlng, mittelzentrumMarker);
      },
    });
    this.oberzentrenLayer = L.Proj.geoJson(oberzentren, {
      pointToLayer(feature, latlng): L.CircleMarker{
        return new L.CircleMarker(latlng, oberzentrumMarker);
      },
    });
    this.grundzentrenLayer = L.Proj.geoJson(grundzentren, {
      pointToLayer(feature, latlng): L.CircleMarker{
        return new L.CircleMarker(latlng, oberzentrumMarker);
      },
    });
    this.gitterPkwMittelzentren = L.Proj.geoJson(gitter_500m_pkw_mittelzentren, {
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties.erreichbarkeitStandard) {
          layer.setStyle({
            color: 'green'
          });
        }
        else{
          layer.setStyle({
            color: 'red'
          });
        }
      }
    }).addTo(this.map);

    this.ampFG = new FormGroup({
      thresholdGreenOrange: new FormControl(this.thresholdGreenOrange, Validators.required),
      thresholdOrangeRed: new FormControl(this.thresholdOrangeRed, Validators.required),
    });
  }

  toggleOberzentrenLayer(checked: boolean): void{
    if (checked) {
      this.map.addLayer(this.oberzentrenLayer);
    }
    else{
      this.map.removeLayer(this.oberzentrenLayer);
    }
  }

  toggleMittelzentrenLayer(checked: boolean): void{
    if (checked) {
      this.map.addLayer(this.mittelzentrenLayer);
    }
    else{
      this.map.removeLayer(this.mittelzentrenLayer);
    }
  }

  toggleGrundzentrenLayer(checked: boolean): void{
    if (checked) {
      this.map.addLayer(this.grundzentrenLayer);
    }
    else{
      this.map.removeLayer(this.grundzentrenLayer);
    }
  }

  toggleGemeindenLayer(checked: boolean): void{
    if (checked) {
      this.map.addLayer(this.gemeindenLayer);
    }
    else{
      this.map.removeLayer(this.gemeindenLayer);
    }
  }

  toggle500mPkwMittelzentrenGitter(checked: boolean): void {
    if (checked) {
      this.gitterLayerIsActive = true;
      this.map.addLayer(this.gitterPkwMittelzentren);
      this.ampFG = new FormGroup({
        thresholdGreenOrange: new FormControl(this.thresholdGreenOrange, Validators.required),
        thresholdOrangeRed: new FormControl(this.thresholdOrangeRed, Validators.required),
      });
    }
    else{
      this.map.removeLayer(this.gitterPkwMittelzentren);
      this.gitterLayerIsActive = false;
    }
  }

  calculateScore(gitter: any): void{
    if (!this.ampFG.valid){
      return;
    }
    this.thresholdGreenOrange = this.ampFG.controls.thresholdGreenOrange.value;
    this.thresholdOrangeRed = this.ampFG.controls.thresholdOrangeRed.value;

    const gemLayers = this.gemeindenLayer._layers;
    const gemsAsList = Object.keys(gemLayers).map(index => {
      const gem = gemLayers[index];
      return gem;
    });
    for (const gemeinde of gemsAsList){
      const relatingRasterCells = [];
      const gitterAsList = Object.keys(gitter._layers).map(gitterIndex => {
        const singleGitter = gitter._layers[gitterIndex];
        return singleGitter;
      });
      gitterAsList.forEach(singleGitter => {
        if (singleGitter.feature.properties.Zuordnung_Gemeinde_Gitter_500m_SCHLUESSEL === gemeinde.feature.properties.gemeindesc){
          relatingRasterCells.push(singleGitter);
        }
      });
      const cellsWithinStandard = relatingRasterCells.filter(cell => cell.feature.properties.erreichbarkeitStandard).length;
      const percentage = cellsWithinStandard / relatingRasterCells.length;
      if (percentage >= this.thresholdGreenOrange){
        gemeinde.setStyle({
          color: 'green'
        });
      }
      if (percentage < this.thresholdGreenOrange && percentage >= this.thresholdOrangeRed){
        gemeinde.setStyle({
          color: 'orange'
        });
      }
      if (percentage < this.thresholdOrangeRed){
        gemeinde.setStyle({
          color: 'red'
        });
      }
    }
  }
}

