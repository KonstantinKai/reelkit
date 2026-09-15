import { Component } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      @for (img of images; track img.src; let i = $index) {
        <button (click)="openIndex = i" style="aspect-ratio:4/3;cursor:pointer">
          <img [src]="img.src" style="width:100%;height:100%;object-fit:cover" />
        </button>
      }
    </div>

    <rk-lightbox-overlay
      [isOpen]="openIndex !== null"
      [items]="images"
      [initialIndex]="openIndex ?? 0"
      (closed)="openIndex = null"
    />
  `,
})
export class AppComponent {
  images = images;
  openIndex: number | null = null;
}
