import * as L from 'leaflet';
import 'proj4leaflet';

export const crs = new L.Proj.CRS('EPSG:25833',
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
        resolutions: [
          8192, 4096, 2048, 1024, 512, 256, 128
        ],
        origin: [0, 0],
});

export const oberzentrumMarker = {
    radius: 20,
    fillOpacity: 0.85,
    color: 'orange'
};

export const mittelzentrumMarker = {
    radius: 10,
    fillOpacity: 0.85,
    color: 'orange'
};

export const grundzentrumMarker = {
    radius: 5,
    fillOpacity: 0.85,
    color: 'orange'
};

export class CustLayer {
  layer: any;
  isActivated: boolean;
  public CustLayer(): CustLayer {
    this.layer = null;
    this.isActivated = false;
    return this;
  }
}
