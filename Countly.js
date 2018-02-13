import { Platform, NativeModules, AsyncStorage, Alert, Dimensions, AppState, PushNotificationIOS, DeviceEventEmitter } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification from 'react-native-push-notification';
import RNRestart from 'react-native-restart';
import { setJSExceptionHandler, getJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { Ajax, userData } from './util';

const sdkVersion = '1.0.6';
const sdkName = 'countly-sdk-react-native';

class Countly {
  constructor() {
    this.ROOT_URL = null;
    this.APP_KEY = null;
    this.queue = [];
    this.device = {};
    this.isDebug = false;
    this.isInit = false;
    this.isPost = false;
    this.forceDeviceId = false;
    this.isManualSessionHandling = false;
    this.isViewTracking = false;
    this.lastView = null;
    this.lastViewStartTime = Ajax.getTime();
    this.exceptionHandler = null;
    this.isReady = false;
    this.salt = null;
    this.startTime = Ajax.getTime();
    this.sessionId = null;
    this.isBackground = false;
    this.storedEvents = {};
    this.userData = userData;
    this.DEVICE_ID = null;
    this.TEST = 2;
    this.ADHOC = 1;
    this.PRODUCTION = 0;
    this.SESSION_INTERVAL = 60;
    if (NativeModules.ExponentUtil) {
      NativeModules.ExponentUtil.getCurrentLocaleAsync().then((local) => {
        this.device._locale = local;
      });
    }
    AppState.addEventListener('change', nextState => this.onStateChange(nextState));
    PushNotification.registerNotificationActions(['Accept', 'Reject', 'Yes', 'No']);
    DeviceEventEmitter.addListener('notificationActionReceived', action => this.handleNotificationAction(action));
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

  // add default parameters to the request data
  addDefaultParameters = (data) => {
    const newData = data;
    const currTime = Ajax.getTime();
    newData.device_id = this.DEVICE_ID;
    newData.app_key = this.APP_KEY;
    newData.timestamp = currTime;
    newData.hour = Ajax.getHour(currTime);
    newData.dow = Ajax.getDay(currTime);
    newData.tz = Ajax.getTimeZone(currTime);
    newData.sdk_name = `js-reactnative-${this.getOS()}`;
    newData.sdk_version = sdkVersion;
    return newData;
  }

  // get method
  get = (url, data, callback) => {
    if (!this.isInit) {
      return this.add(url, data);
    }

    const newData = this.addDefaultParameters(data);
    // this.log('inside get', newData);
    this.checkLength(newData);
    if (this.isPost) {
      this.setHttpPostForced(false);
      this.post(url, newData, callback);
      return null;
    }

    // this.log('GET Method', newData);
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
  post = (url, newData, callback) => {
    if (!this.isInit) {
      return null;
    }

    const newURL = `${this.ROOT_URL}${url}?app_key=${this.APP_KEY}`;
    Ajax.post(newURL, newData, callback, this.APP_KEY).then((response) => {
      this.log('promise resolved', response);
    }).catch((error) => {
      this.add(newURL, newData);
      this.log('Promise reject', error);
    });
    return null;
  }

  // get stored DeviceId(if exist) initially during initialization of Countly SDK
  setDeviceId = () => (
    new Promise(async (resolve, reject) => {
      let DeviceId = null;
      try {
        DeviceId = await AsyncStorage.getItem('Countly:DEVICE_ID');
        this.isReady = true;
        resolve(DeviceId);
      } catch (err) {
        this.log('Unable getting data', err);
        reject();
      }
    })
  );

  // Listen events when the application is in foreground or background and
  // start and stop the Countly SDK accordingly
  onStateChange = (nextState) => {
    if (!this.isManualSessionHandling) {
      if (this.isBackground && nextState === 'active') {
        this.log('foreground');
        if (this.isBackground) {
          this.start().then(result => this.log('countly', result)).catch(err => this.log('countly error', err));
        }
        this.isBackground = false;
      }
      if (nextState === 'background') {
        this.log('background');
        this.stop().then(result => this.log('Countly', result)).catch(err => this.log('Countly error', err));
        this.isBackground = true;
      }
    }
  }

  /**
   * @description adds incomplete requests into queue
   */
  add = (url, data) => {
    if (this.queue.length <= 1000) {
      this.queue.push({ url, data });
      this.log('Countly-queue-set', this.queue);
      Ajax.setItem('OFFLINE', JSON.stringify(this.queue));
    } else {
      this.log('Maximum Queue limit exceed');
    }
  }

  // get method to be call from update method
  updateQueueRequest = (url, data, callback) => (
    new Promise(async (resolve, reject) => {
      if (!this.isInit) {
        return reject(new Error('App not initialized'));
      }

      const newData = this.addDefaultParameters(data);

      this.checkLength(newData);
      const newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData)}`;
      if (this.isPost) {
        this.setHttpPostForced(false);
        try {
          await Ajax.post(newURL, newData, callback, this.APP_KEY);
          this.queue.shift();
          this.log('newQueueData: ', this.queue);
          return resolve();
        } catch (error) {
          return reject(new Error(error));
        }
      }

      try {
        await Ajax.get(newURL, newData, callback);
        this.queue.shift();
        this.log('newQueueData: ', this.queue);
        return resolve();
      } catch (error) {
        return reject(error);
      }
    })
  );

  /**
   * @description try sending request and updates queue
   */
  update = async () => {
    this.log('inside update');
    if (this.isReady) {
      // for (let i = 0, il = this.queue.length; i < il; i += 1) {
      while (this.queue.length) {
        this.log('Countly-queue-update', this.queue[0]);
        try {
          await this.updateQueueRequest(this.queue[0].url, this.queue[0].data, () => {}); // eslint-disable-line no-await-in-loop, max-len
        } catch (error) {
          setTimeout(() => {}, 60000);
        }
      }
      this.queue = [];
      Ajax.setItem('OFFLINE', '[]');
    }
  }

  /**
   * @description process queue request
   */
  processQueue = () => {
    const intervalId1 = BackgroundTimer.setInterval(() => {
      if (this.queue.length) {
        this.update();
      }
      BackgroundTimer.clearInterval(intervalId1);
    }, 1000);
    if (this.queue.length) {
      const intervalId = BackgroundTimer.setInterval(() => {
        while (this.queue.length) {
          this.update();
        }
        BackgroundTimer.clearInterval(intervalId);
      }, 60000);
    }
  }

  /**
   * @description to initialize the countly SDK
   * @param {*} ROOT_URL dashboard base address
   * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
   * @param {*} DEVICE_ID optional if user wants to set custom Device Id
   */
  init = (ROOT_URL, APP_KEY, DEVICE_ID = null) => (
    new Promise(async (resolve, reject) => {
      this.ROOT_URL = ROOT_URL;
      this.APP_KEY = APP_KEY;
      let deviceId = null;
      try {
        deviceId = await this.setDeviceId();
        if (deviceId) {
          this.DEVICE_ID = deviceId;
        } else {
          this.DEVICE_ID = DEVICE_ID || Ajax.generateUUID();
        }
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
      // this.get('/i', {}, (result) => {
      //   this.log('init-result', result);
      //   // this.update();
      // });
      this.isInit = true;
      // this.update();
      this.processQueue();
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
   * @param {*} DEVICE_ID optional if user wants to set custom Device Id
   */
  begin = (ROOT_URL, APP_KEY, DEVICE_ID = null) => (
    new Promise(async (resolve, reject) => {
      try {
        await this.init(ROOT_URL, APP_KEY, DEVICE_ID);
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

  // set Location
  setLocation = (latitude, longitude) => {
    this.get('/i', {
      location: `${latitude},${longitude}`,
    }, (result) => { this.log('setLocation', result); });
  }

  // returns length of data, passed in url
  checkLength = (data) => {
    if (data.length > 2000) {
      this.setHttpPostForced(true);
    }
  }

  // set http request type to post
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
    const eventsData = { key: events };
    eventsData.dur = Ajax.getTime();
    this.storedEvents[eventsData.key] = eventsData;
    this.log('storedData: ', this.storedEvents);
  }

  endEvent = (events) => {
    const eventsData = this.storedEvents[events];
    eventsData.dur = Ajax.getTime() - eventsData.dur || 0;
    this.log('endEvent-TimedEvent: ', eventsData);
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
  initMessaging = (gcmSenderId, mode) => {
    PushNotification.configure({
      onRegister: (token) => {
        this.registerPush(mode, token.token);
      },
      onNotification: (notification) => {
        this.log('NOTIFICATION:', notification);
        PushNotification.localNotification({
          /* Android Only Properties */
          id: notification.id,
          /* iOS and Android properties */
          title: notification.title,
          message: notification.message, // (required)
          actions: '["Yes", "No", "Reject"]', // (Android only) See the doc for notification actions to know more
        });
        notification.finish(PushNotificationIOS.FetchResult.NoData);
        this.openPush(notification.id);
      },
      senderID: gcmSenderId,
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  registerPush = (mode, token) => {
    const data = {
      token_session: 1,
      test_mode: mode,
    };
    data[`${Platform.OS}_token`] = token;
    this.get('/i', data, (result) => { this.log('registerPush', result); });
  }

  openPush = (pushNumber) => {
    const eventData = { key: '[CLY]_push_open', count: 1, segmentation: { i: pushNumber } };
    this.recordEvent(eventData);
  }

  actionPush = (pushNumber) => {
    const eventData = { key: '[CLY]_push_action', count: 1, segmentation: { i: pushNumber } };
    this.recordEvent(eventData);
  }

  sentPush = (pushNumber) => {
    const eventData = { key: '[CLY]_push_sent', count: 1, segmentation: { i: pushNumber } };
    this.recordEvent(eventData);
  }

  // handle Push Notification actions
  handleNotificationAction = (action) => {
    this.log('Notification action received: ', action);
    const info = JSON.parse(action.dataJSON);
    if (info.action === 'Yes') {
      this.log('Yet to implement');
    } else if (info.action === 'No') {
      this.log('Yet to implement');
    } else if (info.action === 'Reject') {
      PushNotification.cancelLocalNotifications({ id: info.id });
    }
    this.actionPush(info.id);
  }
  // Push Notification

  // crash report
  addCrashLog = (crashLog) => {
    const crash = {
      ...this.getDevice(),
      ...crashLog,
      _online: true,
      _background: this.isBackground,
      _run: (new Date().getTime() - this.startTime) / 1000,

      // custom key/values provided by developers
      // _custom: { ...crashLog },
    };
    this.get('/i', { crash }, (result) => { this.log('addCrashLog', result); });
    this.stop();
    Alert.alert(
      'Application Error',
      'Application will be restarted',
      [
        { text: 'Restart', onPress: () => this.restartApp() },
      ],
      { cancelable: false },
    );
  }

  crashReportingHandler = (e, isFatal) => {
    const crashLog = { _error: e.message, nonFatal: !isFatal, name: 'Error' };
    this.addCrashLog(crashLog);
  }

  enableCrashReporting = (enable = false) => {
    if (enable) {
      setJSExceptionHandler(this.crashReportingHandler, true);
      setNativeExceptionHandler((errorString) => {
        const crashLog = { error: errorString, name: 'Fatal Error', nonFatal: false };
        this.addCrashLog(crashLog);
      });
    }
  }

  restartApp = () => RNRestart.Restart();

  getExceptionHandler = () => getJSExceptionHandler();

  setCustomCrashSegments = () => {}

  logException = () => {}
  // crash report

  // view handling
  recordViewDuration = (lastViewStartTime, lastView) => {
    this.recordEvent({
      key: '[CLY]_view',
      count: 1,
      dur: Ajax.reportViewDuration(lastViewStartTime),
      segmentation: {
        name: lastView,
        segment: this.getOS(),
      },
    });
  }

  recordView = (viewName) => {
    const currTime = Ajax.getTime();
    const segmentData = { name: viewName, segment: this.getOS(), visit: 1 };
    if (this.lastView) {
      this.recordViewDuration(this.lastViewStartTime, this.lastView);
    } else {
      segmentData.start = 1;
    }
    this.lastViewStartTime = currTime;
    this.lastView = viewName;
    if (viewName) {
      this.recordEvent({
        key: '[CLY]_view',
        count: 1,
        segmentation: segmentData,
      });
    }
  }

  recordViewActions = (actionType, touchCoordinate) => {
    this.recordEvent({
      key: '[CLY]_action',
      count: 1,
      segmentation: {
        type: actionType,
        x: touchCoordinate.x,
        y: touchCoordinate.y,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      },
    });
  }

  setViewTracking = (isViewTracking) => {
    this.isViewTracking = isViewTracking;
  }
  // view handling

  /**
   * @description return deviceId
   */
  getDeviceID = () => this.DEVICE_ID;

  log = (arg1, arg2) => {
    if (this.isDebug) {
      console.log(arg1, arg2);
    }
  }
}
export default new Countly();
