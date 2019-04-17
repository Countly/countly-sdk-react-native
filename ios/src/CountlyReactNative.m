#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTEventDispatcher.h>

#import "Countly.h"
#import "CountlyReactNative.h"
#import "CountlyConfig.h"
#import "CountlyPushNotifications.h"
#import "CountlyConnectionManager.h"


CountlyConfig* config = nil;

@implementation CountlyReactNative

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(init:(NSArray*)arguments)
{
  NSString* serverurl = [arguments objectAtIndex:0];
  NSString* appkey = [arguments objectAtIndex:1];
  NSString* deviceID = [arguments objectAtIndex:2];

  if (config == nil){
    config = CountlyConfig.new;
  }
  if(![deviceID  isEqual: @""]){
    config.deviceID = deviceID;
  }
  config.appKey = appkey;
  config.host = serverurl;

  if (serverurl != nil && [serverurl length] > 0) {
    [[Countly sharedInstance] startWithConfig:config];
  } else {
  }


}

RCT_EXPORT_METHOD(event:(NSArray*)arguments)
{
  NSString* eventType = [arguments objectAtIndex:0];
  if (eventType != nil && [eventType length] > 0) {
    if ([eventType  isEqual: @"event"]) {
      NSString* eventName = [arguments objectAtIndex:1];
      NSString* countString = [arguments objectAtIndex:2];
      int countInt = [countString intValue];
      [[Countly sharedInstance] recordEvent:eventName count:countInt];

    }
    else if ([eventType  isEqual: @"eventWithSum"]){
      NSString* eventName = [arguments objectAtIndex:1];
      NSString* countString = [arguments objectAtIndex:2];
      int countInt = [countString intValue];
      NSString* sumString = [arguments objectAtIndex:3];
      float sumFloat = [sumString floatValue];
      [[Countly sharedInstance] recordEvent:eventName count:countInt  sum:sumFloat];
    }
    else if ([eventType  isEqual: @"eventWithSegment"]){
      NSString* eventName = [arguments objectAtIndex:1];
      NSString* countString = [arguments objectAtIndex:2];
      int countInt = [countString intValue];
      NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];

      for(int i=3,il=(int)arguments.count;i<il;i+=2){
        dict[[arguments objectAtIndex:i]] = [arguments objectAtIndex:i+1];
      }
      [[Countly sharedInstance] recordEvent:eventName segmentation:dict count:countInt];
    }
    else if ([eventType  isEqual: @"eventWithSumSegment"]){
      NSString* eventName = [arguments objectAtIndex:1];
      NSString* countString = [arguments objectAtIndex:2];
      int countInt = [countString intValue];
      NSString* sumString = [arguments objectAtIndex:3];
      float sumFloat = [sumString floatValue];
      NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];

      for(int i=4,il=(int)arguments.count;i<il;i+=2){
        dict[[arguments objectAtIndex:i]] = [arguments objectAtIndex:i+1];
      }
      [[Countly sharedInstance] recordEvent:eventName segmentation:dict count:countInt  sum:sumFloat];
    }
    else{
    }
  } else {
  }
}
RCT_EXPORT_METHOD(recordView:(NSArray*)arguments)
{
  NSString* recordView = [arguments objectAtIndex:0];
  [Countly.sharedInstance reportView:recordView];
}
RCT_EXPORT_METHOD(setloggingenabled:(NSArray*)arguments)
{


}

RCT_EXPORT_METHOD(setuserdata:(NSArray*)arguments)
{
  NSString* name = [arguments objectAtIndex:0];
  NSString* username = [arguments objectAtIndex:1];
  NSString* email = [arguments objectAtIndex:2];
  NSString* org = [arguments objectAtIndex:3];
  NSString* phone = [arguments objectAtIndex:4];
  NSString* picture = [arguments objectAtIndex:5];
  //NSString* picturePath = [arguments objectAtIndex:6];
  NSString* gender = [arguments objectAtIndex:7];
  NSString* byear = [arguments objectAtIndex:8];

  Countly.user.name = name;
  Countly.user.username = username;
  Countly.user.email = email;
  Countly.user.organization = org;
  Countly.user.phone = phone;
  Countly.user.pictureURL = picture;
  Countly.user.gender = gender;
  Countly.user.birthYear = @([byear integerValue]);
  [Countly.user save];
}


