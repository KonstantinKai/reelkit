// 'carousel' lays the neighbouring users out as preview cards either side of
// the active story, the way Instagram does on the web. A phone always shows
// the active story alone, whatever this says.
@Component({
  template: `
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      desktopLayout="carousel"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class CarouselFeedComponent {}
