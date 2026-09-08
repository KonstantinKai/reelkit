import type React from 'react';

const segButton = (active: boolean, disabled = false): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: active ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.06)',
  color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
  fontSize: '0.8rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

/**
 * A labelled group of exclusive choices, the demo pages' switcher control.
 * Purely presentational: the caller owns the state and passes `active` per
 * option.
 */
export const Segmented = ({
  legend,
  options,
}: {
  legend: string;
  options: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
  }[];
}) => (
  <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
    <legend
      style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.72rem',
        marginBottom: 6,
      }}
    >
      {legend}
    </legend>
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          disabled={o.disabled}
          style={segButton(o.active, o.disabled)}
          onClick={o.onClick}
        >
          {o.label}
        </button>
      ))}
    </div>
  </fieldset>
);
