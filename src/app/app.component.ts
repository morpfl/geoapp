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
  map: L.Map;
  zoomingIsAllowed = true;

  ngOnInit(){
    this.map = L.map('map').setView([51.03, 13.75], 9);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: this.CM_ATTR}).addTo(this.map);
  }

  popUpTest(){
    this.map.openPopup(L.popup().setLatLng(L.latLng(51.03, 13.75)).setContent('<p> Hier ist Dresden. </p>').openOn(this.map));
  }
}