RCT_EXPORT_METHOD(onregistrationid:(NSArray*)arguments)
{
  NSString* token = [arguments objectAtIndex:0];
  NSString* messagingMode = [arguments objectAtIndex:1];
  int mode = [messagingMode intValue];
  NSData *tokenByte = [token dataUsingEncoding:NSUTF8StringEncoding];
  if(mode == 1){
    // [[CountlyConnectionQueue sharedInstance] setStartedWithTest:YES];
  }
  [CountlyConnectionManager.sharedInstance sendPushToken:token];
   // CountlyPushNotifications.sharedInstance.token = token;
   // [CountlyPushNotifications.sharedInstance sendToken];
  // [Countly.sharedInstance didRegisterForRemoteNotificationsWithDeviceToken:tokenByte];

  // [[CountlyConnectionQueue sharedInstance] tokenSession:token];



}

RCT_EXPORT_METHOD(start)
{
  // [Countly.sharedInstance resume];



}

RCT_EXPORT_METHOD(stop)
{
  // [Countly.sharedInstance suspend];



}

RCT_EXPORT_METHOD(changeDeviceId:(NSArray*)arguments)
{
  NSString* newDeviceID = [arguments objectAtIndex:0];
  NSString* onServerString = [arguments objectAtIndex:0];
  if ([onServerString  isEqual: @"1"]) {
    [Countly.sharedInstance setNewDeviceID:newDeviceID onServer: YES];
  }else{
    [Countly.sharedInstance setNewDeviceID:newDeviceID onServer: NO];
  }
}

RCT_EXPORT_METHOD(userLoggedIn:(NSArray*)arguments)
{
  NSString* deviceID = [arguments objectAtIndex:0];
  [Countly.sharedInstance userLoggedIn:deviceID];
}
RCT_EXPORT_METHOD(userLoggedOut:(NSArray*)arguments)
{
  [Countly.sharedInstance userLoggedOut];
}
RCT_EXPORT_METHOD(setHttpPostForced:(NSArray*)arguments)
{
  NSString* isPost = [arguments objectAtIndex:0];
  if (config == nil){
    config = CountlyConfig.new;
  }

  if ([isPost  isEqual: @"1"]) {
    config.alwaysUsePOST = YES;
  }else{
    config.alwaysUsePOST = NO;
  }
}

RCT_EXPORT_METHOD(enableParameterTamperingProtection:(NSArray*)arguments)
{
  NSString* salt = [arguments objectAtIndex:0];
  if (config == nil){
    config = CountlyConfig.new;
  }
  config.secretSalt = salt;
}

RCT_EXPORT_METHOD(startEvent:(NSArray*)arguments)
{
  NSString* eventName = [arguments objectAtIndex:0];
  [Countly.sharedInstance startEvent:eventName];



}

RCT_EXPORT_METHOD(endEvent:(NSArray*)arguments)
{
  NSString* eventType = [arguments objectAtIndex:0];

  if ([eventType  isEqual: @"event"]) {
    NSString* eventName = [arguments objectAtIndex:1];
    [Countly.sharedInstance endEvent:eventName];
  }
  else if ([eventType  isEqual: @"eventWithSegment"]){
    NSString* eventName = [arguments objectAtIndex:1];

    NSString* countString = [arguments objectAtIndex:2];
    int countInt = [countString intValue];

    NSString* sumString = [arguments objectAtIndex:3];
    int sumInt = [sumString intValue];

    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    for(int i=3,il=(int)arguments.count;i<il;i+=2){
      dict[[arguments objectAtIndex:i]] = [arguments objectAtIndex:i+1];
    }

    [Countly.sharedInstance endEvent:eventName segmentation:dict count:countInt sum:sumInt];
  }
  else{
  }
}

RCT_EXPORT_METHOD(setLocation:(NSArray*)arguments)
{
  NSString* countryCode = [arguments objectAtIndex:0];
  NSString* city = [arguments objectAtIndex:1];
  NSString* location = [arguments objectAtIndex:2];
  NSString* IP = [arguments objectAtIndex:3];

  if ([location  isEqual: @"0,0"]){

  }else{
    NSArray *locationArray = [location componentsSeparatedByString:@","];   //take the one array for split the string
    NSString* latitudeString = [locationArray objectAtIndex:0];
    NSString* longitudeString = [locationArray objectAtIndex:1];

    double latitudeDouble = [latitudeString doubleValue];
    double longitudeDouble = [longitudeString doubleValue];

    [Countly.sharedInstance recordLocation:(CLLocationCoordinate2D){latitudeDouble,longitudeDouble}];
  }


  // Not necessary, as there is method for it.
  // if (config == nil){
  //   config = CountlyConfig.new;
  // }
  // config.ISOCountryCode = countryCode;
  // config.city = city;
  // config.location = location; // (CLLocationCoordinate2D){35.6895,139.6917};
  // config.IP = IP;

  [Countly.sharedInstance recordCity:city andISOCountryCode:countryCode];
  [Countly.sharedInstance recordIP:IP];

}

RCT_EXPORT_METHOD(disableLocation:(NSArray*)arguments)
{
  [Countly.sharedInstance disableLocationInfo];
}

