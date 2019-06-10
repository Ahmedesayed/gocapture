import {Ndef, NFC} from "@ionic-native/nfc";
import {Platform} from "ionic-angular";
import { ScannerResponse, Scanner } from "./Scanner";

export class GOCNFCScanner implements Scanner{

  readonly name: string = 'NFC Badge';
  statusMessage: string = "Scan NFC Badge";


  constructor(public nfc: NFC,
              public ndef: Ndef,
              public platform: Platform) {
    //
  }

  scan(isRapidScan): Promise<ScannerResponse> {
    return new Promise<ScannerResponse>(((resolve, reject) => {
      this.nfc.enabled().then(() => {
        this.readNfc(resolve, reject);
      }, error =>{
        this.statusMessage = "Could not scan " + this.name;
        reject("Nfc is not available");
      });
    }));
  }

  private readNfc(resolve, reject) {
    this.statusMessage = "Ready to scan. Hold the device near the badge.";
    this.nfc.addNdefListener(() =>{
      if (this.platform.is("ios")) {
        this.nfc.beginSession().subscribe();
      }
    }, error=>{
      reject( "Could not scan " + this.name);
    }).subscribe((event) => {

      console.log('Received ndef event - ' + JSON.stringify(event));

      let payload = event.tag.ndefMessage[0].payload;

      let binary = '';
      for (let i = 0; i < payload.length; i++) {
        let byte = payload[i];

        if (this.platform.is('android')) {
          //convert signed byte to the unsigned
          byte = byte & 0xff;
        }

        binary += String.fromCharCode(byte);
      }

      let base64 = btoa(binary);

      console.log('Received ndef message. the tag contains: ', base64);
      resolve({scannedId: base64});
    }, err => {
      this.statusMessage = "Could not scan " + this.name;
      reject(err);
    });
  }

  restart() {
    this.statusMessage = "Rescan " + this.name;
  }
}
