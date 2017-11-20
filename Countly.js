import { Platform, NativeModules, AsyncStorage, Dimensions, AppState } from 'react-native';
var DeviceInfo, PushNotification = null;

DeviceInfo = require('react-native-device-info');
PushNotification = require('react-native-push-notification');

export default Countly = {};
var DeviceInfo = null;
Countly.isDebug = false;
Countly.isInit = false;
Countly.isManualSessionHandling = false;
Countly.isReady = false;
Countly.startTime = new Date().getTime();

var Ajax = {};

// CONST
Countly.SESSION_INTERVAL = 60;
Ajax.query = function(data) {
    var queryString = "";
    queryString += "test=none&"
    for (var key in data) {
        if (typeof data[key] == "object") {
            queryString += (key + "=" + encodeURIComponent(JSON.stringify(data[key])) + "&");
        } else {
            queryString += (key + "=" + encodeURIComponent(data[key]) + "&");
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
    if (!Countly.isInit)
        return Countly.add(url, data);
    data.device_id = Countly.DEVICE_ID;
    data.app_key = Countly.APP_KEY;
    data.timestamp = Ajax.getTime();
    if (Countly.isPost) {
        Ajax.post(url, data, callback);
        return;
    }
    Countly.log("GET Method");
    var url = Countly.ROOT_URL + url + "?" + Ajax.query(data);
    Countly.log(url);
    fetch(url).then((response) => response.json()).then((responseJson) => {
        Countly.log(responseJson);
        callback(responseJson);
    }).catch((error) => {
        Countly.log(error);
        callback(error);
    });

};

Ajax.post = function(url, data, callback) {
    if (!Countly.isInit)
        return;
    Countly.log("POST Method");
    data.device_id = Countly.DEVICE_ID;
    data.app_key = Countly.APP_KEY;
    data.timestamp = Ajax.getTime();
    var url = Countly.ROOT_URL + url + "?app_key=" + Countly.APP_KEY;
    Countly.log(url, data);
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            app_key: Countly.APP_KEY,
            requests: JSON.stringify([data])
        })
    }).then((responseJson) => {
        Countly.log(responseJson);
        callback(responseJson);
    }).catch((error) => {
        Countly.log(error);
        callback(error);
    });
}

Ajax.getItem = function(key, callback) {
    try {
        AsyncStorage.getItem('Countly:' + key, callback);
    } catch (error) {
        Countly.log("Error while getting", key);
        return null;
    }
};

Ajax.setItem = function(key, value, callback) {
    try {
        AsyncStorage.setItem('Countly:' + key, value, function(result) {
            if (callback)
                callback(result);
            }
        );
    } catch (error) {

        Countly.log("Error while storing", key, value);
    }
};

Countly.queue = [];
Countly.add = function(url, data) {
    Countly.queue.push({url: url, data: data});
};
Countly.update = function() {
    for (var i = 0, il = Countly.queue.length; i < il; i++) {
        Ajax.get(Countly.queue[i].url, Countly.queue[i].data, function() {});
    }
}
Ajax.getItem("DEVICE_ID", function(err, S_DEVICE_ID) {
    Countly.isReady = true;
    Countly.DEVICE_ID = S_DEVICE_ID || Ajax.id();
});
Countly.init = function(ROOT_URL, APP_KEY, DEVICE_ID) {
    if (!Countly.isReady) {
        return setTimeout(function() {
            Countly.init(ROOT_URL, APP_KEY, DEVICE_ID);
        }, 1000);
    };
    Countly.isInit = true;
    Countly.ROOT_URL = ROOT_URL;
    Countly.APP_KEY = APP_KEY;
    Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
    Ajax.get("/i", {}, function(result) {
        Countly.update();
    });

};

Countly.isInitialized = function() {
    return Countly.isInit;
}
Countly.hasBeenCalledOnStart = function() {}

Countly.session = function(status) {
    let session = {
        session_duration: Countly.SESSION_INTERVAL,
        metrics: Countly.getDevice()
    };
    if (status == "session_start") {
        session.begin_session = 1;
    }
    if (status == "session_stop") {
        session.end_session = true;
    };
    Ajax.get("/i", session, function(result) {});
};

