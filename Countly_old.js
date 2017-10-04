/**
 * Countly SKD React Native
 * https://github.com/facebook/react-native
 * @flow
 */

import {
  NativeModules
} from 'react-native';
const CountlyReactNative = NativeModules.CountlyReactNative;

const Countly = {};
Countly.serverUrl = "";
Countly.appKey = "";
Countly.ready = false;
Countly.messagingMode = {"TEST":1,"PRODUCTION":0};
// countly initialization
Countly.init = function(serverUrl,appKey){
    Countly.serverUrl = serverUrl;
    Countly.appKey = appKey;
    CountlyReactNative.init([serverUrl,appKey]);
}

Countly.initMessaging = function(options){
    Countly.projectId = options.projectId;
    Countly.messageMode = options.messageMode;
    // Countly.Push.onRegisterPushNotification();

    var args = [];
    args.push(options.registrationId || "");
    args.push(options.messageMode || "0");
    args.push(options.projectId || "");
    CountlyReactNative.onregistrationid(args);
}

// countly sending various types of events
Countly.sendEvent = function(options){
    var args = [];
    var eventType = "event"; //event, eventWithSum, eventWithSegment, eventWithSumSegment
    var segments = {};

    if(options.eventSum)
        eventType = "eventWithSum";
    if(options.segments)
        eventType = "eventWithSegment";
    if(options.segments && options.eventSum)
        eventType = "eventWithSumSegment";

    args.push(eventType);

    if(options.eventName)
        args.push(options.eventName.toString());
    if(options.eventCount)
        args.push(options.eventCount.toString());
    if(options.eventSum)
        args.push(options.eventSum.toString());

    if(options.segments)
        segments = options.segments;
    for (var event in segments) {
        args.push(event);
        args.push(segments[event]);
    }
    CountlyReactNative.event(args);
}
Countly.recordView = function(recordView){
    CountlyReactNative.recordView([recordView || ""]);
};

// countly enable logger
Countly.setLoggingEnabled = function(boolean){
    CountlyReactNative.setloggingenabled([]);
}

// countly sending user data
Countly.setUserData = function(options){
    var args = [];
    args.push(options.name || "");
    args.push(options.username || "");
    args.push(options.email || "");
    args.push(options.org || "");
    args.push(options.phone || "");
    args.push(options.picture || "");
    args.push(options.picturePath || "");
    args.push(options.gender || "");
    args.push(options.byear || 0);

    CountlyReactNative.setuserdata(args);
}

Countly.onRegistrationId = function(options){
    var args = [];
    args.push(options.registrationId || "");
    args.push(Countly.messageMode || "0");
    args.push(options.projectId || "");
    CountlyReactNative.onregistrationid(args);
}
// countly start for android
Countly.start = function(){
    CountlyReactNative.start();
}

// countly stop for android
Countly.stop = function(){
    CountlyReactNative.stop();
}

// countly deviceready for testing purpose
Countly.deviceready = function(){
    Countly.ready = true;
    //testing
}

// countly dummy success and error event
Countly.onSuccess = function(result){
    // alert(result);
}
Countly.onError = function(error){
     // alert("error");
     // alert(error);
}
Countly.demo = function(){

}

Countly.setLocation = function(newDeviceID){
    CountlyReactNative.setLocation([newDeviceID.toString() || ""]);
}
Countly.changeDeviceId = function(newDeviceID){
    CountlyReactNative.changeDeviceId([newDeviceID.toString() || ""]);
}
Countly.enableParameterTamperingProtection = function(salt){
    CountlyReactNative.enableParameterTamperingProtection([salt.toString() || ""]);
}
Countly.enableCrashReporting = function(){
    CountlyReactNative.enableCrashReporting();
}

Countly.startEvent = function(eventName){
    CountlyReactNative.startEvent([eventName.toString() || ""]);
}
Countly.endEvent = function(options){
    if(typeof options === "string")
        options = {eventName: options};
    var args = [];
    var eventType = "event"; //event, eventWithSum, eventWithSegment, eventWithSumSegment
    var segments = {};

    if(options.segments && options.eventSum)
        eventType = "eventWithSumSegment";

    args.push(eventType);

    if(options.eventName)
        args.push(options.eventName.toString());
    if(options.eventCount)
        args.push(options.eventCount.toString());
    if(options.eventSum)
        args.push(options.eventSum.toString());

    if(options.segments)
        segments = options.segments;
    for (var event in segments) {
        args.push(event);
        args.push(segments[event]);
    }
    CountlyReactNative.endEvent(args);
};

Countly.userData = {};
Countly.userData.setProperty = function(keyName, keyValue){
    CountlyReactNative.userData_setProperty([keyName.toString() || "", keyValue.toString() || ""]);
};
Countly.userData.increment = function(keyName){
    CountlyReactNative.userData_increment([keyName.toString() || ""]);
};
Countly.userData.incrementBy = function(keyName, keyIncrement){
    CountlyReactNative.userData_incrementBy([keyName.toString() || "", keyIncrement.toString() || ""]);
};
Countly.userData.multiply = function(keyName, multiplyValue){
    CountlyReactNative.userData_multiply([keyName.toString() || "", multiplyValue.toString() || ""]);
};
Countly.userData.saveMax = function(keyName, saveMax){
    CountlyReactNative.userData_saveMax([keyName.toString() || "", saveMax.toString() || ""]);
};
Countly.userData.saveMin = function(keyName, saveMin){
    CountlyReactNative.userData_saveMin([keyName.toString() || "", saveMin.toString() || ""]);
};
Countly.userData.setOnce = function(keyName, setOnce){
    CountlyReactNative.userData_setOnce([keyName.toString() || "", setOnce.toString() || ""]);
};

export default Countly; 