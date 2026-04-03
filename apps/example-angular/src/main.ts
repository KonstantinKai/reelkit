import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { setCdnBase } from '@reelkit/example-data';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (isDevMode()) setCdnBase('/cdn');

bootstrapApplication(App, appConfig).catch(() => {
  /* noop */
});
