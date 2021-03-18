import * as L from 'leaflet';
import { CustLayer } from './defs';

export function calcLegend(min: number, max: number, interval: number): any{
  const legend = new L.Control();
  legend.setPosition('bottomleft');
  legend.onAdd = (map: any): HTMLElement => {
      const div: HTMLElement = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<h4>Fahrzeit in Minuten</h4>';
      div.style.padding = '6px 8px';
      div.style.font = '14px/16px Arial, Helvetica, sans-serif';
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
      div.style.borderRadius = '5px';
      div.style.lineHeight = '18px';
      div.style.color = '#555';
      const grades = [Math.round(min), Math.round(min + interval), Math.round(min + 2 * interval),
        Math.round(min + 3 * interval), Math.round(min + 4 * interval)];
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style = "opacity: 0.7; float: left; width: 18px; height: 18px; margin-right: 8px; background:' + getColor(i + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '&ndash;' + Math.round(max));
      }

      return div;
  };
  return legend;
}


export function calcScoreLegend(): any{
  const legend = new L.Control();
  legend.setPosition('bottomleft');
  legend.onAdd = (map: any): HTMLElement => {
      const div: HTMLElement = L.DomUtil.create('div', 'legend');
      div.innerHTML += '<h4>Score</h4>';
      div.style.padding = '6px 8px';
      div.style.font = '14px/16px Arial, Helvetica, sans-serif';
      div.style.background = 'rgba(255,255,255,0.8)';
      div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
      div.style.borderRadius = '5px';
      div.style.lineHeight = '18px';
      div.style.color = '#555';
      const grades = [0, 33, 66];
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
        '<i style = "opacity: 0.7; float: left; width: 18px; height: 18px; margin-right: 8px; background:' + getLegendColor(i + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '&ndash; 100');
      }

      return div;
    };
  return legend;
}


export function getLegendColor(counter: number): string{
  if (counter === 1){
    return 'red';
  }
  if (counter === 2){
    return 'orange';
  }
  if (counter === 3){
    return 'green';
  }
}


export function getColor(counter: number): string{
  if (counter === 1){
    return '#31B404';
  }
  if (counter === 2){
    return '#9AFE2E';
  }
  if (counter === 3){
    return '#FFFF00';
  }
  if (counter === 4){
    return '#FF8000';
  }
  if (counter === 5){
    return '#FF0000';
  }
}