// Device
Countly.getOS = function() {
    if (Platform.OS.match("android"))
        return "Android";
    if (Platform.OS.match("ios"))
        return "iOS";
    return Platform.OS;
};

Countly.device = {};
Countly.getDevice = function() {
    var {height, width, scale} = Dimensions.get('window');
    if (DeviceInfo) {
        Countly.device = {
            "_os": Countly.getOS(),
            "_os_version": DeviceInfo.getSystemVersion(),
            "_device": DeviceInfo.getModel(),
            // "_carrier": DeviceInfo.getCarrier(),
            "_resolution": (width * scale) + "x" + (height * scale),
            "_app_version": DeviceInfo.getVersion(),
            // "_density": DeviceInfo.getDensity(),
            "_locale": DeviceInfo.getDeviceLocale(),
            "_store": DeviceInfo.getBundleId()
        }

    } else {

        Countly.device = {
            "_os": Countly.getOS(),
            "_os_version": Countly.getVersion(Countly.getOS(), Platform.Version),
            "_resolution": (width * scale) + "x" + (height * scale),
            "_locale": Countly.device._locale
        };
    }
    return Countly.device;
}

Countly.getVersion = function(os, version) {
    if (os === "Android") {
        return version;
    } else {
        return version;
    }
}

if (NativeModules.ExponentUtil)
    NativeModules.ExponentUtil.getCurrentLocaleAsync().then((local) => {
        Countly.device._locale = local;
    });

// Device

Countly.sessionId = null;
Countly.start = function() {
    if (!Countly.isInit)
        return;
    Countly.stop();
    Countly.session("session_start");
    Countly.sessionId = setInterval(function() {
        Countly.session("session_update");
    }, Countly.SESSION_INTERVAL * 1000);
};

Countly.stop = function() {
    if (Countly.sessionId) {
        Countly.session("session_stop");
        clearInterval(Countly.sessionId);
    }
    Countly.sessionId = null;
};

Countly.isBackground = false;
AppState.addEventListener('change', function(nextState) {
    if (!Countly.isManualSessionHandling) {
        if (Countly.isBackground && nextState == 'active') {
            Countly.log("foreground");
            if (Countly.isBackground)
                Countly.start();
            Countly.isBackground = false;
        }

        if (nextState === "background") {
            Countly.log("background");
            Countly.stop();
            Countly.isBackground = true;
        }
    }
});

Countly.changeDeviceId = function(newDeviceId) {
    var changeDevice = {
        old_device_id: Countly.DEVICE_ID
    };
    Countly.DEVICE_ID = newDeviceId;
    Ajax.get("/i", changeDevice, function(result) {});
    Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
}

Countly.setOptionalParametersForInitialization = function(countryCode, city, location) {
    Ajax.get("/i", {
        country_code: countryCode,
        city: city,
        location: location
    }, function(result) {});
}
Countly.setLocation = function(latitude, longitude) {
    Ajax.get("/i", {
        location: latitude + "," + longitude
    }, function(result) {});
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
    Ajax.get("/i", {
        events: [events]
    }, function(result) {});
}

var storedEvents = {};
Countly.startEvent = function(eventName) {
    storedEvents[eventName] = Ajax.getTime();
}

Countly.endEvent = function(eventName) {
    Countly.recordEvent({
        key: eventName,
        "dur": Ajax.getTime() - storedEvents[eventName] || 0
    });
    delete storedEvents[eventName];
}

// Events

// user data
Countly.setUserData = function(user_details) {
    Ajax.get("/i", {
        user_details: user_details
    }, function(result) {});
}

