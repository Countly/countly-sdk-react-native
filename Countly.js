import { Platform, NativeModules, AsyncStorage, Dimensions, AppState } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Ajax, userData } from './util';

class Countly {
  constructor() {
    this.ROOT_URL = null;
    this.APP_KEY = null;
    this.queue = [];
    this.device = {};
    this.isDebug = false;
    this.isInit = false;
    this.isPost = false;
    this.isManualSessionHandling = false;
    this.isViewTracking = false;
    this.isReady = false;
    this.salt = null;
    this.startTime = new Date().getTime();
    this.sessionId = null;
    this.isBackground = false;
    this.storedEvents = {};
    this.userData = userData;
    this.DEVICE_ID = null;
    this.TEST = 2;
    this.ADHOC = 1;
    this.PRODUCTION = 0;
    this.sdkVersion = '1.0.6';
    this.sdkName = 'countly-sdk-react-native';
    this.SESSION_INTERVAL = 60;
    if (NativeModules.ExponentUtil) {
      NativeModules.ExponentUtil.getCurrentLocaleAsync().then((local) => {
        this.device._locale = local;
      });
    }
    AppState.addEventListener('change', nextState => this.onStateChange(nextState));

    // get the queue having unprocessed requests
    Ajax.getItem = ('OFFLINE', (offline) => {
      if (offline) {
        this.queue = JSON.parse(offline) || [];
        this.log('Countly-queue-get', this.queue);
      }
      if (this.queue.constructor !== Array) {
        this.queue = [];
      }
    });

    // return deviceId as soon as the Countly is instatiated
    Ajax.getItem = ('DEVICE_ID', (err, S_DEVICE_ID) => {
      this.isReady = true;
      this.DEVICE_ID = S_DEVICE_ID || Ajax.generateUUID();
    });
  }

