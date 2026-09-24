// Every slot context in one place. Every value is named, by the names the
// react and vue slots use; the main one is also what `let-x` with no name
// binds.
import type {
  StoriesSlideContext,
  StoriesHeaderContext,
  StoriesFooterContext,
  StoriesProgressBarContext,
  StoriesNavigationContext,
  StoriesGroupPreviewContext,
  StoriesLoadingContext,
  StoriesErrorContext,
} from '@reelkit/angular-stories-player';
