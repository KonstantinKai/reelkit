export type Offset = [x: number, y: number];
export type EventKind = 'touch' | 'mouse';
export type DragAxis = 'horizontal' | 'vertical' | null;

export interface GestureEvent {
  globalPosition: Offset;
  localPosition: Offset;
  sourceTimestamp: number;
}

export interface GestureCommonEvent extends GestureEvent {
  kind: EventKind;
}

export interface GestureAxisDragUpdateEvent extends GestureEvent {
  delta: Offset;
  distance: Offset;
  primaryDelta: number;
  primaryDistance: number;
  cancel: () => void;
}

export interface GestureAxisDragEndEvent
  extends Omit<GestureAxisDragUpdateEvent, 'cancel'> {
  velocity: Offset;
  primaryVelocity: number;
}

export interface GestureDragEndEvent
  extends Omit<GestureAxisDragEndEvent, 'primaryDelta' | 'primaryDistance' | 'primaryVelocity'> {}

export interface GestureControllerConfig {
  useTouchEventsOnly?: boolean;
  longPressDurationMs?: number;
}

export interface GestureControllerEvents {
  onLongPress?: (event: GestureCommonEvent) => void;
  onLongPressEnd?: (event: GestureEvent) => void;
  onTapDown?: (event: GestureCommonEvent) => void;
  onTapUp?: (event: GestureCommonEvent) => void;
  onHorizontalDragStart?: (event: GestureCommonEvent) => void;
  onHorizontalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;
  onHorizontalDragEnd?: (event: GestureAxisDragEndEvent) => void;
  onVerticalDragStart?: (event: GestureCommonEvent) => void;
  onVerticalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;
  onVerticalDragEnd?: (event: GestureAxisDragEndEvent) => void;
  onDragEnd?: (event: GestureDragEndEvent) => void;
}

export interface GestureController {
  attach(element: HTMLElement): void;
  detach(): void;
  observe(): void;
  unobserve(): void;
  updateEvents(events: Partial<GestureControllerEvents>): void;
}
