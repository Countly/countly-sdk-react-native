import { Platform, NativeModules, AsyncStorage, Dimensions, AppState } from 'react-native'; // eslint-disable-line import/no-extraneous-dependencies

import DeviceInfo from 'react-native-device-info';

const Countly = {};
export default Countly;
Countly.isDebug = false;
Countly.isInit = false;
Countly.isManualSessionHandling = false;
Countly.isReady = false;
Countly.startTime = new Date().getTime();
Countly.sdkVersion = '1.0.6';
Countly.sdkName = 'countly-sdk-react-native';
Countly.SESSION_INTERVAL = 60;
const Ajax = {};

/**
 * @description returns query for URL
 * @param data contains parameter to be passed in URL
 */
Ajax.query = (data) => {
  let queryString = '';
  queryString += 'test=none&';
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'object') {
      queryString += `${key}=${encodeURIComponent(JSON.stringify(data[key]))}&`;
    } else {
      queryString += `${key}=${encodeURIComponent(data[key])}&`;
    }
  });
  return queryString;
};

/**
 * @description returns random device id
 */
Ajax.id = () => Math.random().toString(36).substring(7);

// return current time
Ajax.getTime = () => new Date().getTime();

/**
 * @description fetch data using GET method
 * @param {*} url api-end-point
 * @param {*} data parameters to be passed in URL
 * @param {*} callback function invoked after the fetch success or error
 */
Ajax.get = (url, data, callback) => {
  if (!Countly.isInit) {
    return Countly.add(url, data);
  }
  const newData = data;
  newData.device_id = Countly.DEVICE_ID;
  newData.app_key = Countly.APP_KEY;
  newData.timestamp = Ajax.getTime();
  Countly.log('data.timestamp', newData.timestamp);
  newData.sdk_name = Countly.sdkName;
  newData.sdk_version = Countly.sdkVersion;

  if (Countly.isPost) {
    Ajax.post(url, newData, callback);
    return null;
  }
  Countly.log('GET Method');
  const newURL = `${Countly.ROOT_URL}${url}?${Ajax.query(newData)}`;
  Countly.log(newURL);
  fetch(newURL).then(response => response.json()).then((responseJson) => {
    Countly.log(responseJson);
    callback(responseJson);
  }).catch((error) => {
    Countly.add(newURL, newData);
    Countly.log(error);
    callback(error);
  });
  return null;
};

/**
 * @description fetch data using POST method
 * @param {*} url api-end-point
 * @param {*} data parameter to be send
 * @param {*} callback function called after the fetch success or error
 */
Ajax.post = (url, data, callback) => {
  if (!Countly.isInit) {
    return null;
  }
  Countly.log('POST Method');
  const newData = data;
  newData.device_id = Countly.DEVICE_ID;
  newData.app_key = Countly.APP_KEY;
  newData.timestamp = Ajax.getTime();

  newData.sdk_name = Countly.sdkName;
  newData.sdk_version = Countly.sdkVersion;

  const newURL = `${Countly.ROOT_URL}${url}?app_key=${Countly.APP_KEY}`;
  Countly.log(newURL, newData);
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_key: Countly.APP_KEY,
      requests: JSON.stringify([newData]),
    }),
  }).then((responseJson) => {
    Countly.log(responseJson);
    callback(responseJson);
  }).catch((error) => {
    Countly.add(newURL, newData);
    Countly.log(error);
    callback(error);
  });
  return null;
};

/**
 * @description get the value of the key from localStorage
 * @param {*} key key whose value to be fetched
 * @param {*} callback function execute after the item is fetched successfully
 */
Ajax.getItem = (key, callback) => {
  try {
    AsyncStorage.getItem(`Countly:${key}`, callback);
  } catch (error) {
    Countly.log('Error while getting', key);
    return null;
  }
  return null;
};

/**
 * @description store the value with key in local Storage
 * @param {*} key key for the data to be store
 * @param {*} value value of the data
 * @param {*} callback function execute after the object is successfully saved
 */
Ajax.setItem = (key, value, callback) => {
  try {
    AsyncStorage.setItem(`Countly:${key}`, value, (result) => {
      if (callback) {
        callback(result);
      }
    });
  } catch (error) {
    Countly.log('Error while storing', key, value);
  }
};

