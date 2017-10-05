import { Platform, NativeModules, AsyncStorage, Dimensions } from 'react-native';

var DeviceInfo = null;
try{
  DeviceInfo = require('react-native-device-info');
  if(!NativeModules.RNDeviceInfo){
        DeviceInfo = null;
  }
}catch(err){
    console.log(err);
  DeviceInfo = null;
}

export let Countly = {};

var Ajax = {};

// CONST
Countly.SESSION_INTERVAL = 60;
Ajax.query = function(data) {
    var queryString = "";
    queryString += "test=none&"
    for (var key in data) {
        if (typeof data[key] == "object") {
            queryString += (key + "=" + JSON.stringify(data[key]) + "&");
        } else {
            queryString += (key + "=" + data[key] + "&");
        }
    }
    return queryString;
};

Ajax.id = function() {
    return Math.random().toString(36).substring(7);
};

Ajax.getTime = function() {
    return new Date().getTime();
}
Ajax.get = function(url, data, callback) {
    data.device_id = Countly.DEVICE_ID;
    data.app_key = Countly.APP_KEY;
    data.timestamp = Ajax.getTime();
    if(Countly.isPost){
      Ajax.post(url, data, callback);
      return;
    }
    var url = Countly.ROOT_URL + url + "?" + Ajax.query(data);
    if (Countly.isDebug)
        console.log(url);
    fetch(url).then((response) => response.json())
        .then((responseJson) => {
            if (Countly.isDebug)
                console.log(responseJson);
            callback(responseJson);
        })
        .catch((error) => {
            if (Countly.isDebug)
                console.log(error);
            callback(error);
        });

};

Ajax.post = function(url, data, callback) {
    var url = Countly.ROOT_URL + url + "?app_key=" + Countly.APP_KEY;
    fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                app_key: Countly.APP_KEY,
                requests: JSON.stringify([data]),
            })
        }).then((responseJson) => {
            if (Countly.isDebug)
                console.log(responseJson);
            callback(responseJson);
        })
        .catch((error) => {
            if (Countly.isDebug)
                console.log(error);
            callback(error);
        });
}

Ajax.getItem = function(key, callback) {
    try {
        AsyncStorage.getItem('Countly:' + key, callback);
    } catch (error) {
        if (Countly.isDebug)
            console.log("Error while getting", key);
        return null;
    }
};


Ajax.setItem = function(key, value,callback) {
    try {
        AsyncStorage.setItem('Countly:' + key, value, function(result) {
            if(callback)
              callback(result);
        });
    } catch (error) {
        if (Countly.isDebug)
            console.log("Error while storing", key, value);
    }
};
Countly.isDebug = false;
Countly.init = function(ROOT_URL, APP_KEY, DEVICE_ID) {
    Countly.isInit = true;
    Ajax.getItem("DEVICE_ID", function(err, S_DEVICE_ID) {
        Countly.ROOT_URL = ROOT_URL;
        Countly.APP_KEY = APP_KEY;
        Countly.DEVICE_ID = DEVICE_ID || S_DEVICE_ID || Ajax.id();
        Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
        Ajax.get("/i", {}, function(result) {
            Countly.session();
            setInterval(Countly.session, Countly.SESSION_INTERVAL * 1000);
        });

    });
};
Countly.isInitialized = function(){
    return Countly.isInit;
}
Countly.hasBeenCalledOnStart = function(){

}

Countly.session = function() {
    Ajax.get("/i", { begin_session: 1, session_duration: Countly.SESSION_INTERVAL, metrics: Countly.getDevice() }, function(result) {});
};


// Device
Countly.getOS = function() {
    if (Platform.OS.match("android"))
        return "Android";
    if (Platform.OS.match("ios"))
        return "iOS";
    return Platform.OS;
}
Countly.device = {};
Countly.getDevice = function() {
    if(DeviceInfo){
        Countly.device = {
            "_os": Platform.os,
            "_os_version": DeviceInfo.getSystemVersion(),
            "_device": DeviceInfo.getModel(),
            "_resolution": screen.width+ "x" +screen.height,
            "_app_version": DeviceInfo.getVersion(),
            // "_density": "MDPI",
            "_locale": navigator.language || navigator.userLanguage,
            "_store": DeviceInfo.getBundleId()
        }

    }else{
        var {height, width, scale} = Dimensions.get('window');
        Countly.device = {
            "_os": Countly.getOS(),
            "_os_version": Countly.getVersion(Countly.getOS(), Platform.Version),
            "_resolution": (width * scale)+ "x" +(height * scale),
            "_locale": Countly.device._locale,
        };
    }
    return Countly.device;
}

