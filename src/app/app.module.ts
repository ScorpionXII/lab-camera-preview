import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Diagnostic } from "@ionic-native/diagnostic";
import { CameraPreview } from "@ionic-native/camera-preview";
import { Base64ToGallery } from "@ionic-native/base64-to-gallery";
import { ScreenOrientation } from "@ionic-native/screen-orientation";
import { DeviceMotion } from "@ionic-native/device-motion";

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Diagnostic,
    CameraPreview,
    Base64ToGallery,
    ScreenOrientation,
    DeviceMotion,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
