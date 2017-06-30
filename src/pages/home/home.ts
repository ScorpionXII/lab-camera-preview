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
    this.getOrientation().then(result => this.showToast(result, 1500, 'top'));
  }

  public takePicture() {
    this.cameraPreview.takePicture().then(imageData => {
      let base64Data = imageData.toString();

      this.showToast(base64Data, 1500, 'bottom');

      this.base64ToGallery.base64ToGallery(base64Data, { prefix: 'bnb-corp_'}).then(result => {
          this.showToast(result, 1500, 'bottom');
        },
        error => {
          this.showToast(error, 1500, 'bottom');
        }
      );
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

  private showToast(message: string, duration: number, position: string) {
    this.toastCtrl.create({
      message: message,
      duration: duration,
      position: position
    }).present();
  }

  private rotateBase64Image(base64Data, degrees): Promise<string>{
        return new Promise((resolve) => {
          let canvas = document.createElement('canvas');
          let canvasContext = canvas.getContext('2d');
          let image = new Image();

          let that = this;

          image.src = base64Data;
          image.onload = function() {
            canvasContext.translate(image.width, image.height);
            canvasContext.rotate(degrees * Math.PI / 180);
            canvasContext.drawImage(image, 0, 0);
            that.showToast(canvas.toDataURL(), 3000, 'top');
            resolve(canvas.toDataURL());
          };
        });
  }

  // public rotateBase64Image(base64ImageSrc) {
  //   var canvas = document.createElement("canvas");
  //   var img = new Image();
  //   img.src = base64ImageSrc;
  //   canvas.width = img.width;
  //   canvas.height = img.height;
  //   var context = canvas.getContext("2d");
  //   context.translate(img.width * 0.5, img.height * 0.5);
  //   context.rotate(0.5 * Math.PI);
  //   context.translate(-img.height * 0.5, -img.width * 0.5);
  //   context.drawImage(img, 0, 0);
  //   this.showToast(canvas.toDataURL().toString(), 1000, 'top');
  //   return canvas.toDataURL();
  // }

}
