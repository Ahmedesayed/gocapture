import {BarcodeScanner, BarcodeScannerOptions} from "@ionic-native/barcode-scanner";
import { Scanner, ScannerResponse } from "./Scanner";
import {Platform} from "ionic-angular";

export class GOCBarcodeScanner implements Scanner {

  readonly name: string = 'badge';
  statusMessage: string = "Scan badge";

  constructor(public barcodeScanner: BarcodeScanner,
              public barcodeFormat: string,
              public platform: Platform) {
    //
  }

  getSupportedBarcodeFormat() {
    if (this.barcodeFormat) {
      return this.barcodeFormat;
    }
    return 'QR_CODE,DATA_MATRIX,UPC_E,UPC_A,EAN_8,EAN_13,CODE_128,CODE_39,CODE_93,CODABAR,ITF,RSS14,RSS_EXPANDED,PDF_417,AZTEC,MSI';
  }

  scan(isRapidScan): Promise<ScannerResponse> {

    this.statusMessage = "Scanning " + this.name;

    let formats = this.getSupportedBarcodeFormat();
    console.log('Barcode formats - ' + formats);

    let options: BarcodeScannerOptions = {
      formats: formats,
    };

    options["isRapidScanMode"] = isRapidScan;
    options["rapidScanModeDelay"] = 2;
    options["resultDisplayDuration"] = 100;

    return new Promise<ScannerResponse>((resolve, reject) => {
      this.barcodeScanner.scan(options).then((scannedData) => {

        if (scannedData.cancelled) {
          this.statusMessage = "Scan " + this.name;
          resolve({isCancelled: true});
          return;
        }

        if (scannedData["barcodes"]) {
          resolve({barcodes: this.platform.is("ios") ? scannedData["barcodes"] : scannedData["barcodes"].split(",")});
          return;
        }

        resolve({scannedId: scannedData.text});

      }, error => {
        this.statusMessage = "Could not scan " + this.name;
        reject(error);
      });
    })
  }

  restart() {
    this.statusMessage = "Scan " + this.name;
  }


}
