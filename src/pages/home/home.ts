import { Diagnostic } from '@ionic-native/diagnostic';
import { Component } from '@angular/core';
import { NavController, ToastController} from 'ionic-angular';
import {CameraPreview, CameraPreviewOptions, /*CameraPreviewPictureOptions*/ } from "@ionic-native/camera-preview";
import {Base64ToGallery} from "@ionic-native/base64-to-gallery";
import {ScreenOrientation} from "@ionic-native/screen-orientation";
import {DeviceMotion, DeviceMotionAccelerationData} from "@ionic-native/device-motion";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // Options For Camera Viewport
  cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: 'rear',
    tapPhoto: true,
    previewDrag: true,
    toBack: true,
    alpha: 1
  };

  constructor(
      public navCtrl: NavController,
      public diagnostic: Diagnostic,
      public cameraPreview: CameraPreview,
      public base64ToGallery: Base64ToGallery,
      public screenOrientation: ScreenOrientation,
      public deviceMotion: DeviceMotion,
      public toastCtrl: ToastController,
  ){
    this.screenOrientation.lock('portrait').then();
    this.checkPermissions();
  }

  public checkPermissions() {
    this.diagnostic.isCameraAuthorized().then(authorized => {
      if (authorized) {
        this.showToast('Camera Authorized', 1500, 'bottom');
        this.initializePreview();
      } else {
        this.diagnostic.requestCameraAuthorization().then(status => {
          if (status == this.diagnostic.permissionStatus.GRANTED)
            this.initializePreview();
          else
            this.showToast('Cannot access camera', 1500, 'bottom');
        });
      }
    });
  }

  public initializePreview() {
    this.cameraPreview.startCamera(this.cameraPreviewOpts).then();
  }

  public showOrientation() {
    this.getOrientation().then(result => {
      console.log(result);
      this.showToast(result, 1500, 'top')
    });
  }

  public takePicture() {
    this.cameraPreview.takePicture().then(imageData => {
      this.savePicture(imageData, 'bnb-corp_').then(result => {
        this.showToast(result, 1500, 'bottom');
      });
    });
  }

  private getOrientation(): Promise<string>{
      return new Promise((resolve, reject) => {
        this.deviceMotion.getCurrentAcceleration().then(
          (acceleration: DeviceMotionAccelerationData) => {
            if(Math.abs(acceleration.x) > Math.abs(acceleration.y)) {
              if(acceleration.x > 0)
                resolve('landscape');
              else
                resolve('landscape-reversed');
            } else {
              if(acceleration.y > 0)
                resolve('portrait');
              else
                resolve('portrait-reversed');
            }
          },
          (error: any) => reject(error)
        );
      });
  }

  private rotateImage(imageData, degrees): Promise<string> {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      let canvasContext = canvas.getContext('2d');
      let image = new Image();

      image.src = "data:image/jpeg;base64," + imageData;

      image.onload = function() {

        if ((degrees / 90) % 2 === 0) {
          canvas.width = image.width;
          canvas.height = image.height;
        } else {
          canvas.width = image.height;
          canvas.height = image.width;
        }

        switch (degrees) {
          case 90:
            canvasContext.translate(canvas.width, 0);
            break;
          case 180:
            canvasContext.translate(canvas.width, canvas.height);
            break;
          case 270:
            canvasContext.translate(0, canvas.height);
            break;
        }

        canvasContext.rotate(degrees * Math.PI / 180);
        canvasContext.drawImage(image, 0, 0);
        resolve(canvas.toDataURL());
      }
    });
  }

  private savePicture(imageData, namePrefix): Promise<string> {
    return new Promise((resolve) => {
      this.getOrientation().then(orientation => {

        if (orientation == 'portrait') {
          this.base64ToGallery.base64ToGallery(imageData.toString(), {prefix: namePrefix}).then(result => {
              resolve(result);
            },
            error => {
              resolve(error);
            }
          );
        } else {
          let rotation;

          if(orientation == 'landscape')
            rotation = 270;
          else if (orientation == 'portrait-reversed')
            rotation = 180;
          else
            rotation = 90;

          this.rotateImage(imageData[0], rotation).then(base64Data => {
            this.base64ToGallery.base64ToGallery(base64Data, { prefix: namePrefix}).then(result => {
                resolve(result)
              },
              error => {
                resolve(error);
              }
            );
          });
        }
      });
    });
  }

  private showToast(message: string, duration: number, position: string) {
    this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position
    }).present();
  }
}
