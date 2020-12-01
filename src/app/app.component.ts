import { raster } from './data/Gitter_500_gesamt';
import { Component, OnInit, SystemJsNgModuleLoader } from '@angular/core';
import * as L from 'leaflet';
import 'proj4leaflet';
import { oberzentren } from './data/oberzentren';
import { grundzentren } from './data/grundzentren';
import { mittelzentren } from './data/mittelzentren';
import { gemeinden } from './data/gemeinden';
import 'proj4';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mittelzentrumMarker, oberzentrumMarker, grundzentrumMarker, CustLayer, pkwDefaultOber, opnvDefaultOber, pkwDefaultMittel, pkwDefaultGrund, opnvDefaultMittel, opnvDefaultGrund, bikeDefaultOber, bikeDefaultMittel, bikeDefaultGrund } from './defs';
import { getColor, calcLegend } from './legend.util';



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
  // FormGroups
  ampFG: FormGroup;
  scoreCounter = 0;


  ngOnInit(): void{
    this.map = L.map('map').setView([50.8970, 14.0662], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: this.CM_ATTR}).addTo(this.map);
    const that = this;
    this.gemeindenLayer = L.Proj.geoJson(gemeinden, {
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties && feature.properties.raumbezeic && feature.properties.geog_name){
          const textToDisplay = feature.properties.geog_name + ': ' + feature.properties.raumbezeic;
          layer.bindPopup(textToDisplay);
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

    this.ampFG = new FormGroup({
      pkwMinOber: new FormControl(pkwDefaultOber),
      pkwMaxOber: new FormControl(pkwDefaultOber),
      pkwMinMittel: new FormControl(pkwDefaultMittel),
      pkwMaxMittel: new FormControl(pkwDefaultMittel),
      pkwMinGrund: new FormControl(pkwDefaultGrund),
      pkwMaxGrund: new FormControl(pkwDefaultGrund),
      opnvMinOber: new FormControl(opnvDefaultOber),
      opnvMaxOber: new FormControl(opnvDefaultOber),
      opnvMinMittel: new FormControl(opnvDefaultMittel),
      opnvMaxMittel: new FormControl(opnvDefaultMittel),
      opnvMinGrund: new FormControl(opnvDefaultGrund),
      opnvMaxGrund: new FormControl(opnvDefaultGrund),
      bikeMinOber: new FormControl(bikeDefaultOber),
      bikeMaxOber: new FormControl(bikeDefaultOber),
      bikeMinMittel: new FormControl(bikeDefaultMittel),
      bikeMaxMittel: new FormControl(bikeDefaultMittel),
      bikeMinGrund: new FormControl(bikeDefaultGrund),
      bikeMaxGrund: new FormControl(bikeDefaultGrund),
      pkwWeight: new FormControl(0, Validators.required),
      opnvWeight: new FormControl(0, Validators.required),
      bikeWeight: new FormControl(0, Validators.required),
    });

    this.precalculatePkwRasters();
    this.precalculateOpnvRasters();
    this.precalculateBikeRasters();

  }



  precalculatePkwRasters(): void {
    let times;
    let min;
    let max;
    let interval;
    let between;
    let layers;
    let layersAsList;
    let counter;

    times = [];
    this.pkwOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.OZ_Pkw_Zeit);
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.pkwOber.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.OZ_Pkw_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.pkwOber.legend = calcLegend(min, max, interval);
    times = [];
    this.pkwMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
       times.push(feature.properties.MZ_Pkw_Zeit);
       feature.properties.checked = false;
       const textToDisplay = 'Zeit in Minuten: ' + feature.properties.MZ_Pkw_Zeit;
       layer.bindPopup(textToDisplay);
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.pkwMittel.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.MZ_Pkw_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.pkwMittel.legend = calcLegend(min, max, interval);
    times = [];
    this.pkwGrund.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.GZ_Pkw_Zeit);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.pkwGrund.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.GZ_Pkw_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.pkwGrund.legend = calcLegend(min, max, interval);
  }

  precalculateOpnvRasters(): void {
    let times = [];
    let min;
    let max;
    let interval;
    let between;
    let layers;
    let layersAsList;
    let counter;

    this.opnvOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.OZ_OEPNV);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.opnvOber.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.OZ_OEPNV < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.opnvOber.legend = calcLegend(min, max, interval);

    times = [];
    this.opnvMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.MZ_OEPNV);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.opnvMittel.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.MZ_OEPNV < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.opnvMittel.legend = calcLegend(min, max, interval);

    times = [];
    this.opnvGrund.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.GZ_OEPNV);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.opnvGrund.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.GZ_OEPNV < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.opnvGrund.legend = calcLegend(min, max, interval);
  }

  precalculateBikeRasters(): void {
    let times = [];
    let min;
    let max;
    let interval;
    let between;
    let layers;
    let layersAsList;
    let counter;

    this.frOber.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.OZ_Bike_Zeit);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.frOber.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.OZ_Bike_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.frOber.legend = calcLegend(min, max, interval);

    times = [];
    this.frMittel.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.MZ_Bike_Zeit);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.frMittel.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.MZ_Bike_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.frMittel.legend = calcLegend(min, max, interval);

    times = [];
    this.frGrund.layer = L.Proj.geoJson(raster, {
      onEachFeature: (feature: any, layer: any) => {
        times.push(feature.properties.GZ_Bike_Zeit);
        feature.properties.checked = false;
      }
    });
    min = Math.min.apply(null, times);
    max = Math.max.apply(null, times);
    between = max - min;
    interval = Math.round(between / 5);
    layers = this.frGrund.layer._layers;
    layersAsList = Object.keys(layers).map(index => {
      const layer = layers[index];
      return layer;
    });
    counter = 0;
    for (let i = min + interval; i <= max + interval; i = i + interval){
      counter++;
      for (const singleLayer of layersAsList){
        if (singleLayer.feature.properties.GZ_Bike_Zeit < i && !singleLayer.feature.properties.checked){
          singleLayer.feature.properties.checked = true;
          singleLayer.setStyle({
            color: getColor(counter),
          });
        }
      }
    }
    this.frGrund.legend = calcLegend(min, max, interval);
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

  toggleOpnvOber(): void{
    this.resetLayers(this.opnvOber);
    this.opnvOber.isActivated = !this.opnvOber.isActivated;
    if (this.opnvOber.isActivated){
      this.map.addLayer(this.opnvOber.layer);
      this.opnvOber.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.opnvOber.layer);
      this.opnvOber.legend.remove();
    }
  }

  toggleOpnvMittel(): void {
    this.resetLayers(this.opnvMittel);
    this.opnvMittel.isActivated = !this.opnvMittel.isActivated;
    if (this.opnvMittel.isActivated){
      this.map.addLayer(this.opnvMittel.layer);
      this.opnvMittel.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.opnvMittel.layer);
      this.opnvMittel.legend.remove();
    }
  }

  toggleOpnvGrund(): void {
    this.resetLayers(this.opnvGrund);
    this.opnvGrund.isActivated = !this.opnvGrund.isActivated;
    if (this.opnvGrund.isActivated){
      this.map.addLayer(this.opnvGrund.layer);
      this.opnvGrund.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.opnvGrund.layer);
      this.opnvGrund.legend.remove();
    }
  }

  togglePkwOber(): void {
    this.resetLayers(this.pkwOber);
    this.pkwOber.isActivated = !this.pkwOber.isActivated;
    if (this.pkwOber.isActivated) {
      this.map.addLayer(this.pkwOber.layer);
      this.pkwOber.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.pkwOber.layer);
      this.pkwOber.legend.remove();
    }
  }

  togglePkwMittel(): void {
    this.resetLayers(this.pkwMittel);
    this.pkwMittel.isActivated = !this.pkwMittel.isActivated;
    if (this.pkwMittel.isActivated) {
      this.map.addLayer(this.pkwMittel.layer);
      this.pkwMittel.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.pkwMittel.layer);
      this.pkwMittel.legend.remove();
    }
  }

  togglePkwGrund(): void {
    this.resetLayers(this.pkwGrund);
    this.pkwGrund.isActivated = !this.pkwGrund.isActivated;
    if (this.pkwGrund.isActivated) {
      this.map.addLayer(this.pkwGrund.layer);
      this.pkwGrund.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.pkwGrund.layer);
      this.pkwGrund.legend.remove();
    }
  }

  toggleFrOber(): void {
    this.resetLayers(this.frOber);
    this.frOber.isActivated = !this.frOber.isActivated;
    if (this.frOber.isActivated) {
      this.map.addLayer(this.frOber.layer);
      this.frOber.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.frOber.layer);
      this.frOber.legend.remove();
    }
  }

  toggleFrMittel(): void {
    this.resetLayers(this.frMittel);
    this.frMittel.isActivated = !this.frMittel.isActivated;
    if (this.frMittel.isActivated) {
      this.map.addLayer(this.frMittel.layer);
      this.frMittel.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.frMittel.layer);
      this.frMittel.legend.remove();
    }
  }

  toggleFrGrund(): void {
    this.resetLayers(this.frGrund);
    this.frGrund.isActivated = !this.frGrund.isActivated;
    if (this.frGrund.isActivated) {
      this.map.addLayer(this.frGrund.layer);
      this.frGrund.legend.addTo(this.map);
    }
    else{
      this.map.removeLayer(this.frGrund.layer);
      this.frGrund.legend.remove();
    }
  }

  calculateScore(): void{

    //ideal 20, maximal 30, actual: 25
    //30 - 20 = 10
    //25 - 20 = 5
    // 1 - 5/10 = 0.5

    if (!this.ampFG.valid){
      return;
    }
    const gemLayers = this.gemeindenLayer._layers;
    const gemsAsList = Object.keys(gemLayers).map(index => {
      const gem = gemLayers[index];
      return gem;
    });
    for (const gemeinde of gemsAsList){
      const relatingRasterCells = [];
      raster.features.forEach(singleGitter => {
        if (singleGitter.properties.AGS === gemeinde.feature.properties.gemeindesc){
          relatingRasterCells.push(singleGitter);
        }
      });
      relatingRasterCells.forEach(rasterCell => {
        const pkwScoreOz = this.calcSingleScore(this.ampFG.controls.pkwMinOber.value, this.ampFG.controls.pkwMaxOber.value,
          rasterCell.properties.OZ_Pkw_Zeit);
        const pkwScoreMz = this.calcSingleScore(this.ampFG.controls.pkwMinMittel.value, this.ampFG.controls.pkwMaxMittel.value,
          rasterCell.properties.MZ_Pkw_Zeit);
        const pkwScoreGz = this.calcSingleScore(this.ampFG.controls.pkwMinGrund.value, this.ampFG.controls.pkwMaxGrund.value,
          rasterCell.properties.GZ_Pkw_Zeit);
        const opnvScoreOz = this.calcSingleScore(this.ampFG.controls.opnvMinOber.value, this.ampFG.controls.opnvMaxOber.value,
          rasterCell.properties.OZ_OEPNV);
        const opnvScoreMz = this.calcSingleScore(this.ampFG.controls.opnvMinMittel.value, this.ampFG.controls.opnvMaxMittel.value,
          rasterCell.properties.MZ_OEPNV);
        const opnvScoreGz = this.calcSingleScore(this.ampFG.controls.opnvMinGrund.value, this.ampFG.controls.opnvMaxGrund.value,
          rasterCell.properties.GZ_OEPNV);
        const bikeScoreOz = this.calcSingleScore(this.ampFG.controls.bikeMinOber.value, this.ampFG.controls.bikeMaxOber.value,
          rasterCell.properties.OZ_Bike_Zeit);
        const bikeScoreMz = this.calcSingleScore(this.ampFG.controls.bikeMinMittel.value, this.ampFG.controls.bikeMaxMittel.value,
          rasterCell.properties.MZ_Bike_Zeit);
        const bikeScoreGz = this.calcSingleScore(this.ampFG.controls.bikeMinGrund.value, this.ampFG.controls.bikeMaxGrund.value,
          rasterCell.properties.GZ_Bike_Zeit);
        // weight score
        const weightedScore = (pkwScoreOz + pkwScoreMz + pkwScoreGz) * this.ampFG.controls.pkwWeight.value +
                              (opnvScoreOz + opnvScoreMz + opnvScoreGz) * this.ampFG.controls.opnvWeight.value +
                              (bikeScoreOz + bikeScoreMz + bikeScoreGz) * this.ampFG.controls.bikeWeight.value;
        rasterCell.properties.score = weightedScore;
      });
      let sumOfScores = 0;
      relatingRasterCells.forEach(rasterCell => {
        sumOfScores += rasterCell.properties.score;
      });
      const averageScore = Math.round(sumOfScores / relatingRasterCells.length);
      gemeinde.feature.properties.score = averageScore;
    }
    const that = this;
    this.map.removeLayer(this.gemeindenLayer);
    const maxScore = 3 * this.ampFG.controls.pkwWeight.value
                   + 3 * this.ampFG.controls.opnvWeight.value
                   + 3 * this.ampFG.controls.bikeWeight.value;
    this.gemeindenLayer = L.Proj.geoJson(gemeinden, {
      onEachFeature: (feature: any, layer: any) => {
        if (feature.properties.score > maxScore * 0.66){
          layer.setStyle({
            color: 'green'
          });
        }
        if (feature.properties.score > maxScore * 0.33 && feature.properties.score <= maxScore * 0.66){
          layer.setStyle({
            color: 'orange'
          });
        }

        if (feature.properties.score <= maxScore * 0.33){
          layer.setStyle({
            color: 'red'
          });
        }

        if (feature.properties && feature.properties.raumbezeic && feature.properties.geog_name){
          const textToDisplay = feature.properties.geog_name + ': ' + feature.properties.raumbezeic + ' |'
          + ' Score: ' + feature.properties.score + '/' + maxScore;
          layer.bindPopup(textToDisplay);
        }
      }
    }).addTo(this.map);
  }

    private calcSingleScore(ideal: number, max: number, actual: number): number{
      if (actual <= ideal){
        return 1;
      }
      if (actual >= max){
        return 0;
      }
      const diff = max - ideal;
      if (diff === 0){
        return actual > ideal ? 0 : 1;
      }
      const scoreInverted = (actual - ideal) / diff;
      const scoreInvertedRounded = Math.round((scoreInverted + Number.EPSILON) * 100) / 100;
      return 1 - scoreInvertedRounded;

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

  resetLayers(currentLayer: CustLayer): void {
    for (const layer of this.layerList){
      if (layer === currentLayer){
        continue;
      }
      layer.isActivated = false;
      layer.legend.remove();
      this.map.removeLayer(layer.layer);
    }
  }

  formatLabel(value: number): number {
    return value;
  }

  next(): void{
    this.scoreCounter++;
  }
}

