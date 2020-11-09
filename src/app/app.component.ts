import { raster } from './data/Gitter_500_gesamt';
import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'proj4leaflet';
import { oberzentren } from './data/oberzentren';
import { grundzentren } from './data/grundzentren';
import { mittelzentren } from './data/mittelzentren';
import { gemeinden } from './data/gemeinden';
import 'proj4';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mittelzentrumMarker, oberzentrumMarker, grundzentrumMarker, CustLayer } from './defs';



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
  pkwMittel: CustLayer = new CustLayer();
  pkwOber: CustLayer = new CustLayer();
  pkwGrund: CustLayer = new CustLayer();
  opnvOber: CustLayer = new CustLayer();
  opnvMittel: CustLayer = new CustLayer();
  opnvGrund: CustLayer = new CustLayer();
  frOber: CustLayer = new CustLayer();
  frMittel: CustLayer = new CustLayer();
  frGrund: CustLayer = new CustLayer();
  layerList: CustLayer[] = [this.pkwGrund, this.pkwMittel, this.pkwOber,
    this.opnvGrund, this.opnvMittel, this.opnvOber,
    this.frGrund, this.frMittel, this.frOber];
  // thresholds (einschließlich besserer Wert)
  thresholdGreenOrange = 0.66;
  thresholdOrangeRed = 0.33;
  maxTime = 1800;
  // FormGroups
  ampFG: FormGroup;
  maxTimeFG: FormGroup;


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
        return new L.CircleMarker(latlng, grundzentrumMarker);
      },
    });

    this.maxTimeFG = new FormGroup({
      maxTime: new FormControl(this.maxTime / 60, Validators.required),
    });

    this.ampFG = new FormGroup({
      thresholdGreenOrange: new FormControl(this.thresholdGreenOrange, Validators.required),
      thresholdOrangeRed: new FormControl(this.thresholdOrangeRed, Validators.required),
      mobIdentifier: new FormControl('', Validators.required),
      zentIdentifier: new FormControl('', Validators.required),
    });

    this.precalculatePkwRasters();
    this.precalculateOpnvRasters();
    this.precalculateBikeRasters();

  }

  precalculatePkwRasters(): void {
    this.pkwOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.OZ_Pkw_Zeit <= this.maxTime;
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
    });
    this.pkwMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.MZ_Pkw_Zeit <= this.maxTime;
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
    });
    this.pkwGrund.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.GZ_Pkw_Zeit <= this.maxTime;
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
    });
  }

  precalculateOpnvRasters(): void {
    const maxTime = this.maxTime / 60;
    this.opnvOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.OZ_OEPNV <= maxTime;
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
    });
    this.opnvMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.MZ_OEPNV <= maxTime;
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
    });
    this.opnvGrund.layer= L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.GZ_OEPNV <= maxTime;
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
    });
  }

  precalculateBikeRasters(): void {
    this.frOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.OZ_Bike_Zeit <= this.maxTime;
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
    });
    this.frMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.MZ_Bike_Zeit <= this.maxTime;
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
    });
    this.frGrund.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        feature.properties.erreichbarkeitStandard = feature.properties.GZ_Bike_Zeit <= this.maxTime;
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

  toggleOpnvOber(): void{
    this.opnvOber.isActivated = !this.opnvOber.isActivated;
    if (this.opnvOber.isActivated){
      this.map.addLayer(this.opnvOber.layer);
    }
    else{
      this.map.removeLayer(this.opnvOber.layer);
    }
  }

  toggleOpnvMittel(): void {
    this.opnvMittel.isActivated = !this.opnvMittel.isActivated;
    if (this.opnvMittel.isActivated){
      this.map.addLayer(this.opnvMittel.layer);
    }
    else{
      this.map.removeLayer(this.opnvMittel.layer);
    }
  }

  toggleOpnvGrund(): void {
    this.opnvGrund.isActivated = !this.opnvGrund.isActivated;
    if (this.opnvGrund.isActivated){
      this.map.addLayer(this.opnvGrund.layer);
    }
    else{
      this.map.removeLayer(this.opnvGrund.layer);
    }
  }

  togglePkwOber(): void {
    this.pkwOber.isActivated = !this.pkwOber.isActivated;
    if (this.pkwOber.isActivated) {
      this.map.addLayer(this.pkwOber.layer);
    }
    else{
      this.map.removeLayer(this.pkwOber.layer);
    }
  }

  togglePkwMittel(): void {
    this.pkwMittel.isActivated = !this.pkwMittel.isActivated;
    if (this.pkwMittel.isActivated) {
      this.map.addLayer(this.pkwMittel.layer);
    }
    else{
      this.map.removeLayer(this.pkwMittel.layer);
    }
  }

  togglePkwGrund(): void {
    this.pkwGrund.isActivated = !this.pkwGrund.isActivated;
    if (this.pkwGrund.isActivated) {
      this.map.addLayer(this.pkwGrund.layer);
    }
    else{
      this.map.removeLayer(this.pkwGrund.layer);
    }
  }

  toggleFrOber(): void {
    this.frOber.isActivated = !this.frOber.isActivated;
    if (this.frOber.isActivated) {
      this.map.addLayer(this.frOber.layer);
    }
    else{
      this.map.removeLayer(this.frOber.layer);
    }
  }

  toggleFrMittel(): void {
    this.frMittel.isActivated = !this.frMittel.isActivated;
    if (this.frMittel.isActivated) {
      this.map.addLayer(this.frMittel.layer);
    }
    else{
      this.map.removeLayer(this.frMittel.layer);
    }
  }

  toggleFrGrund(): void {
    this.frGrund.isActivated = !this.frGrund.isActivated;
    if (this.frGrund.isActivated) {
      this.map.addLayer(this.frGrund.layer);
    }
    else{
      this.map.removeLayer(this.frGrund.layer);
    }
  }

  setMaxTime(): void {
    if (!this.maxTimeFG.valid){
      return;
    }
    this.maxTime = this.maxTimeFG.controls.maxTime.value * 60;
    this.resetScore();
    let indexOfActivatedLayer = -1;
    for (const layerWrapper of this.layerList){
      if (layerWrapper.isActivated){
        indexOfActivatedLayer = this.layerList.indexOf(layerWrapper);
      }
      layerWrapper.isActivated = false;
    }
    this.resetLayers();
    this.precalculateBikeRasters();
    this.precalculateOpnvRasters();
    this.precalculatePkwRasters();
    if (indexOfActivatedLayer !== -1) {
      this.layerList[indexOfActivatedLayer].isActivated = true;
      this.map.addLayer(this.layerList[indexOfActivatedLayer].layer);
    }
  }


  calculateScore(): void{
    if (!this.ampFG.valid){
      return;
    }
    const gitter = this.getGitterFromVariables(this.ampFG.controls.mobIdentifier.value, this.ampFG.controls.zentIdentifier.value);
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
        if (singleGitter.feature.properties.AGS === gemeinde.feature.properties.gemeindesc){
          relatingRasterCells.push(singleGitter);
        }
      });
      const cellsWithinStandard = relatingRasterCells.filter(cell => cell.feature.properties.erreichbarkeitStandard).length;
      console.log(cellsWithinStandard);
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

  getGitterFromVariables(mobIdentifier, zentIdentifier): any{
    if (mobIdentifier === 'pkw' && zentIdentifier === 'ober'){
      return this.pkwOber.layer;
    }
    if (mobIdentifier === 'pkw' && zentIdentifier === 'mittel'){
      return this.pkwMittel.layer;
    }
    if (mobIdentifier === 'pkw' && zentIdentifier === 'grund'){
      return this.pkwGrund.layer;
    }
    if (mobIdentifier === 'opnv' && zentIdentifier === 'ober'){
      return this.opnvOber.layer;
    }
    if (mobIdentifier === 'opnv' && zentIdentifier === 'mittel'){
      return this.opnvMittel.layer;
    }
    if (mobIdentifier === 'opnv' && zentIdentifier === 'grund'){
      return this.opnvGrund.layer;
    }
    if (mobIdentifier === 'fr' && zentIdentifier === 'ober'){
      return this.frOber.layer;
    }
    if (mobIdentifier === 'fr' && zentIdentifier === 'mittel'){
      return this.frMittel.layer;
    }
    if (mobIdentifier === 'fr' && zentIdentifier === 'grund'){
      return this.frGrund.layer;
    }
    else{
      return null;
    }
  }

  resetScore(): void {
    const gemLayers = this.gemeindenLayer._layers;
    const gemsAsList = Object.keys(gemLayers).map(index => {
      const gem = gemLayers[index];
      return gem;
    });
    for (const gemeinde of gemsAsList){
      gemeinde.setStyle({
        color: '#3388ff'
      });
    }
  }

  resetLayers(): void {
    this.map.removeLayer(this.frGrund.layer);
    this.map.removeLayer(this.frMittel.layer);
    this.map.removeLayer(this.frOber.layer);
    this.map.removeLayer(this.pkwGrund.layer);
    this.map.removeLayer(this.pkwMittel.layer);
    this.map.removeLayer(this.pkwOber.layer);
    this.map.removeLayer(this.opnvGrund.layer);
    this.map.removeLayer(this.opnvMittel.layer);
    this.map.removeLayer(this.opnvOber.layer);
  }
}