Countly.getVersion = function(os, version){
    if(os === "Android"){
        return version;
    }else{
        return version;
    }
}

if(NativeModules.ExponentUtil)
  NativeModules.ExponentUtil.getCurrentLocaleAsync().then((local)=>{
      Countly.device._locale = local;
  });
// Device

Countly.start = function() {

};

Countly.stop = function() {

};

Countly.changeDeviceId = function(newDeviceId) {
    var changeDevice = { old_device_id: Countly.DEVICE_ID};
    Countly.DEVICE_ID = newDeviceId;
    Ajax.get("/i", changeDevice, function(result) {});
    Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
}

Countly.setOptionalParametersForInitialization = function(countryCode, city, location) {
    Ajax.get("/i", { country_code: countryCode, city: city, location: location }, function(result) {});
}
Countly.setLocation = function(latitude, longitude){
    Ajax.get("/i", { location: latitude +"," +longitude }, function(result) {});
};

Countly.setHttpPostForced = function(isPost) {
    Countly.isPost = isPost;
}

Countly.enableParameterTamperingProtection = function(salt) {
    Countly.salt = salt;
}


// Events


Countly.recordEvent = function(events) {
    if (events)
        events.count = events.count || 1;
    Ajax.get("/i", { events: [events] }, function(result) {});
}

var storedEvents = {};
Countly.startEvent = function(eventName) {
    storedEvents[eventName] = Ajax.getTime();
}

Countly.endEvent = function(eventName) {
    Countly.recordEvent({ key: eventName, "dur": Ajax.getTime() - storedEvents[eventName] || 0 });
    delete storedEvents[eventName];
}

// Events

// user data
Countly.setUserData = function(user_details) {
    Ajax.get("/i", { user_details: user_details }, function(result) {});
}

Countly.userData = {};
Countly.userData.setProperty = function(keyName, keyValue) {
    var update = {};
    update[keyName] = keyValue;
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.increment = function(keyName) {
    var update = {};
    update[keyName] = { "$inc": 1 };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.incrementBy = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$inc": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.multiply = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$mul": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.saveMax = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$max": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.saveMin = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$min": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.setOnce = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$setOnce": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.pullValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$pull": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.pushValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$push": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
Countly.userData.addToSetValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = { "$addToSet": keyValue };
    Ajax.get("/i", { user_details: { "custom": update } }, function(result) {});
};
// user data

// crash report

Countly.addCrashLog = function(crashLog) {

}

Countly.enableCrashReporting = function(){

}
Countly.setCustomCrashSegments = function(){

}

Countly.logException = function(){

}

// crash report

Countly.recordView = function(viewName) {
    Countly.recordEvent({ "key": "[CLY]_view", "segmentation": { "name": viewName, "segment": Countly.getOS(), "visit": 1 } })
}

Countly.setViewTracking = function(isViewTracking){
  Countly.isViewTracking = isViewTracking;
}

Countly.getDeviceID = function(){
  return Countly.DEVICE_ID;
}

setTimeout(function() {
  // Ajax.setItem("hello", "world", ()=>{
  //   Ajax.getItem("hello", (err, value)=>{
  //     console.log(err, value)
  //   })
  //   AsyncStorage.getAllKeys((err, keys) => {
  //     console.log(err, keys)
  //   });
  // });
  // console.log(Dimensions.get('window'))
    // DeviceInfo.getSystemVersion()
    // DeviceInfo.getModel()
    // DeviceInfo.getVersion()
    // DeviceInfo.getBundleId()
    // console.log(DeviceInfo)
    // DeviceInfo.getDeviceLocale().then((err, result)=>{
    //     console.log(err, result)
    // })
    // DeviceInfo.getDeviceLocale()
    // console.log("Device Locale");
    // console.log(require('react-native'))

    // console.log()
}, 1000);
