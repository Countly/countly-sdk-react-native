var Countly = {};
var Ajax = {};

// CONST
Countly.SESSION_INTERVAL = 60;
Ajax.query = function(data) {
    var queryString = "";
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

Ajax.getTime = function(){
    return new Date().getTime();
}
Ajax.get = function(url, data, callback) {
    data.device_id = Countly.DEVICE_ID;
    data.app_key = Countly.APP_KEY;
    data.timestamp = Ajax.getTime();

    fetch(Countly.ROOT_URL + url + "?" + Ajax.query(data)).then((response) => response.json())
        .then((responseJson) => {
            callback(responseJson);
        })
        .catch((error) => {
            callback(error);
        });

};

Ajax.getItem = function(key) {
    try {
        return AsyncStorage.getItem('@Countly:' +key);
    } catch (error) {
        return null;
    }
};


Ajax.setItem = function(key, value) {
    try {
        AsyncStorage.setItem('@Countly:' +key, value);
    } catch (error) {
        console.log("Error while storing", key, value);
    }
};
Countly.init = function(ROOT_URL, APP_KEY, DEVICE_ID) {
    if (!DEVICE_ID)
        DEVICE_ID = Ajax.id();

    Countly.ROOT_URL = ROOT_URL;
    Countly.APP_KEY = APP_KEY;
    Countly.DEVICE_ID = DEVICE_ID || Ajax.getItem("DEVICE_ID") || Ajax.id();
    Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
    Ajax.get("/i", {}, function(result) {
        console.log(result);
        Countly.session();
        setInterval(Countly.session, Countly.SESSION_INTERVAL * 1000);
    });
};

Countly.session = function() {
    Ajax.get("/i", { begin_session: 1, session_duration: Countly.SESSION_INTERVAL, metrics: Countly.getDevice() }, function(result) {
        console.log(result);
    });
};


Countly.getDevice = function() {
    var metrics = {
        "_os": "Android",
        "_os_version": "4.1",
        "_device": "Samsung Galaxy",
        "_resolution": "1200x800",
        "_carrier": "Vodafone",
        "_app_version": "1.2",
        "_density": "MDPI",
        "_locale": "en_US",
        "_store": "com.android.vending"
    }
    return metrics;
}


Countly.changeDeviceId = function(newDeviceId){
    Ajax.get("/i", {old_device_id: Countly.DEVICE_ID, device_id: newDeviceId}, function(result) {
        console.log(result);
    });
    Countly.DEVICE_ID = newDeviceId;
    Ajax.setItem("DEVICE_ID", Countly.DEVICE_ID);
}

Countly.setOptionalParametersForInitialization = function(countryCode, city, location){
    Ajax.get("/i", {country_code: countryCode, city: city, location: location}, function(result) {
        console.log(result);
    });
}

Countly.setHttpPostForced = function(isPost){
    Countly.isPost = true;
}

Countly.enableParameterTamperingProtection = function(salt){
    Countly.salt = salt;
}


// Events


Countly.recordEvent = function(events){
    if(!count)
        count = 1;
    var events = {
        key: events.name,
        count: events.count,
        sum: events.sum || 0,
        segments: events.segments || {}
    }

    Ajax.get("/i", {events: events}, function(result) {
        console.log(result);
    });
}

Countly.startEvent = function(){

}

Countly.endEvent = function(){

}

// Events

// user data
Countly.setUserData = function(user_details) {
    Ajax.get("/i", { user_details: user_details }, function(result) {
        console.log(result)
    });
}

Countly.userData = {};
Countly.userData.setProperty = function(keyName, keyValue){

};
Countly.userData.increment = function(keyName){

};
Countly.userData.incrementBy = function(keyName, keyValue){

};
Countly.userData.multiply = function(keyName, keyValue){

};
Countly.userData.saveMax = function(keyName, keyValue){

};
Countly.userData.saveMin = function(keyName, keyValue){

};
Countly.userData.setOnce = function(keyName, keyValue){

};

// user data

// crash report

Countly.addCrashLog = function(crashLog){

}

// crash report

Countly.recordView = function(viewName){

}

export default Countly;


// Test Use Case

var app = {};
Countly.init("http://try.count.ly", "111dcd50d5f4a43a23202330cec19c069a68bc19", "123456");


setTimeout(function() {
    // app.setUserData();
}, 500);

app.setUserData = function(){
    Countly.setUserData({
        "name": "Nicolson Dsouza",
        "username": "nicolsondsouza",
        "email": "nicolson@trinisofttechnologies@gmail.com",
        "organization": "Trinisoft Technologies",
        "phone": "+17278287040",
        //Web URL to picture
        "picture": "https://avatars1.githubusercontent.com/u/10754117?v=4&s=460",
        "gender": "M",
        "byear": 1989, //birth year
        "custom": {
            "key1": "value1",
            "key2": "value2"
        }
    });
}