Countly.queue = [];
Ajax.getItem('OFFLINE', (offline) => {
  if (offline) {
    Countly.queue = JSON.parse(offline) || [];
  }
  if (Countly.queue.constructor !== Array) {
    Countly.queue = [];
  }
});

Countly.add = (url, data) => {
  Countly.queue.push({ url, data });
  Ajax.setItem('OFFLINE', JSON.stringify(Countly.queue));
};

Countly.update = () => {
  if (Countly.isReady) {
    for (let i = 0, il = Countly.queue.length; i < il; i += 1) {
      Ajax.get(Countly.queue[i].url, Countly.queue[i].data, () => {});
    }
    Countly.queue = [];
    Ajax.setItem('OFFLINE', '[]');
  }
};

// return deviceId as soon as the Countly is imported
Ajax.getItem('DEVICE_ID', (err, S_DEVICE_ID) => {
  Countly.isReady = true;
  Countly.DEVICE_ID = S_DEVICE_ID || Ajax.id();
});

/**
 * @description to initialize the countly SDK
 * @param {*} ROOT_URL dashboard base address
 * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
 */
Countly.init = (ROOT_URL, APP_KEY) => (
  new Promise(async (resolve) => {
    Countly.ROOT_URL = ROOT_URL;
    Countly.APP_KEY = APP_KEY;
    let DEVICE_ID = null;
    try {
      DEVICE_ID = await AsyncStorage.getItem('@MySuperStore:DEVICE_ID');
    } catch (err) {
      Countly.log('Error while getting', 'DEVICE_ID');
      return null;
    }
    Countly.DEVICE_ID = DEVICE_ID || Ajax.id();
    try {
      await Ajax.setItem('DEVICE_ID', Countly.DEVICE_ID);
    } catch (err) {
      Countly.log('Error while setting', 'DEVICE_ID');
      return null;
    }
    Ajax.get('/i', {}, (result) => {
      Countly.log('init-result', result);
      Countly.update();
    });
    Countly.isInit = true;
    return resolve();
  })
);

// return if SDK is initialized or not
Countly.isInitialized = () => Countly.isInit;

Countly.hasBeenCalledOnStart = () => {};

// start session and save deviceData return from Countly.getDevice() function
Countly.session = (status) => {
  const session = {
    session_duration: Countly.SESSION_INTERVAL,
    metrics: Countly.getDevice(),
  };
  if (status === 'session_start') {
    session.begin_session = 1;
  }
  if (status === 'session_stop') {
    session.end_session = true;
  }
  Ajax.get('/i', session, (result) => { Countly.log('session-result', result); });
};

// return Device OS
Countly.getOS = () => {
  if (Platform.OS.match('android')) {
    return 'Android';
  }
  if (Platform.OS.match('ios')) {
    return 'iOS';
  }
  return Platform.OS;
};

Countly.device = {};

// returns Device data on which the application with Countly SDK is running
Countly.getDevice = () => {
  const { height, width, scale } = Dimensions.get('window');
  Countly.device = {
    _os: Countly.getOS(),
    _os_version: DeviceInfo.getSystemVersion(),
    _device: DeviceInfo.getModel(),
    _carrier: DeviceInfo.getCarrier(),
    _resolution: `${width * scale}x${height * scale}`,
    _app_version: DeviceInfo.getVersion(),
    _density: DeviceInfo.getDensity(),
    _locale: DeviceInfo.getDeviceLocale(),
    _store: DeviceInfo.getBundleId(),
  };
  return Countly.device;
};

// returns version of OS
Countly.getVersion = (os, version) => {
  if (os === 'Android') {
    return version;
  }
  return version;
};

if (NativeModules.ExponentUtil) {
  NativeModules.ExponentUtil.getCurrentLocaleAsync().then((local) => {
    Countly.device._locale = local;
  });
}

