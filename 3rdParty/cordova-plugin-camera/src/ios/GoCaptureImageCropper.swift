//
//  GoCaptureImageCropper.swift
//  GoCapture
//
//  Created by Sergij Rylskyj on 11/2/18.
//

import UIKit
import CoreML
import Vision
import ImageIO

extension CGRect {
    func scaled(to size: CGSize) -> CGRect {
        return CGRect(
            x: self.origin.x * size.width,
            y: self.origin.y * size.height,
            width: self.size.width * size.width,
            height: self.size.height * size.height
        )
    }
}

public typealias CropCompletionHandler = (_ image: UIImage?) -> Void;

@objc public class GoCaptureImageCropper: NSObject {

    @objc
    public func crop(uiImage: UIImage, completionHandler: @escaping CropCompletionHandler)   {

        let ciImage = CIImage(image: uiImage)
        let orientation = CGImagePropertyOrientation(rawValue: UInt32(uiImage.imageOrientation.rawValue))

        var inputImage = ciImage?.oriented(forExifOrientation: Int32(orientation!.rawValue));

        let handler = VNImageRequestHandler(ciImage: ciImage!, orientation: CGImagePropertyOrientation(rawValue: orientation!.rawValue)!)
        DispatchQueue.global(qos: .userInteractive).async {
            do {
                try handler.perform([VNDetectRectanglesRequest(completionHandler: { [weak self] (request, error) in
                    let handledImage = self?.handleRectangles(request: request, error: error, image: inputImage!);
                    inputImage = nil;
                    DispatchQueue.main.async {
                        completionHandler(handledImage);
                    }
                })])
            } catch {
                print(error)
            }
        }
    }

    func handleRectangles(request: VNRequest, error: Error?, image: CIImage) -> UIImage? {
        guard let observations = request.results as? [VNRectangleObservation]
            else { fatalError("unexpected result type from VNDetectRectanglesRequest") }
        guard let detectedRectangle = observations.first else {
            print("No rectangles detected.")
            return nil;
        }
        let imageSize = image.extent.size

        // Verify detected rectangle is valid.
        let boundingBox = detectedRectangle.boundingBox.scaled(to: imageSize)
        guard image.extent.contains(boundingBox)
            else { print("invalid detected rectangle"); return nil }

        return self.convert(cmage: image.cropped(to: boundingBox));
    }

    func convert(cmage:CIImage) -> UIImage {
        let context:CIContext = CIContext.init(options: nil)
        let cgImage:CGImage = context.createCGImage(cmage, from: cmage.extent)!
        return UIImage.init(cgImage: cgImage)
    }
}
