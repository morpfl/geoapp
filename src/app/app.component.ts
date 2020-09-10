import { Component } from '@angular/core';
import * as L from 'leaflet';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'; 


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'geo-app';
  CM_ATTR = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  wmsVEBaseUrl = 'https://geodienste.sachsen.de/wms_geosn_verwaltungseinheiten/guest?';
  map: L.Map;
  zoomingIsAllowed = true;

  ngOnInit(){
    this.map = L.map('map').setView([50.8970, 14.0662], 10);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: this.CM_ATTR, opacity: 1}).addTo(this.map);

    L.tileLayer.wms(this.wmsVEBaseUrl, {
      layers: 'Landkreis_Kreisfreie_Stadt',
      opacity: 0.2,
    }).addTo(this.map);

  }

  popUpTest(){
    this.map.openPopup(L.popup().setLatLng(L.latLng(51.03, 13.75)).setContent('<p> Hier ist Dresden. </p>').openOn(this.map));
  }
}

