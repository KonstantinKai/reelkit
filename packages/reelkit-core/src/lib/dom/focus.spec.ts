/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  captureFocusForReturn,
  createFocusTrap,
  getFocusableElements,
} from './focus';

const mountContainer = (html: string): HTMLElement => {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('getFocusableElements', () => {
  it('returns buttons, links, inputs, selects, textareas in DOM order', () => {
    const root = mountContainer(`
      <a href="#">link</a>
      <button>btn</button>
      <input type="text" />
      <select><option>a</option></select>
      <textarea></textarea>
    `);

    const focusables = getFocusableElements(root);
    expect(focusables.map((el) => el.tagName)).toEqual([
      'A',
      'BUTTON',
      'INPUT',
      'SELECT',
      'TEXTAREA',
    ]);
  });

  it('skips disabled form controls', () => {
    const root = mountContainer(`
      <button>ok</button>
      <button disabled>skip</button>
      <input type="text" disabled />
    `);
    expect(getFocusableElements(root)).toHaveLength(1);
  });

  it('skips type="hidden" inputs', () => {
    const root = mountContainer(`
      <input type="hidden" />
      <input type="text" />
    `);
    expect(getFocusableElements(root)).toHaveLength(1);
  });

  it('skips elements with tabindex="-1"', () => {
    const root = mountContainer(`
      <button>ok</button>
      <div tabindex="-1">skip</div>
      <div tabindex="0">ok</div>
    `);
    expect(getFocusableElements(root)).toHaveLength(2);
  });

  it('skips hidden elements', () => {
    const root = mountContainer(`
      <button>ok</button>
      <button hidden>skip</button>
    `);
    expect(getFocusableElements(root)).toHaveLength(1);
  });
});

describe('captureFocusForReturn', () => {
  it('restores focus to the previously-focused element', () => {
    mountContainer(`
      <button id="a">a</button>
      <button id="b">b</button>
    `);
    const a = document.getElementById('a') as HTMLButtonElement;
    a.focus();
    expect(document.activeElement).toBe(a);

    const restore = captureFocusForReturn();
    (document.getElementById('b') as HTMLButtonElement).focus();

    restore();
    expect(document.activeElement).toBe(a);
  });

  it('is a no-op when the captured element has been removed', () => {
    mountContainer(`<button id="a">a</button>`);
    const a = document.getElementById('a') as HTMLButtonElement;
    a.focus();
    const restore = captureFocusForReturn();

    a.remove();

    // Should not throw, should not change focus
    expect(() => restore()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });
});

describe('createFocusTrap', () => {
  it('wraps Tab from the last focusable to the first', () => {
    const root = mountContainer(`
      <button id="first">first</button>
      <button id="middle">middle</button>
      <button id="last">last</button>
    `);
    const first = document.getElementById('first') as HTMLButtonElement;
    const last = document.getElementById('last') as HTMLButtonElement;

    const release = createFocusTrap(root);
    last.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

    expect(document.activeElement).toBe(first);
    release();
  });

  it('wraps Shift+Tab from the first focusable to the last', () => {
    const root = mountContainer(`
      <button id="first">first</button>
      <button id="last">last</button>
    `);
    const first = document.getElementById('first') as HTMLButtonElement;
    const last = document.getElementById('last') as HTMLButtonElement;

    const release = createFocusTrap(root);
    first.focus();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }),
    );

    expect(document.activeElement).toBe(last);
    release();
  });

  it('pulls focus back when it escapes outside the container', () => {
    const root = mountContainer(`<button id="inside">inside</button>`);
    const outside = document.createElement('button');
    outside.id = 'outside';
    document.body.appendChild(outside);

    const inside = document.getElementById('inside') as HTMLButtonElement;

    const release = createFocusTrap(root);
    outside.focus();

    expect(document.activeElement).toBe(inside);
    release();
  });

  it('keeps focus on the container when there are no focusable children', () => {
    const root = mountContainer(`<p>no buttons here</p>`);
    root.tabIndex = -1;
    root.focus();

    const release = createFocusTrap(root);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

    expect(document.activeElement).toBe(root);
    release();
  });

  it('release() stops trapping', () => {
    const root = mountContainer(`<button id="inside">inside</button>`);
    const outside = document.createElement('button');
    outside.id = 'outside';
    document.body.appendChild(outside);

    const release = createFocusTrap(root);
    release();

    outside.focus();
    expect(document.activeElement).toBe(outside);
  });
});