// Start Countly SDK and set the session
Countly.sessionId = null;
Countly.start = () => (
  new Promise(async (resolve, reject) => {
    if (!Countly.isInit) {
      reject(new Error('Countly is not initalized, Call begin method to initalize Counlty'));
    }
    Countly.stop();
    Countly.session('session_start');
    Countly.sessionId = setInterval(() => {
      Countly.session('session_update');
    }, Countly.SESSION_INTERVAL * 1000);
    resolve('Session Started');
  })
);

Countly.begin = (ROOT_URL, APP_KEY) => (
  new Promise(async (resolve, reject) => {
    try {
      await Countly.init(ROOT_URL, APP_KEY);
    } catch (err) {
      return reject(new Error('Unable to initialize Countly'));
    }
    try {
      await Countly.start();
    } catch (err) {
      return reject(new Error('Unable to start session'));
    }
    return resolve('Countly is initialized and session is started');
  })
);


// Stop Countly SDK and end session
Countly.stop = () => (
  new Promise((resolve) => {
    if (Countly.sessionId) {
      Countly.session('session_stop');
      clearInterval(Countly.sessionId);
    }
    Countly.sessionId = null;
    resolve('Session End');
  })
);

// Listen events when the application is in foreground or background and
// start and stop the Countly SDK accordingly
Countly.isBackground = false;
AppState.addEventListener('change', (nextState) => {
  if (!Countly.isManualSessionHandling) {
    if (Countly.isBackground && nextState === 'active') {
      Countly.log('foreground');
      if (Countly.isBackground) {
        Countly.start();
      }
      Countly.isBackground = false;
    }
    if (nextState === 'background') {
      Countly.log('background');
      Countly.stop();
      Countly.isBackground = true;
    }
  }
});

// Change the DeviceId
Countly.changeDeviceId = (newDeviceId) => {
  const changeDevice = {
    old_device_id: Countly.DEVICE_ID,
  };
  Countly.DEVICE_ID = newDeviceId;
  Ajax.get('/i', changeDevice, (result) => { Countly.log('changeDeviceId', result); });
  Ajax.setItem('DEVICE_ID', Countly.DEVICE_ID);
};

Countly.setOptionalParametersForInitialization = (countryCode, city, location) => {
  Ajax.get('/i', {
    country_code: countryCode,
    city,
    location,
  }, (result) => { Countly.log('setOptionParam', result); });
};

Countly.setLocation = (latitude, longitude) => {
  Ajax.get('/i', {
    location: `${latitude},${longitude}`,
  }, (result) => { Countly.log('setLocation', result); });
};

Countly.setHttpPostForced = (isPost) => {
  Countly.isPost = isPost;
};

Countly.enableParameterTamperingProtection = (salt) => {
  Countly.salt = salt;
};

// Events
Countly.recordEvent = (events) => {
  const eventsData = events;
  if (events) {
    eventsData.count = eventsData.count || 1;
  }
  Ajax.get('/i', {
    events: [eventsData],
  }, (result) => { Countly.log('recordEvent', result); });
};

const storedEvents = {};
Countly.startEvent = (events) => {
  const eventsData = events;
  eventsData.dur = Ajax.getTime();
  storedEvents[eventsData.key] = eventsData;
};

Countly.endEvent = (events) => {
  const eventsData = storedEvents[events.key];
  eventsData.dur = Ajax.getTime() - eventsData.dur || 0;
  Countly.recordEvent(eventsData);
  delete storedEvents[eventsData.key];
};

// sets user data
Countly.setUserData = (userDetails) => {
  Ajax.get('/i', {
    user_details: userDetails,
  }, (result) => { Countly.log('setUserData', result); });
};

Countly.userData = {};
Countly.userData.setProperty = (keyName, keyValue) => {
  const update = {};
  update[keyName] = keyValue;
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userDataProperty', result); });
};

Countly.userData.increment = (keyName) => {
  const update = {};
  update[keyName] = {
    $inc: 1,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.increment', result); });
};

Countly.userData.incrementBy = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $inc: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.incrementBy', result); });
};

Countly.userData.multiply = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $mul: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.multiply', result); });
};

Countly.userData.saveMax = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $max: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.saveMax', result); });
};

Countly.userData.saveMin = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $min: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.saveMin', result); });
};

Countly.userData.setOnce = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $setOnce: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.setOnce', result); });
};

