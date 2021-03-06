//
//  TesseractPlugin.h
//
//  @author Gustavo Mazzoni - 2016.
//

#import <Cordova/CDV.h>
@class claseAuxiliar;

@interface TesseractPlugin : CDVPlugin 

@property (nonatomic, copy) NSString* callbackID;

- (void) recognizeText:(CDVInvokedUrlCommand*)command;
- (void) recognizeWords:(CDVInvokedUrlCommand*)command;
- (void) recognizeWordsFromPath:(CDVInvokedUrlCommand*)command;

@end