  // get method
  get = (url, data, callback) => {
    if (!this.isInit) {
      return this.add(url, data);
    }
    const newData = data;
    newData.device_id = this.DEVICE_ID;
    newData.app_key = this.APP_KEY;
    newData.timestamp = Ajax.getTime();
    newData.sdk_name = this.sdkName;
    newData.sdk_version = this.sdkVersion;

    if (this.isPost) {
      this.post(url, newData, callback);
      return null;
    }
    // Countly.log('GET Method');
    const newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData)}`;
    Ajax.get(newURL, newData, callback).then((response) => {
      this.log('promise resolved', response);
    }).catch((error) => {
      this.add(newURL, newData);
      this.log('Promise reject', error);
    });
    return null;
  }

  // post method
  post = (url, data, callback) => {
    if (!this.isInit) {
      return null;
    }
    // Countly.log('POST Method');
    const newData = data;
    newData.device_id = this.DEVICE_ID;
    newData.app_key = this.APP_KEY;
    newData.timestamp = Ajax.getTime();

    newData.sdk_name = this.sdkName;
    newData.sdk_version = this.sdkVersion;

    const newURL = `${this.ROOT_URL}${url}?app_key=${this.APP_KEY}`;
    Ajax.post(newURL, newData, callback, this.APP_KEY).then((response) => {
      this.log('promise resolved', response);
    }).catch((error) => {
      this.add(newURL, newData);
      this.log('Promise reject', error);
    });
    return null;
  }

  // set DeviceId initially during initialization of Countly SDK
  setDeviceId = () => (
    new Promise(async (resolve, reject) => {
      let DeviceId = null;
      try {
        DeviceId = await AsyncStorage.getItem('Countly:DEVICE_ID');
        this.isReady = true;
        this.DEVICE_ID = DeviceId || Ajax.generateUUID();
        resolve();
      } catch (err) {
        this.log('Unable getting data', err);
        reject();
      }
    })
  );

  // Just for testing purpose
  testing = () => {
    this.log();
    setTimeout(() => this.log('Hi from background', { hello: 'hello' }), 1000);
  }

  // Listen events when the application is in foreground or background and
  // start and stop the Countly SDK accordingly
  onStateChange = (nextState) => {
    if (!this.isManualSessionHandling) {
      if (this.isBackground && nextState === 'active') {
        this.log('foreground');
        if (this.isBackground) {
          this.start();
        }
        this.isBackground = false;
      }
      if (nextState === 'background') {
        this.log('background');
        // for testing purpose
        this.testing();
        this.stop();
        this.isBackground = true;
      }
    }
  }

  /**
   * @description adds incomplete requests into queue
   */
  add = (url, data) => {
    this.queue.push({ url, data });
    this.log('Countly-queue-set', this.queue);
    Ajax.setItem('OFFLINE', JSON.stringify(this.queue));
  }

  /**
   * @description try sending request and updates queue
   */
  update = () => {
    if (this.isReady) {
      for (let i = 0, il = this.queue.length; i < il; i += 1) {
        this.log('Countly-queue-update', this.queue[i]);
        this.get(this.queue[i].url, this.queue[i].data, () => {});
      }
      this.queue = [];
      Ajax.setItem('OFFLINE', '[]');
    }
  }

  /**
 * @description to initialize the countly SDK
 * @param {*} ROOT_URL dashboard base address
 * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
 */
  init = (ROOT_URL, APP_KEY) => (
    new Promise(async (resolve, reject) => {
      this.ROOT_URL = ROOT_URL;
      this.APP_KEY = APP_KEY;
      try {
        await this.setDeviceId();
      } catch (err) {
        this.log('Error while getting', 'DEVICE_ID');
        return reject(new Error('Error while getting DEVICE_ID'));
      }
      try {
        await Ajax.setItem('DEVICE_ID', this.DEVICE_ID);
      } catch (err) {
        this.log('Error while setting', 'DEVICE_ID');
        return reject(new Error('Error while setting DEVICE_ID'));
      }
      this.get('/i', {}, (result) => {
        this.log('init-result', result);
        this.update();
      });
      this.isInit = true;
      return resolve();
    })
  )

  // return if SDK is initialized or not
  isInitialized = () => this.isInit;

  hasBeenCalledOnStart = () => {}

  // start session and save deviceData return from Countly.getDevice() function
  session = (status) => {
    const session = {
      session_duration: this.SESSION_INTERVAL,
      metrics: this.getDevice(),
    };
    if (status === 'session_start') {
      session.begin_session = 1;
    }
    if (status === 'session_stop') {
      session.end_session = true;
    }
    this.get('/i', session, (result) => { this.log('session-result', result); });
  }

  // return Device OS
  getOS = () => {
    if (Platform.OS.match('android')) {
      return 'Android';
    }
    if (Platform.OS.match('ios')) {
      return 'iOS';
    }
    return Platform.OS;
  }

  // returns Device data on which the application with Countly SDK is running
  getDevice = () => {
    const { height, width, scale } = Dimensions.get('window');
    this.device = {
      _os: this.getOS(),
      _os_version: DeviceInfo.getSystemVersion(),
      _device: DeviceInfo.getModel(),
      _carrier: DeviceInfo.getCarrier(),
      _resolution: `${width * scale}x${height * scale}`,
      _app_version: DeviceInfo.getVersion(),
      _density: DeviceInfo.getDensity(),
      _locale: DeviceInfo.getDeviceLocale(),
      _store: DeviceInfo.getBundleId(),
    };
    return this.device;
  }

  // returns version of OS
  getVersion = (os, version) => {
    if (os === 'Android') {
      return version;
    }
    return version;
  }

  // starts Countly SDK
  start = () => (
    new Promise(async (resolve, reject) => {
      if (!this.isInit) {
        reject(new Error('Countly is not initalized, Call begin method to initalize Counlty'));
      }
      this.stop();
      this.session('session_start');
      this.sessionId = setInterval(() => {
        this.session('session_update');
      }, this.SESSION_INTERVAL * 1000);
      resolve('Session Started');
    })
  )

  /**
 * @description combined function of init and start
 * @param {*} ROOT_URL dashboard base address
 * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
 */
  begin = (ROOT_URL, APP_KEY) => (
    new Promise(async (resolve, reject) => {
      try {
        await this.init(ROOT_URL, APP_KEY);
      } catch (err) {
        return reject(new Error('Unable to initialize Countly'));
      }
      try {
        await this.start();
      } catch (err) {
        return reject(new Error('Unable to start session'));
      }
      return resolve('Countly is initialized and session is started');
    })
  )

  // Stop Countly SDK and end session
  stop = () => (
    new Promise((resolve) => {
      if (this.sessionId) {
        this.session('session_stop');
        clearInterval(this.sessionId);
      }
      this.sessionId = null;
      resolve('Session End');
    })
  )

  // Change the DeviceId
  changeDeviceId = (newDeviceId) => {
    const changeDevice = {
      old_device_id: this.DEVICE_ID,
    };
    this.DEVICE_ID = newDeviceId;
    this.get('/i', changeDevice, (result) => { this.log('changeDeviceId', result); });
    Ajax.setItem('DEVICE_ID', this.DEVICE_ID);
  }

  setOptionalParametersForInitialization = (countryCode, city, location) => {
    this.get('/i', {
      country_code: countryCode,
      city,
      location,
    }, (result) => { this.log('setOptionParam', result); });
  }

  setLocation = (latitude, longitude) => {
    this.get('/i', {
      location: `${latitude},${longitude}`,
    }, (result) => { this.log('setLocation', result); });
  }

  setHttpPostForced = (isPost) => {
    this.isPost = isPost;
  }

  enableParameterTamperingProtection = (salt) => {
    this.salt = salt;
  }

  // Events
  recordEvent = (events) => {
    const eventsData = events;
    if (events) {
      eventsData.count = eventsData.count || 1;
    }
    this.get('/i', {
      events: [eventsData],
    }, (result) => { this.log('recordEvent', result); });
  }

  startEvent = (events) => {
    const eventsData = events;
    eventsData.dur = Ajax.getTime();
    this.storedEvents[eventsData.key] = eventsData;
  }

  endEvent = (events) => {
    const eventsData = this.storedEvents[events.key];
    eventsData.dur = Ajax.getTime() - eventsData.dur || 0;
    this.recordEvent(eventsData);
    delete this.storedEvents[eventsData.key];
  }

  // sets user data
  setUserData = (userDetails) => {
    this.get('/i', {
      user_details: userDetails,
    }, (result) => { this.log('setUserData', result); });
  }

  // Push Notification
  initMessaging = (gcmSenderId, mode) => { this.log(gcmSenderId, mode); }

  registerPush = (mode, token) => {
    const data = {
      token_session: 1,
      test_mode: mode,
    };
    data[`${Platform.OS}token`] = token;
    this.get('/i', data, (result) => { this.log('registerPush', result); });
  }

  openPush = (pushNumber) => {
    this.get('/i', {
      key: '[CLY]_push_open',
      count: 1,
      segmentation: {
        i: pushNumber,
      },
    }, (result) => { this.log('openPush', result); });
  }

  actionPush = (pushNumber) => {
    this.get('/i', {
      key: '[CLY]_push_action',
      count: 1,
      segmentation: {
        i: pushNumber,
      },
    }, (result) => { this.log('actionPush', result); });
  }

  sentPush = (pushNumber) => {
    this.get('/i', {
      key: '[CLY]_push_sent',
      count: 1,
      segmentation: {
        i: pushNumber,
      },
    }, (result) => { this.log('sentPush', result); });
  }
  // Push Notification

  // crash report
  addCrashLog = (crashLog) => {
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
      _run: (new Date().getTime() - this.startTime) / 1000,

      // custom key/values provided by developers
      _custom: {
        facebook_sdk: '3.5',
        admob: '6.5',
      },
    };
    this.log(crashLog, crash);
  }

  enableCrashReporting = () => {}
  setCustomCrashSegments = () => {}

  logException = () => {}

  // crash report

  recordView = (viewName) => {
    this.recordEvent({
      key: '[CLY]_view',
      segmentation: {
        name: viewName,
        segment: this.getOS(),
        visit: 1,
      },
    });
  }

  setViewTracking = (isViewTracking) => {
    this.isViewTracking = isViewTracking;
  }

  getDeviceID = () => this.DEVICE_ID;

  log = (arg1, arg2) => {
    if (this.isDebug) {
      console.log(arg1, arg2);
    }
  }
}
export default new Countly();