Countly.userData.pullValue = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $pull: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.pullValue', result); });
};

Countly.userData.pushValue = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $push: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.pushValue', result); });
};

// Set the newValue of the userData with specific key
Countly.userData.addToSetValue = (keyName, keyValue) => {
  const update = {};
  update[keyName] = {
    $addToSet: keyValue,
  };
  Ajax.get('/i', {
    user_details: {
      custom: update,
    },
  }, (result) => { Countly.log('userData.addToSetValue', result); });
};
// user data

// Push Notification
Countly.TEST = 2;
Countly.ADHOC = 1;
Countly.PRODUCTION = 0;
Countly.initMessaging = (gcmSenderId, mode) => { Countly.log(gcmSenderId, mode); };

Countly.registerPush = (mode, token) => {
  const data = {
    token_session: 1,
    test_mode: mode,
  };
  data[`${Platform.OS}token`] = token;
  Ajax.get('/i', data, (result) => { Countly.log('registerPush', result); });
};

Countly.openPush = (pushNumber) => {
  Ajax.get('/i', {
    key: '[CLY]_push_open',
    count: 1,
    segmentation: {
      i: pushNumber,
    },
  }, (result) => { Countly.log('openPush', result); });
};

Countly.actionPush = (pushNumber) => {
  Ajax.get('/i', {
    key: '[CLY]_push_action',
    count: 1,
    segmentation: {
      i: pushNumber,
    },
  }, (result) => { Countly.log('actionPush', result); });
};

Countly.sentPush = (pushNumber) => {
  Ajax.get('/i', {
    key: '[CLY]_push_sent',
    count: 1,
    segmentation: {
      i: pushNumber,
    },
  }, (result) => { Countly.log('sentPush', result); });
};
// Push Notification

// crash report
Countly.addCrashLog = (crashLog) => {
  const crash = {
    // device metrics
    _os: 'Android',
    _os_version: '4.1',
    _manufacture: 'Samsung', // may not be provided for ios or be constant, like Apple
    _device: 'Galaxy S4', // model for Android, iPhone1,1 etc for iOS
    _resolution: '1900x1080',
    _app_version: '2.1',
    _cpu: 'armv7', // type of cpu used on device (for ios will be based on device)
    _opengl: '2.1', // version of open gl supported

    // state of device
    _ram_current: 1024, // in megabytes
    _ram_total: 4096,
    _disk_current: 3000, // in megabytes
    _disk_total: 10240,
    _bat: 99, // battery level from 0 to 100
    // or provide "_bat_current" and "_bat_total" if other scale
    _orientation: 'portrait', // in which device was held, landscape, portrait, etc

    // bools
    _root: false, // true if device is rooted/jailbroken, false or not provided if not
    // true if device is connected to the internet (WiFi or 3G),
    // false or not provided if not connected
    _online: true,
    _muted: false, // true if volume is off, device is in muted state
    _background: false, // true if app was in background when it crashed

    // error info
    _name: 'Null Pointer exception', // optional if provided by OS/Platform, else will use first line of stack
    _error: 'Some error stack here', // error stack, can provide multiple separated by blank new line
    _nonfatal: false, // true if handled exception, false or not provided if unhandled crash
    _logs: 'logs provided here', // some additional logs provided, if any
    // running time since app start in seconds
    _run: (new Date().getTime() - Countly.startTime) / 1000,

    // custom key/values provided by developers
    _custom: {
      facebook_sdk: '3.5',
      admob: '6.5',
    },
  };
  Countly.log(crashLog, crash);
};

Countly.enableCrashReporting = () => {};
Countly.setCustomCrashSegments = () => {};

Countly.logException = () => {};

// crash report

Countly.recordView = (viewName) => {
  Countly.recordEvent({
    key: '[CLY]_view',
    segmentation: {
      name: viewName,
      segment: Countly.getOS(),
      visit: 1,
    },
  });
};

Countly.setViewTracking = (isViewTracking) => {
  Countly.isViewTracking = isViewTracking;
};

Countly.getDeviceID = () => Countly.DEVICE_ID;

Countly.log = (arg1, arg2) => {
  if (Countly.isDebug) {
    console.log(arg1, arg2);
  }
};
