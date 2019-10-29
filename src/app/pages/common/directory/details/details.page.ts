import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import leaflet from 'leaflet';
import { EsriProvider } from 'leaflet-geosearch';
import { ToastController, NavController, MenuController } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss']
})
export class DetailsPage implements OnInit {

  private merchant: any;
  private map: any;
  private locations = [];
  private hasMap = false;
  private loading = true;
  private menuOpen = false;
  private url: string;

  @ViewChild('mapContainer') container: ElementRef;

  constructor(
    private provider: EsriProvider,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private renderer: Renderer2,
    private menuCtrl: MenuController,
    private device: Device
  ) {
    this.merchant = history.state.merchant;
    this.url = history.state.url;
    this.menuCtrl.enable(false, 'locations');

    document.addEventListener('ionDidClose', () => {
      this.closeMenu();
    });
  }

  ngOnInit() {
    this.loadMap();
  }

  async loadMap() {
    if (leaflet.DomUtil.get('map')) { leaflet.DomUtil.get('map').remove(); }
    const map = this.renderer.createElement('div');
    this.renderer.setAttribute(map, 'id', 'map');
    this.renderer.appendChild(this.container.nativeElement, map);

    this.map = leaflet.map('map').setView([0, 0], 15);
    const bounds = [];

    const leafletIcon = leaflet.icon({
      iconUrl: 'assets/marker-icon-2x.png',
      iconSize: [25, 40],
      iconAnchor: [15, 40],
      popupAchor: [-3, -76],
      shadowUrl: 'assets/marker-shadow.png',
      shadowSize: [68, 40],
      shadowAnchor: [22, 40]
    });

    for (const location of this.merchant.locations) {
      const results = await this.provider.search({ query: `${location.address}, ${location.city}, ${location.state}` });
      const coords = [results[0].y, results[0].x];
      this.locations.push({ id: location.store_id, coords });
      bounds.push(coords);
      const marker = leaflet.marker(coords, {icon: leafletIcon});
      const popupContent = `<ion-item class="popup" lines="none">
        <ion-icon name="navigate" color="secondary" id="navigateIcon"></ion-icon>
        <ion-label>${location.address}</ion-label>
      </ion-item>`;
      marker.bindPopup(popupContent, {className: 'localPopup'});
      marker.addTo(this.map);
      marker.on('click', () => {
        marker.openPopup();
        this.focusOn(coords);
        document.getElementById('navigateIcon').addEventListener('click', () => {
          this.navTo(location, coords);
        });
      });
      marker.on('popupclose', () => {
        document.getElementById('navigateIcon').removeEventListener('click', () => {});
      });
    }

    if (this.locations && this.locations.length > 0) {
      this.hasMap = true;
      setTimeout(() => {
        this.map.invalidateSize();
      }, 0);
      this.map.fitBounds(bounds, { maxZoom: 17 });
      leaflet.tileLayer('https:/{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(this.map);
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Unable to make the map',
        color: 'danger',
        duration: 1500
      });

      await toast.present();
    }
    this.loading = false;
  }

  focusOn(input: any, origin?: string) {
    if (origin === 'menuList') { this.closeMenu(); }
    const coords = origin === 'menuList' ? this.locations.filter((loc: any) => loc.id === input.store_id)[0].coords : input;
    this.map.setView(coords);
  }

  navTo(location: any, coords: any) {
    if (this.device.platform === 'iOS') {
      window.open(`maps://?q=${coords}`, '_system');
    } else {
      const label = encodeURI(location.address);
      window.open(`geo:0,0?q=${coords}(${label})`, '_system');
    }
  }

  openMenu() {
    this.menuOpen = true;
    this.menuCtrl.enable(true, 'locations').then(() => {
      this.menuCtrl.open('locations');
    });
  }

  closeMenu() {
    this.menuOpen = false;
    this.menuCtrl.close('locations').then(() => {
      this.menuCtrl.enable(false, 'locations');
    });
  }

  goBack() {
    this.navCtrl.navigateForward(this.url);
  }
}
