/**
 * Whether a key event belongs to an input method still composing text.
 *
 * Japanese and Chinese readers type through an input method: Enter confirms
 * the kana-to-kanji conversion and Escape cancels it. Neither is meant for
 * the page, so a shortcut acting on those keys would navigate away mid-word
 * or close the dialog the reader is typing into. Safari reports the confirming
 * Enter with `isComposing` already false, so the legacy key code 229 is the
 * only sign it still belongs to the input method.
 */
export function isImeComposing(
  event: Pick<KeyboardEvent, 'isComposing' | 'keyCode'>,
): boolean {
  return event.isComposing || event.keyCode === 229;
}
