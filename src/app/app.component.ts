import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'proj4leaflet';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { oberzentren, mittelzentren, gemeinden } from './data/oberzentren';
import 'proj4';


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
  gemeindenLayer: L.Proj.GeoJSON;



  ngOnInit(){

    const crs = new L.Proj.CRS('EPSG:25832',
      '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
      {
        resolutions: [
          8192, 4096, 2048, 1024, 512, 256, 128
        ],
        origin: [0, 0],
    });

    const mittelzentrumMarker = {
      radius: 10,
      fillOpacity: 0.85,
      color: 'green'
    };

    const oberzentrumMarker = {
      radius: 20,
      fillOpacity: 0.85,
      color: 'green'
    };

    this.map = L.map('map').setView([50.8970, 14.0662], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: this.CM_ATTR}).addTo(this.map);
    this.gemeindenLayer = L.Proj.geoJson(gemeinden, {
      onEachFeature: this.showPopupContent
    });
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

    this.map.addLayer(this.gemeindenLayer);

    // L.tileLayer.wms(this.wmsVEBaseUrl, {
    //   layers: 'Landkreis_Kreisfreie_Stadt',
    //   opacity: 0.2,
    // }).addTo(this.map);

  }

  showPopupContent(feature, layer): void{
    if (feature.properties && feature.properties.raumbezeic && feature.properties.geog_name){
      const textToDisplay = feature.properties.geog_name + ': ' + feature.properties.raumbezeic;
      layer.bindPopup(textToDisplay);
    }
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

  toggleGemeindenLayer(checked: boolean): void{
    if (checked) {
      this.map.addLayer(this.gemeindenLayer);
    }
    else{
      this.map.removeLayer(this.gemeindenLayer);
    }
  }

  popUpTest(){
    this.map.openPopup(L.popup().setLatLng(L.latLng(51.03, 13.75)).setContent('<p> Hier ist Dresden. </p>').openOn(this.map));
  }
}