RCT_EXPORT_METHOD(enableCrashReporting:(NSArray*)arguments)
{
  if (config == nil){
    config = CountlyConfig.new;
  }
  config.features = @[CLYCrashReporting];
}

RCT_EXPORT_METHOD(addCrashLog:(NSArray*)arguments)
{
  NSString* logs = [arguments objectAtIndex:0];
  [Countly.sharedInstance recordCrashLog:logs];
}

RCT_EXPORT_METHOD(userData_setProperty:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];

  [Countly.user set:keyName value:keyValue];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_increment:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];

  [Countly.user increment:keyName];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_incrementBy:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];
  int keyValueInteger = [keyValue intValue];

  [Countly.user incrementBy:keyName value:[NSNumber numberWithInt:keyValueInteger]];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_multiply:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];
  int keyValueInteger = [keyValue intValue];

  [Countly.user multiply:keyName value:[NSNumber numberWithInt:keyValueInteger]];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_saveMax:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];
  int keyValueInteger = [keyValue intValue];

  [Countly.user max:keyName value:[NSNumber numberWithInt:keyValueInteger]];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_saveMin:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];
  int keyValueInteger = [keyValue intValue];

  [Countly.user min:keyName value:[NSNumber numberWithInt:keyValueInteger]];
  [Countly.user save];
}

RCT_EXPORT_METHOD(userData_setOnce:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];

  [Countly.user setOnce:keyName value:keyValue];
  [Countly.user save];
}
RCT_EXPORT_METHOD(userData_pushUniqueValue:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];

  // [Countly.user pushUnique:keyName value:keyValue];
  // [Countly.user save];
}
RCT_EXPORT_METHOD(userData_pushValue:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];

  [Countly.user push:keyName value:keyValue];
  [Countly.user save];
}
RCT_EXPORT_METHOD(userData_pullValue:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  NSString* keyValue = [arguments objectAtIndex:1];

  [Countly.user pull:keyName value:keyValue];
  [Countly.user save];
}



RCT_EXPORT_METHOD(demo:(NSArray*)arguments)
{
  // NSString* token = [arguments objectAtIndex:0];
  // NSString* messagingMode = [arguments objectAtIndex:1];
  // int mode = [messagingMode intValue];
  // NSData *tokenByte = [token dataUsingEncoding:NSUTF8StringEncoding];
}


RCT_EXPORT_METHOD(setRequiresConsent:(NSArray*)arguments)
{
  if (config == nil){
    config = CountlyConfig.new;
  }
  config.requiresConsent = YES;
}
RCT_EXPORT_METHOD(giveConsent:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  if ([keyName  isEqual: @"sessions"]) {
    [Countly.sharedInstance giveConsentForFeature:CLYConsentSessions];
  }
  else if ([keyName  isEqual: @"events"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentEvents];
  }
  else if ([keyName  isEqual: @"users"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentUserDetails];
  }
  else if ([keyName  isEqual: @"crashes"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentCrashReporting];
  }
  else if ([keyName  isEqual: @"push"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentPushNotifications];
  }
  else if ([keyName  isEqual: @"location"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentLocation];
  }
  else if ([keyName  isEqual: @"views"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentViewTracking];
  }
  else if ([keyName  isEqual: @"attribution"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentAttribution];
  }
  else if ([keyName  isEqual: @"star-rating"]){
   [Countly.sharedInstance giveConsentForFeature:CLYConsentStarRating];
  }
  else if ([keyName  isEqual: @"accessory-devices"]){
    [Countly.sharedInstance giveConsentForFeature:CLYConsentAppleWatch];
  }
}
RCT_EXPORT_METHOD(removeConsent:(NSArray*)arguments)
{
  NSString* keyName = [arguments objectAtIndex:0];
  if ([keyName  isEqual: @"sessions"]) {
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentSessions];
  }
  else if ([keyName  isEqual: @"events"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentEvents];
  }
  else if ([keyName  isEqual: @"users"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentUserDetails];
  }
  else if ([keyName  isEqual: @"crashes"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentCrashReporting];
  }
  else if ([keyName  isEqual: @"push"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentPushNotifications];
  }
  else if ([keyName  isEqual: @"location"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentLocation];
  }
  else if ([keyName  isEqual: @"views"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentViewTracking];
  }
  else if ([keyName  isEqual: @"attribution"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentAttribution];
  }
  else if ([keyName  isEqual: @"star-rating"]){
   [Countly.sharedInstance cancelConsentForFeature:CLYConsentStarRating];
  }
  else if ([keyName  isEqual: @"accessory-devices"]){
    [Countly.sharedInstance cancelConsentForFeature:CLYConsentAppleWatch];
  }
}

@end
