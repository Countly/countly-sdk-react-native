 import {
 Platform,
 NativeModules,
 AsyncStorage,
 Alert,
 Dimensions,
 AppState,
 PushNotificationIOS,
 DeviceEventEmitter
} from "react-native";
import type { RemoteMessage } from 'react-native-firebase';
import firebase from 'react-native-firebase';
import DeviceInfo from "react-native-device-info";
import BackgroundTimer from "react-native-background-timer";
import NotificationActions from "react-native-ios-notification-actions";
import RNRestart from "react-native-restart";
import {
 setJSExceptionHandler,
 getJSExceptionHandler,
 setNativeExceptionHandler
} from "react-native-exception-handler";
import { Ajax, userData, createHash } from "./util";
import pinch from "react-native-pinch";
``;

export { default as StarRating } from "./Countly.Rating";

const sdkVersion = "1.0.6";
const sdkName = "countly-sdk-react-native";
let PushNotification = null;

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
   this.defaultAlert = {
     enable: false,
     title: "Application Error",
     message: "Application will be restarted",
     buttonTitle: "Restart",
     onClick: () => this.restartApp()
   };
   this.mode;
   this.customCrashLog = null;
   this.crashLogData = null;
   this.isReady = false;
   this.startTime = Ajax.getTime();
   this.sessionId = null;
   this.isBackground = false;
   this.storedEvents = {};
   this.userData = userData;
   this.secretSalt = null;
   this.isToken = false;
   this.deepLinkData = null;
  
   this.deepLinkHandler = {
     handler1: null,
     handler2: null
   };
   this.cerFileName = null;
   this.DEVICE_ID = null;
   this.TEST = 2;
   this.ADHOC = 1;
   this.PRODUCTION = 0;
   this.SESSION_INTERVAL = 60;
   this.isStarRatingVisible = false;
   if (NativeModules.ExponentUtil) {
     NativeModules.ExponentUtil.getCurrentLocaleAsync().then(local => {
       this.device._locale = local;
     });
   }
   AppState.addEventListener("change", nextState =>
     this.onStateChange(nextState)
   );
   DeviceEventEmitter.addListener("notificationActionReceived", action =>
     this.handleNotificationAction(action)
   );
   // get the queue having unprocessed requests
   Ajax.getItem = ("OFFLINE",
   offline => {
     if (offline) {
       this.queue = JSON.parse(offline) || [];
       this.log("Countly-queue-get", this.queue);
     }
     if (this.queue.constructor !== Array) {
       this.queue = [];
     }
   });

   // return deviceId as soon as the Countly is instatiated
   Ajax.getItem = ("DEVICE_ID",
   (err, S_DEVICE_ID) => {
     this.isReady = true;
     this.DEVICE_ID = S_DEVICE_ID || Ajax.generateUUID();
   });
 }

 // add default parameters to the request data
 addDefaultParameters = data => {
   const newData = data;
   const currTime = Ajax.getTime();
   newData.device_id = this.DEVICE_ID;
   newData.timestamp = currTime;
   newData.hour = Ajax.getHour(currTime);
   newData.dow = Ajax.getDay(currTime);
   newData.tz = Ajax.getTimeZone(currTime);
   newData.sdk_name = `js-reactnative-${this.getOS()}`;
   newData.sdk_version = sdkVersion;
   return newData;
 };

 // get method
 get = (url, data, callback) => {
   if (!this.isInit) {
     return this.add(url, data);
   }

   const newData = this.addDefaultParameters(data);
   newData.app_key = this.APP_KEY;

   // Checking If cerFileName config Flag is exist or not
   let isLengthExceedGetLimit = false;
   let isCerFileName = false;
   if (this.cerFileName) {
     isCerFileName = true;
   } else {
     isLengthExceedGetLimit = this.checkLength(newData);
   }

   if (this.isPost || isLengthExceedGetLimit || isCerFileName) {
     this.post(url, newData, callback);
     return null;
   }

   let newURL = null;
   if (this.secretSalt) {
     newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData, this.secretSalt)}`;
   } else {
     newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData)}`;
   }

   Ajax.get(newURL, newData, callback)
     .then(response => {
       this.log("promise resolved", response);
     })
     .catch(error => {
       this.add(newURL, newData);
       this.log("Promise reject", error);
     });
   return null;
 };

 // post method
 post = (url, newData, callback) => {
   if (!this.isInit) {
     return null;
   }

   let newURL = null;
   if (this.secretSalt) {
     const hash = createHash(
       `${JSON.stringify({ ...newData })}${this.secretSalt}`
     );
     newURL = `${this.ROOT_URL}${url}?app_key=${this.APP_KEY}&device_id=${
       this.DEVICE_ID
     }&checksum256=${hash}`;
   } else {
     newURL = `${this.ROOT_URL}${url}?app_key=${this.APP_KEY}&device_id=${
       this.DEVICE_ID
     }`;
   }

   // checking If config cerfilename is exist or not
   if (this.cerFileName) {
     Ajax.sslCertificateRequest(newURL, newData, this.cerFileName, result =>
       this.log("inside cerFile post request", result)
     )
       .then(response => {
         this.log("promise resolved", response);
       })
       .catch(error => {
         this.add(newURL, newData);
         this.log("Promise reject", error);
       });
     return null;
   }

   Ajax.post(newURL, newData, callback)
     .then(response => {
       this.log("promise resolved", response);
     })
     .catch(error => {
       this.add(newURL, newData);
       this.log("Promise reject", error);
     });
   return null;
 };

 // get stored DeviceId(if exist) initially during initialization of Countly SDK
 setDeviceId = () =>
   new Promise(async (resolve, reject) => {
     let DeviceId = null;
     try {
       DeviceId = await AsyncStorage.getItem("Countly:DEVICE_ID");
       this.isReady = true;
       resolve(DeviceId);
     } catch (err) {
       this.log("Unable getting data", err);
       reject();
     }
   });

 // Listen events when the application is in foreground or background and
 // start and stop the Countly SDK accordingly
 onStateChange = nextState => {
   if (!this.isManualSessionHandling) {
     if (this.isBackground && nextState === "active") {
       this.log("foreground");
       if (this.isBackground) {
         this.start()
           .then(result => this.log("countly", result))
           .catch(err => this.log("countly error", err));
       }
       this.isBackground = false;
     }
     if (nextState === "background") {
       this.log("background");
       this.stop()
         .then(result => this.log("Countly", result))
         .catch(err => this.log("Countly error", err));
       this.isBackground = true;
     }
   }
 };

 /**
  * @description adds incomplete requests into queue
  */
 add = (url, data) => {
   if (this.queue.length <= 1000) {
     this.queue.push({ url, data });
     this.log("Countly-queue-set", this.queue);
     Ajax.setItem("OFFLINE", JSON.stringify(this.queue));
   } else {
     this.log("Maximum Queue limit exceed");
   }
 };

 // get method to be call from update method
 updateQueueRequest = (url, data) =>
   new Promise(async (resolve, reject) => {
     if (!this.isInit) {
       return reject(new Error("App not initialized"));
     }

     const newData = this.addDefaultParameters(data);
     newData.app_key = this.APP_KEY;

     let isLengthExceedGetLimit = this.checkLength(newData);
     let newURL = null;
     if (this.secretSalt) {
       newURL = `${this.ROOT_URL}${url}?${Ajax.query(
         newData,
         this.secretSalt
       )}`;
     } else {
       newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData)}`;
     }

     // checking for the cerFilename exist or not for queue request
     if (this.cerFileName) {
       try {
         await Ajax.sslCertificateRequest(
           newURL,
           newData,
           this.cerFileName,
           result => this.log("inside update queue post", result)
         );
         this.queue.shift();
         this.log("newQueueData: ", this.queue);
         return resolve();
       } catch (error) {
         return reject(new Error(error));
       }
     }

     // const newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData, this.secretSalt)}`;
     if (this.isPost || isLengthExceedGetLimit) {
       try {
         await Ajax.post(newURL, newData, result =>
           this.log("inside update queue", result)
         );
         this.queue.shift();
         this.log("newQueueData: ", this.queue);
         return resolve();
       } catch (error) {
         return reject(new Error(error));
       }
     }

     try {
       await Ajax.get(newURL, newData, result =>
         this.log("inside update queue", result)
       );
       this.queue.shift();
       this.log("newQueueData: ", this.queue);
       return resolve();
     } catch (error) {
       return reject(new Error(error));
     }
   });

 /**
  * @description try sending request and updates queue
  */
 update = async () => {
   this.log("inside update");
   if (this.isReady) {
     // for (let i = 0, il = this.queue.length; i < il; i += 1) {
     while (this.queue.length) {
       this.log("Countly-queue-update", this.queue[0]);
       try {
         await this.updateQueueRequest(this.queue[0].url, this.queue[0].data); // eslint-disable-line no-await-in-loop, max-len
       } catch (error) {
         setTimeout(() => {}, 60000);
       }
     }
     this.queue = [];
     Ajax.setItem("OFFLINE", "[]");
   }
 };

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
 };

 /**
  * @description to initialize the countly SDK
  * @param {*} ROOT_URL dashboard base address
  * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
  * @param {*} DEVICE_ID optional if user wants to set custom Device Id
  */
 init = (ROOT_URL, APP_KEY, DEVICE_ID = null) =>
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
       this.log("Error while getting", "DEVICE_ID");
       return reject(new Error("Error while getting DEVICE_ID"));
     }
     try {
       await Ajax.setItem("DEVICE_ID", this.DEVICE_ID);
     } catch (err) {
       this.log("Error while setting", "DEVICE_ID");
       return reject(new Error("Error while setting DEVICE_ID"));
     }
     // this.get('/i', {}, (result) => {
     //   this.log('init-result', result);
     //   // this.update();
     // });
     this.isInit = true;
     // this.update();
     this.processQueue();
     return resolve();
   });

 // return if SDK is initialized or not
 isInitialized = () => this.isInit;

 hasBeenCalledOnStart = () => {};

 // start session and save deviceData return from Countly.getDevice() function
 session = status => {
   const session = {
     session_duration: this.SESSION_INTERVAL,
     metrics: this.getDevice()
   };
   if (status === "session_start") {
     session.begin_session = 1;
   }
   if (status === "session_stop") {
     session.end_session = true;
   }
   this.get("/i", session, result => {
     this.log("session-result", result);
   });
 };

 // return Device OS
 getOS = () => {
   if (Platform.OS.match("android")) {
     return "Android";
   }
   if (Platform.OS.match("ios")) {
     return "iOS";
   }
   return Platform.OS;
 };

 // returns Device data on which the application with Countly SDK is running
 getDevice = () => {
   const { height, width, scale } = Dimensions.get("window");
   this.device = {
     _os: this.getOS(),
     _os_version: DeviceInfo.getSystemVersion(),
     _manufacture: DeviceInfo.getBrand(),
     _device: DeviceInfo.getModel(),
     _carrier: DeviceInfo.getCarrier(),
     _resolution: `${width * scale}x${height * scale}`,
     _app_version: DeviceInfo.getVersion(),
     _locale: DeviceInfo.getDeviceLocale(),
     _store: DeviceInfo.getBundleId(),
     _ram_total: DeviceInfo.getTotalMemory(),
     _disk_total: DeviceInfo.getTotalDiskCapacity() / (1024 * 1024),
     _disk_current: DeviceInfo.getFreeDiskStorage() / (1024 * 1024)
   };
   if (Platform.OS.match("android")) {
     this.device._ram_current = DeviceInfo.getMaxMemory();
   }
   return this.device;
 };

 // returns version of OS
 getVersion = (os, version) => {
   if (os === "Android") {
     return version;
   }
   return version;
 };

 // starts Countly SDK
 start = () =>
   new Promise(async (resolve, reject) => {
     if (!this.isInit) {
       reject(
         new Error(
           "Countly is not initalized, Call begin method to initalize Counlty"
         )
       );
     }
     this.stop();
     this.session("session_start");
     this.sessionId = setInterval(() => {
       this.session("session_update");
     }, this.SESSION_INTERVAL * 1000);
     resolve("Session Started");
   });

 /**
  * @description combined function of init and start
  * @param {*} ROOT_URL dashboard base address
  * @param {*} APP_KEY provided after the successfull signin to the countly dashboard
  * @param {*} DEVICE_ID optional if user wants to set custom Device Id
  */
 begin = (ROOT_URL, APP_KEY, DEVICE_ID = null) =>
   new Promise(async (resolve, reject) => {
     try {
       await this.init(ROOT_URL, APP_KEY, DEVICE_ID);
     } catch (err) {
       return reject(new Error("Unable to initialize Countly"));
     }
     try {
       await this.start();
     } catch (err) {
       return reject(new Error("Unable to start session"));
     }
     return resolve("Countly is initialized and session is started");
   });

 // Stop Countly SDK and end session
 stop = () =>
   new Promise(resolve => {
     if (this.sessionId) {
       this.session("session_stop");
       clearInterval(this.sessionId);
     }
     this.sessionId = null;
     resolve("Session End");
   });

 // Change the DeviceId
 changeDeviceId = newDeviceId =>
   new Promise(async (resolve, reject) => {
     const changeDevice = {
       old_device_id: this.DEVICE_ID
     };
     if (!this.isInit) {
       return reject(new Error("App not initialized"));
     }
     this.DEVICE_ID = newDeviceId;
     const url = "/i";

     const newData = this.addDefaultParameters(changeDevice);
     newData.app_key = this.APP_KEY;

     let isLengthExceedGetLimit = this.checkLength(newData);
     let newURL = null;
     if (this.secretSalt) {
       newURL = `${this.ROOT_URL}${url}?${Ajax.query(
         newData,
         this.secretSalt
       )}`;
     } else {
       newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData)}`;
     }

     // checking for the cerFilename exist or not for queue request
     if (this.cerFileName) {
       try {
         await Ajax.sslCertificateRequest(
           newURL,
           newData,
           this.cerFileName,
           result => this.log("inside Change DeviceId", result)
         );
       } catch (error) {
         this.DEVICE_ID = changeDevice.old_device_id;
         return reject(
           new Error(
             `Your DeviceId remains same: ${this.DEVICE_ID}, error: ${error}`
           )
         );
       }
     }

     // const newURL = `${this.ROOT_URL}${url}?${Ajax.query(newData, this.secretSalt)}`;
     if (this.isPost || isLengthExceedGetLimit) {
       try {
         await Ajax.post(newURL, newData, result =>
           this.log("inside Change DeviceId", result)
         );
       } catch (error) {
         this.DEVICE_ID = changeDevice.old_device_id;
         return reject(
           new Error(
             `Your DeviceId remains same: ${this.DEVICE_ID}, error: ${error}`
           )
         );
       }
     }

     try {
       await Ajax.get(newURL, newData, result =>
         this.log("inside Change DeviceId", result)
       );
     } catch (error) {
       this.DEVICE_ID = changeDevice.old_device_id;
       return reject(
         new Error(
           `Your DeviceId remains same: ${this.DEVICE_ID}, error: ${error}`
         )
       );
     }
     Ajax.setItem("DEVICE_ID", this.DEVICE_ID);
     return resolve("Device Id changed successfully");
   });

 /**
  * Change current user/device id
  * @param {string} newId - new user/device ID to use
  * @param {boolean} onServer - if true, move data from old ID to new ID on server
  **/
 setNewDeviceId = (deviceId, onServer = false) =>
   new Promise(async (resolve, reject) => {
     if (onServer) {
       if (this.DEVICE_ID === deviceId) {
         return resolve("New DeviceId is same as old deviceId");
       }
       try {
         const result = await this.changeDeviceId(deviceId);
         return resolve("DeviceId changed successfully onServer: ", result);
       } catch (error) {
         return reject(new Error(`Unable to change DeviceId ${error}`));
       }
     } else {
       // merge locally, stop session and start new session
       try {
         await this.stop();
         const result = await Ajax.setItem("DEVICE_ID", deviceId, result => {
           this.log(result);
         });
         this.DEVICE_ID = deviceId;
         this.storedEvents = {};
         await this.start();
         return resolve(
           `DeviceId will be change for the next session`,
           result
         );
       } catch (error) {
         return reject(new Error(`Unable to change DeviceId ${error}`));
       }
     }
   });

 setOptionalParametersForInitialization = (countryCode, city, location) => {
   this.get(
     "/i",
     {
       country_code: countryCode,
       city,
       location
     },
     result => {
       this.log("setOptionParam", result);
     }
   );
 };

 // set Location
 setLocation = (latitude, longitude) => {
   this.get(
     "/i",
     {
       location: `${latitude},${longitude}`
     },
     result => {
       this.log("setLocation", result);
     }
   );
 };

 // returns length of data, passed in url
 checkLength = data => {
   if (data.length > 2000) {
     return true;
   }
   return false;
 };

 // set http request type to post
 setHttpPostForced = isPost => {
   this.isPost = isPost;
 };

 enableParameterTamperingProtection = salt => {
   this.secretSalt = salt;
 };

 // Events
 recordEvent = events => {
   const eventsData = events;
   if (events) {
     eventsData.count = eventsData.count || 1;
   }

   this.get(
     "/i",
     {
       events: [eventsData]
     },
     result => {
       this.log("recordEvent", result);
     }
   );
 };

 startEvent = events => {
   const eventsData = { key: events };
   eventsData.dur = Ajax.getTime();

   this.storedEvents[eventsData.key] = eventsData;
   this.log("storedData: ", this.storedEvents);
 };

 endEvent = events => {
   const eventsData = this.storedEvents[events];
   eventsData.dur = Ajax.getTime() - eventsData.dur || 0;
   this.log("endEvent-TimedEvent: ", eventsData);
   this.recordEvent(eventsData);
   delete this.storedEvents[eventsData.key];
 };

 // sets user data
 setUserData = userDetails => {
   this.get(
     "/i",
     {
       user_details: userDetails
     },
     result => {
       this.log("setUserData", result);
     }
   );
 };

 // Push Notification

 initMessaging = (mode) => {
 
   this.mode=mode;
   this.checkPermission();

   firebase.notifications().getInitialNotification()
     .then((notificationOpen: NotificationOpen) => {
         if (notificationOpen) {
             console.log(notificationOpen.action);
              const action = notificationOpen.action;
               if (this.deepLinkHandler.handler1){
                 this.deepLinkHandler.handler1(action);
               }
           this.openPush(notification._notificationId);
         }
     });

   this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
     if (Platform.OS === 'android') {
       this.registerPush(mode, fcmToken);
        console.log(fcmToken);
     }   
      else{
        firebase.messaging().ios.getAPNSToken().then(value=>{
           console.log("APNS Token received:", value);
           this.registerPush(value);
         });
     }
   });
  
   const channel = new firebase.notifications.Android.Channel('countlyPushNotificationChannel', 'countly Channel', firebase.notifications.Android.Importance.Max)
     .setDescription('countly Channel');
   firebase.notifications().android.createChannel(channel);

   this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {

     console.log("onNotificationDisplayed", notification);
   });

   this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
     // Process your notification as required
     console.log('onNotification',notification);

   });

   this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
     const action = notificationOpen.action;
     if (this.deepLinkHandler.handler1){
       this.deepLinkHandler.handler1(action);
     }
     const notification: Notification = notificationOpen.notification;
   
     console.log("onNotificationOpened", notification);
     console.log(notification._notificationId);
     this.openPush(notification._notificationId);

   });

   this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
     console.log("onMessage", message);
     const notification = new firebase.notifications.Notification()
     .setNotificationId('notificationId')
     .setTitle(message.data.title)
     .setBody(message.data.message)
     .setSound(message.data.sound)
     .setNotificationId(message._messageId)
     .setData({
       key1: 'value1',
       key2: 'value2',
     });
  if (Platform.OS === 'android') {
       notification._android._channelId ='countlyPushNotificationChannel';
       notification._android.setAutoCancel(true);
       notification._android.setClickAction(message.data['c.l']);

       if(message.data['c.m']) {
             notification.android.setBigPicture(message.data['c.m']);
           }
           if(message.data.smallPicture) {
             notification.android.setLargeIcon(message.data.smallPicture);
           }
           if(message.data.color) {
             notification.android.setColor(message.data.color);
           }
           if (message.data['c.b']) {
             this.deepLinkData = JSON.parse(`${message.data['c.b']}`);
             const buttons = this.deepLinkData.map(data => `${data.t}`);
             const links =this.deepLinkData.map(data => `${data.l}`);
             if(buttons[0]){
                 const action1 = new firebase.notifications.Android.Action(links[0], 'ic_launcher', buttons[0]);
                 notification.android.addAction(action1);
             }
             if(buttons[1]){
                 const action2 = new firebase.notifications.Android.Action(links[1], 'ic_launcher', buttons[1]);
                 notification.android.addAction(action2);
             }
           }
     }
     firebase.notifications().displayNotification(notification);
 });

 }

 // Initmessaging  --end
     async checkPermission() {
       const enabled = await firebase.messaging().hasPermission();
       if (enabled) {
           this.getToken();
           console.log('has permissions');
       } else {
           this.requestPermission();
       }
     }

     async requestPermission(){
               try {
           await firebase.messaging().requestPermission();
           this.getToken();
           console.log('granted permissions');
       } catch (error) {
       }
             }

     async getToken(){
       if (Platform.OS === 'android') {
       firebase
         .messaging()
         .getToken()
         .then(fcmToken => {
           if (fcmToken) {
             console.log("FCM Token received :", fcmToken);
             this.registerPush(fcmToken);


           } else {
             console.log("No token received");
           }
         });
       }
       else{
         firebase.messaging().ios.getAPNSToken().then(value=>{
           console.log("APNS Token received:", value);
           this.registerPush(value);
         });
       }  
     }


registerPush = (token) => {
   if (!this.isToken) {
     this.isToken = true;
     const data = {
       token_session: 1,
       test_mode: this.mode,
     };
     data[`${Platform.OS}_token`] = token;
     this.get('/i', data, (result) => { this.log('registerPush', result); });
   }
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


 // Push Notification --end

 // crash report
 addCrashLog = (crashLog = null) => {
   const crash = {
     ...this.getDevice(),
     ...this.crashLogData,
     _online: true,
     _background: this.isBackground,
     _run: (new Date().getTime() - this.startTime) / 1000
   };
   if (crashLog) {
     // custom key/values provided by developers
     crash._custom = { ...crashLog };
   }
   this.get("/i", { crash }, result => {
     this.log("addCrashLog", result);
   });
   this.stop();
   if (this.defaultAlert.enable) {
     Alert.alert(
       this.defaultAlert.title,
       this.defaultAlert.message,
       [
         {
           text: this.defaultAlert.buttonTitle,
           onPress: this.defaultAlert.onClick
         }
       ],
       { cancelable: false }
     );
   }
 };

 crashReportingHandler = (e, isFatal) => {
   const crashLog = { _error: e.message, nonFatal: !isFatal, name: "Error" };

   this.crashLogData = crashLog;
   if (this.customCrashLog && typeof this.customCrashLog === "function") {
     this.customCrashLog();
   } else {
     this.addCrashLog();
   }
 };

 enableCrashReporting = (enable = false, enableInDevMode = false) => {
   if (enable) {
     setJSExceptionHandler(this.crashReportingHandler, enableInDevMode);
     setNativeExceptionHandler(errorString => {
       const crashLog = {
         error: errorString,
         name: "Fatal Error",
         nonFatal: false
       };
       this.addCrashLog(crashLog);
     });
   }
 };

 restartApp = () => RNRestart.Restart();

 getExceptionHandler = () => getJSExceptionHandler();
 // crash report

 // view handling
 recordViewDuration = (lastViewStartTime, lastView) => {
   this.recordEvent({
     key: "[CLY]_view",
     dur: Ajax.reportViewDuration(lastViewStartTime),
     segmentation: {
       name: lastView,
       segment: this.getOS()
     }
   });
 };

 recordView = viewName => {
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
       key: "[CLY]_view",
       segmentation: segmentData
     });
   }
 };

 recordViewActions = (actionType, touchCoordinate) => {
   this.recordEvent({
     key: "[CLY]_action",
     segmentation: {
       type: actionType,
       x: touchCoordinate.x,
       y: touchCoordinate.y,
       width: Dimensions.get("window").width,
       height: Dimensions.get("window").height
     }
   });
 };

 setViewTracking = isViewTracking => {
   this.isViewTracking = isViewTracking;
 };
 // view handling

 /**
  * @description return deviceId
  */
 getDeviceID = () => this.DEVICE_ID;

 /**
  * @description starRating Event
  */
 starRating = rating => {
   const eventData = {
     key: "[CLY]_star_rating",
     platform: this.getOS(),
     app_version: DeviceInfo.getVersion(),
     rating
   };
   this.recordEvent(eventData);
 };

 log = (arg1, arg2) => {
   if (this.isDebug) {
     console.log(arg1, arg2);
   }
 };

  bgMessaging = (message) => {
   console.log("RemoteMessage", message);
  
const notification = new firebase.notifications.Notification()
     .setNotificationId('notificationId')
     .setTitle(message.data.title)
     .setBody(message.data.message)
     .setSound(message.data.sound)
     .setNotificationId(message.messageId)
     .setData({
       key1: 'value1',
       key2: 'value2',
     });
  if (Platform.OS === 'android') {
       notification._android._channelId ='countlyPushNotificationChannel';
       notification._android.setAutoCancel(true);
       notification._android.setClickAction(message.data['c.l']);

       if(message.data['c.m']) {
             notification.android.setBigPicture(message.data['c.m']);
           }
           if(message.data.smallPicture) {
             notification.android.setLargeIcon(message.data.smallPicture);
           }
           if(message.data.color) {
             notification.android.setColor(message.data.color);
           }
           if (message.data['c.b']) {
             this.deepLinkData = JSON.parse(`${message.data['c.b']}`);
             const buttons = this.deepLinkData.map(data => `${data.t}`);
             const links =this.deepLinkData.map(data => `${data.l}`);
             if(buttons[0]){
                 const action1 = new firebase.notifications.Android.Action(links[0], 'ic_launcher', buttons[0]);
                 notification.android.addAction(action1);
             }
             if(buttons[1]){
                 const action2 = new firebase.notifications.Android.Action(links[1], 'ic_launcher', buttons[1]);
                 notification.android.addAction(action2);
             }
           }
     }
     this.sentPush(message._messageId);
     firebase.notifications().displayNotification(notification);
}
}
export default new Countly();

