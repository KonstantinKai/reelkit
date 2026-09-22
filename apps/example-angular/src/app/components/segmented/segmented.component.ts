import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

/** One exclusive choice in a {@link SegmentedComponent}. */
export interface SegmentedOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * A labelled group of exclusive choices — the demo pages' switcher control,
 * matching the one the react and vue demos use so the three look alike.
 *
 * Purely presentational: the page owns the state and says which value is on.
 */
@Component({
  selector: 'app-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset style="border: 0; padding: 0; margin: 0">
      <legend
        style="color: rgba(255,255,255,0.5); font-size: 0.72rem; margin-bottom: 6px"
      >
        {{ legend() }}
      </legend>
      <div style="display: flex; gap: 6px">
        @for (option of options(); track option.value) {
          <button
            type="button"
            [disabled]="option.disabled"
            (click)="picked.emit(option.value)"
            [style.padding]="'6px 12px'"
            [style.border-radius.px]="8"
            [style.border]="'1px solid rgba(255,255,255,0.2)'"
            [style.background]="
              option.value === value()
                ? 'rgba(99,102,241,0.55)'
                : 'rgba(255,255,255,0.06)'
            "
            [style.color]="option.disabled ? 'rgba(255,255,255,0.3)' : '#fff'"
            [style.font-size]="'0.8rem'"
            [style.cursor]="option.disabled ? 'not-allowed' : 'pointer'"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </fieldset>
  `,
})
export class SegmentedComponent {
  /** Label above the row. */
  readonly legend = input.required<string>();

  /** The choices, in order. */
  readonly options = input.required<SegmentedOption[]>();

  /** Which choice is on. */
  readonly value = input.required<string>();

  /** The viewer picked a choice. */
  readonly picked = output<string>();
}
