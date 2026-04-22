import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  BodyLockService,
  type ReelApi,
} from '@reelkit/angular';

const TOTAL_SLIDES = 10000;
const NESTED_ITEM_COUNT = 10;
const SIZE_MODE_KEY = 'reelkit-fullpage-size-mode';
const INDICATOR_MODE_KEY = 'reelkit-fullpage-indicator-mode';
const NAV_KEYS_KEY = 'reelkit-fullpage-nav-keys';
const WHEEL_KEY = 'reelkit-fullpage-wheel';

type SizeMode = 'explicit' | 'auto';
type IndicatorMode = 'auto' | 'controlled';

const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

const getSlideContent = (
  index: number,
): { title: string; description: string } => ({
  title: `Slide ${index + 1}`,
  description:
    index === 0
      ? 'Swipe up or down to navigate'
      : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

@Component({
  selector: 'app-full-page-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReelComponent,
    ReelIndicatorComponent,
    RkReelItemDirective,
    FormsModule,
  ],
  template: `
    <div style="width: 100%; height: 100dvh; overflow: hidden;">
      <rk-reel
        [count]="totalSlides"
        [size]="sizeMode() === 'explicit' ? explicitSize() : undefined"
        direction="vertical"
        [loop]="false"
        [enableNavKeys]="navKeys()"
        [enableWheel]="wheel()"
        (apiReady)="onApiReady($event)"
        (afterChange)="onAfterChange($event)"
        [style.width]="sizeMode() === 'auto' ? '100%' : null"
        [style.height]="sizeMode() === 'auto' ? '100%' : null"
      >
        <ng-template rkReelItem let-index let-size="size">
          @if (index % 3 === 2) {
            <rk-reel
              [count]="nestedItemCount"
              [size]="[size[0], size[1]]"
              direction="horizontal"
              [loop]="true"
              [enableNavKeys]="navKeys()"
              [enableWheel]="wheel()"
            >
              <ng-template rkReelItem let-nestedIndex let-nestedSize="size">
                <div
                  [style.width.px]="nestedSize[0]"
                  [style.height.px]="nestedSize[1]"
                  [style.background-color]="
                    getSlideColor(index * nestedItemCount + nestedIndex)
                  "
                  style="display: flex; flex-direction: column; justify-content: center; align-items: center; color: #000;"
                >
                  <h1 style="font-size: 2.5rem; margin-bottom: 8px;">
                    Slide {{ index + 1 }}.{{ nestedIndex + 1 }}
                  </h1>
                  <p style="font-size: 1.2rem; opacity: 0.7;">
                    Swipe left or right
                  </p>
                </div>
              </ng-template>
              <div
                style="
                  position: absolute;
                  bottom: 160px;
                  left: 50%;
                  transform: translateX(-50%);
                  z-index: 10;
                "
              >
                <rk-reel-indicator
                  direction="horizontal"
                  [visible]="4"
                  [radius]="3"
                  [gap]="5"
                />
              </div>
            </rk-reel>
          } @else {
            <div
              [style.width.px]="size[0]"
              [style.height.px]="size[1]"
              [style.background-color]="getSlideColor(index)"
              style="display: flex; flex-direction: column; justify-content: center; align-items: center; color: #000;"
            >
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">
                {{ getSlideContent(index).title }}
              </h1>
              <p style="font-size: 1.5rem; opacity: 0.7;">
                {{ getSlideContent(index).description }}
              </p>
            </div>
          }
        </ng-template>

        <div
          style="
            position: absolute;
            top: 48px;
            left: 50%;
            transform: translateX(-50%);
            padding: 6px 14px;
            background-color: rgba(0,0,0,0.5);
            color: #fff;
            border-radius: 20px;
            font-size: 0.8rem;
            z-index: 10;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          "
        >
          {{ (activeIndex() + 1).toLocaleString() }} /
          {{ totalSlides.toLocaleString() }}
        </div>

        <div
          style="
            position: absolute;
            top: 48px;
            right: 40px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 10;
          "
        >
          <button
            (click)="toggleSizeMode()"
            style="
              padding: 6px 12px;
              background-color: rgba(0,0,0,0.5);
              color: #fff;
              border: none;
              border-radius: 20px;
              font-size: 0.75rem;
              cursor: pointer;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            "
          >
            size:
            {{
              sizeMode() === 'explicit'
                ? '[' + explicitSize()[0] + ', ' + explicitSize()[1] + ']'
                : 'auto'
            }}
          </button>
          <button
            (click)="toggleIndicatorMode()"
            data-testid="indicator-mode-toggle"
            style="
              padding: 6px 12px;
              background-color: rgba(0,0,0,0.5);
              color: #fff;
              border: none;
              border-radius: 20px;
              font-size: 0.75rem;
              cursor: pointer;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            "
          >
            indicator: {{ indicatorMode() }}
          </button>
          <button
            (click)="toggleNavKeys()"
            [style.background-color]="
              navKeys() ? 'rgba(0,0,0,0.5)' : 'rgba(255,0,0,0.4)'
            "
            style="
              padding: 6px 12px;
              color: #fff;
              border: none;
              border-radius: 20px;
              font-size: 0.75rem;
              cursor: pointer;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            "
          >
            navKeys: {{ navKeys() ? 'on' : 'off' }}
          </button>
          <button
            (click)="toggleWheel()"
            [style.background-color]="
              wheel() ? 'rgba(0,0,0,0.5)' : 'rgba(255,0,0,0.4)'
            "
            style="
              padding: 6px 12px;
              color: #fff;
              border: none;
              border-radius: 20px;
              font-size: 0.75rem;
              cursor: pointer;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            "
          >
            wheel: {{ wheel() ? 'on' : 'off' }}
          </button>
        </div>

        <div
          style="
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            z-index: 10;
          "
        >
          <div style="display: flex; gap: 8px;">
            <input
              type="number"
              [min]="1"
              [max]="totalSlides"
              [(ngModel)]="goToValue"
              (keydown.enter)="goToSlide(); $event.target.blur()"
              (blur)="onInputBlur()"
              placeholder="Slide #"
              style="
                padding: 10px 14px;
                font-size: 0.9rem;
                background-color: rgba(0,0,0,0.5);
                color: #fff;
                border: none;
                border-radius: 8px;
                width: 90px;
                outline: none;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              "
            />
            <button
              (click)="goToSlide()"
              style="
                padding: 10px 20px;
                font-size: 0.9rem;
                background-color: rgba(0,0,0,0.6);
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              "
            >
              Go
            </button>
          </div>

          <div style="display: flex; gap: 10px;">
            <button
              (click)="reelApi?.prev()"
              style="
                padding: 10px 20px;
                font-size: 0.9rem;
                background-color: rgba(0,0,0,0.5);
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              "
            >
              ↑ Previous
            </button>
            <button
              (click)="reelApi?.next()"
              style="
                padding: 10px 20px;
                font-size: 0.9rem;
                background-color: rgba(0,0,0,0.5);
                color: #fff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
              "
            >
              Next ↓
            </button>
          </div>
        </div>

        <div
          style="
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
          "
        >
          <rk-reel-indicator
            direction="vertical"
            [visible]="4"
            [radius]="4"
            [gap]="6"
            [count]="indicatorMode() === 'controlled' ? totalSlides : undefined"
            [active]="
              indicatorMode() === 'controlled' ? activeIndex() : undefined
            "
            (dotClick)="reelApi?.goTo($event, true)"
          />
        </div>
      </rk-reel>
    </div>
  `,
})
export class FullPageSliderComponent implements OnInit, OnDestroy {
  private readonly bodyLock = inject(BodyLockService);

  protected readonly totalSlides = TOTAL_SLIDES;
  protected readonly nestedItemCount = NESTED_ITEM_COUNT;
  protected readonly activeIndex = signal(0);
  protected readonly sizeMode = signal<SizeMode>(
    (localStorage.getItem(SIZE_MODE_KEY) as SizeMode) ?? 'explicit',
  );
  protected readonly indicatorMode = signal<IndicatorMode>(
    (localStorage.getItem(INDICATOR_MODE_KEY) as IndicatorMode) ?? 'auto',
  );
  protected readonly explicitSize = signal<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  protected readonly navKeys = signal(
    localStorage.getItem(NAV_KEYS_KEY) !== 'false',
  );
  protected readonly wheel = signal(
    localStorage.getItem(WHEEL_KEY) !== 'false',
  );
  protected goToValue = '';
  protected reelApi: ReelApi | null = null;

  protected readonly getSlideColor = getSlideColor;
  protected readonly getSlideContent = getSlideContent;

  private readonly handleResize = (): void => {
    if (this.sizeMode() !== 'explicit') return;
    this.explicitSize.set([window.innerWidth, window.innerHeight]);
    this.reelApi?.adjust();
  };

  ngOnInit(): void {
    this.bodyLock.lock();
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    this.bodyLock.unlock();
    window.removeEventListener('resize', this.handleResize);
  }

  protected onApiReady(api: ReelApi): void {
    this.reelApi = api;
  }

  protected onAfterChange(event: { index: number }): void {
    this.activeIndex.set(event.index);
  }

  protected toggleSizeMode(): void {
    const next = this.sizeMode() === 'explicit' ? 'auto' : 'explicit';
    localStorage.setItem(SIZE_MODE_KEY, next);
    this.sizeMode.set(next);
  }

  protected toggleIndicatorMode(): void {
    const next = this.indicatorMode() === 'auto' ? 'controlled' : 'auto';
    localStorage.setItem(INDICATOR_MODE_KEY, next);
    this.indicatorMode.set(next);
  }

  protected toggleNavKeys(): void {
    const next = !this.navKeys();
    localStorage.setItem(NAV_KEYS_KEY, String(next));
    this.navKeys.set(next);
  }

  protected toggleWheel(): void {
    const next = !this.wheel();
    localStorage.setItem(WHEEL_KEY, String(next));
    this.wheel.set(next);
  }

  protected goToSlide(): void {
    const index = parseInt(this.goToValue, 10) - 1;
    if (index >= 0 && index < TOTAL_SLIDES) {
      this.reelApi?.goTo(index, true);
    }
  }

  protected onInputBlur(): void {
    window.scrollTo(0, 0);
    this.reelApi?.adjust();
  }
}
