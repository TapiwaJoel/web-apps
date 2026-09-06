import { bootstrapApplication } from '@angular/platform-browser';
import {
  clearDevStaleChunkFlag,
  installDevStaleChunkRecovery,
} from '@mushaviri/util';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { environment } from './environments/environment';

installDevStaleChunkRecovery(environment.production);

bootstrapApplication(AppComponent, appConfig)
  .then(() => clearDevStaleChunkFlag(environment.production))
  .catch((err) => console.error(err));