Countly.userData = {};
Countly.userData.setProperty = function(keyName, keyValue) {
    var update = {};
    update[keyName] = keyValue;
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.increment = function(keyName) {
    var update = {};
    update[keyName] = {
        "$inc": 1
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.incrementBy = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$inc": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.multiply = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$mul": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.saveMax = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$max": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.saveMin = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$min": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.setOnce = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$setOnce": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.pullValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$pull": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.pushValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$push": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
Countly.userData.addToSetValue = function(keyName, keyValue) {
    var update = {};
    update[keyName] = {
        "$addToSet": keyValue
    };
    Ajax.get("/i", {
        user_details: {
            "custom": update
        }
    }, function(result) {});
};
// user data

// Push Notification
Countly.TEST = 1;
Countly.PRODUCTION = 0;
Countly.initMessaging = function(gcmSenderId, mode){
    PushNotification.configure({
        onRegister: function(token) {
            console.log('TOKEN:', token);
            if(Countly._onRegisterDeviceCallback){
                Countly._onRegisterDeviceCallback(token.token);
            }
        },
        onNotification: function(notification) {
            console.log('NOTIFICATION:', notification);
        },
        senderID: gcmSenderId,
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },
        popInitialNotification: true,
        requestPermissions: true
    });
};

Countly._onRegisterDeviceCallback = null;
Countly.onRegisterDevice = function(callback) {
    Countly._onRegisterDeviceCallback = callback;
    PushNotification.requestPermissions();
};

Countly.registerPush = function(mode, token) {
    var data = {
        token_session: 1,
        test_mode: mode
    }
    data[Platform.OS + "_token"] = token;
    Ajax.get("/i", data, function(result) {});
};

Countly.openPush = function(pushNumber) {
    Ajax.get("/i", {
        "key": "[CLY]_push_open",
        "count": 1,
        "segmentation": {
            "i": pushNumber
        }
    }, function(result) {});
};
Countly.actionPush = function(pushNumber) {
    Ajax.get("/i", {
        "key": "[CLY]_push_action",
        "count": 1,
        "segmentation": {
            "i": pushNumber
        }
    }, function(result) {});
};
Countly.sentPush = function(pushNumber) {
    Ajax.get("/i", {
        "key": "[CLY]_push_sent",
        "count": 1,
        "segmentation": {
            "i": pushNumber
        }
    }, function(result) {});
};
// Push Notification

// crash report

Countly.addCrashLog = function(crashLog) {
    var crash = {
        //device metrics
        "_os": "Android",
        "_os_version": "4.1",
        "_manufacture": "Samsung", //may not be provided for ios or be constant, like Apple
        "_device": "Galaxy S4", //model for Android, iPhone1,1 etc for iOS
        "_resolution": "1900x1080",
        "_app_version": "2.1",
        "_cpu": "armv7", //type of cpu used on device (for ios will be based on device)
        "_opengl": "2.1", //version of open gl supported

        //state of device
        "_ram_current": 1024, //in megabytes
        "_ram_total": 4096,
        "_disk_current": 3000, //in megabytes
        "_disk_total": 10240,
        "_bat": 99, //battery level from 0 to 100
        //or provide "_bat_current" and "_bat_total" if other scale
        "_orientation": "portrait", //in which device was held, landscape, portrait, etc

        //bools
        "_root": false, //true if device is rooted/jailbroken, false or not provided if not
        "_online": true, //true if device is connected to the internet (WiFi or 3G), false or 	not provided if not connected
        "_muted": false, //true if volume is off, device is in muted state
        "_background": false, //true if app was in background when it crashed

        //error info
        "_name": "Null Pointer exception", //optional if provided by OS/Platform, else will use first line of 		stack
        "_error": "Some error stack here", //error stack, can provide multiple separated by blank new line
        "_nonfatal": false, //true if handled exception, false or not provided if unhandled crash
        "_logs": "logs provided here", //some additional logs provided, if any
        "_run": (new Date().getTime() - Countly.startTime) / 1000, //running time since app start in seconds

        //custom key/values provided by developers
        "_custom": {
            "facebook_sdk": "3.5",
            "admob": "6.5"
        }
    }
}

Countly.enableCrashReporting = function() {}
Countly.setCustomCrashSegments = function() {}

Countly.logException = function() {}

// crash report

Countly.recordView = function(viewName) {
    Countly.recordEvent({
        "key": "[CLY]_view",
        "segmentation": {
            "name": viewName,
            "segment": Countly.getOS(),
            "visit": 1
        }
    })
}

Countly.setViewTracking = function(isViewTracking) {
    Countly.isViewTracking = isViewTracking;
}

Countly.getDeviceID = function() {
    return Countly.DEVICE_ID;
}

Countly.log = function(arg1, arg2) {
    if (Countly.isDebug) {
        console.log(arg1, arg2);
    }
}
