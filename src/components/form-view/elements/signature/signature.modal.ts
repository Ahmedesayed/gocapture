import { Component, NgZone, ViewChild, HostListener } from '@angular/core';
import { SignaturePad } from "./signature-pad";
import { Content } from 'ionic-angular/components/content/content';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import {ThemeProvider} from "../../../../providers/theme/theme";

@Component({
	selector: 'signature-modal',
	templateUrl: 'signature.modal.html'
})
export class SignatureModal {

	@ViewChild(SignaturePad) signaturePad: SignaturePad;

	@ViewChild("content") content: Content;

	signaturePadOptions: Object = {
		'minWidth': 5,
		'canvasWidth': 500,
		'canvasHeight': 300
	};

	hasSignature: boolean = false;

  selectedTheme;

	constructor(private zone: NgZone,
              private viewCtrl: ViewController,
              public themeProvider: ThemeProvider) {
    this.themeProvider.getActiveTheme().subscribe(val => this.selectedTheme = val);
	}

	ionViewDidEnter(){
		setTimeout(()=>{
			let dim = this.content.getContentDimensions();
			let width = dim.contentWidth - 32;
			let height = dim.contentHeight - /*this.content.contentBottom - this.content.contentTop -*/ 32;
			this.signaturePad.set("canvasWidth", width);
			this.signaturePad.set("canvasHeight", height);
		}, 800);
	}

	ngAfterViewInit() {
		this.clear();
	}

	@HostListener("window:resize", ["$event"])
	onResize(event){
		let dim = this.content.getContentDimensions();
		let width = dim.contentWidth - 32;
		let height = dim.contentHeight - /*this.content.contentBottom - this.content.contentTop -*/ 32;
		this.signaturePad.set("canvasWidth", width);
		this.signaturePad.set("canvasHeight", height);
	}

	drawComplete() {
		this.zone.run(()=>{
			this.hasSignature = true;
		});
		//console.log("Done");
	}

	drawStart() {
		//console.log('begin drawing');
	}

	clear(){
		this.signaturePad.clear();
	}

	cancel() {
		this.viewCtrl.dismiss(null);
	}

	done() {
		if(this.hasSignature){
			let canvas = this.signaturePad["signaturePad"]._canvas;
			let img = this.cropSignatureCanvas(canvas);
			this.viewCtrl.dismiss(img);
		}
	}

     cropSignatureCanvas(canvas) {

            // First duplicate the canvas to not alter the original
            var croppedCanvas: any = document.createElement('canvas'),
                croppedCtx    = croppedCanvas.getContext('2d');

                croppedCanvas.width  = canvas.width;
                croppedCanvas.height = canvas.height;
                croppedCtx.drawImage(canvas, 0, 0);

            // Next do the actual cropping

            var w         = croppedCanvas.width,
                h         = croppedCanvas.height,
                pix       = {x:[], y:[]},
                imageData = croppedCtx.getImageData(0,0,croppedCanvas.width,croppedCanvas.height),
                x, y, index;

            for (y = 0; y < h; y++) {
                for (x = 0; x < w; x++) {
                    index = (y * w + x) * 4;
                    if (imageData.data[index+3] > 0) {
                        pix.x.push(x);
                        pix.y.push(y);

                    }
                }
            }
            pix.x.sort(function(a,b){return a-b});
            pix.y.sort(function(a,b){return a-b});
            var n = pix.x.length-1;

            w = pix.x[n] - pix.x[0];
            h = pix.y[n] - pix.y[0];
            var cut = croppedCtx.getImageData(pix.x[0], pix.y[0], w, h);

            croppedCanvas.width = w;
            croppedCanvas.height = h;
            croppedCtx.putImageData(cut, 0, 0);

            return croppedCanvas.toDataURL();
        }
}
