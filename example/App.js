import React, { Component } from 'react';
import { AppRegistry, Text, Button, ScrollView, Image } from 'react-native';
import Countly from 'countly-sdk-react-native';
import PushNotificationIOS from 'react-native';
var PushNotification = require('react-native-push-notification');

class AwesomeProject extends Component {
    constructor(props) {
        super(props);        
    };
    onInit(){
      Countly.init("https://try.count.ly","0e8a00e8c01395a0af8be0e55da05a404bb23c3e");
    }
    onStart(){
      Countly.start();
    };
    onStop(){
      Countly.stop();
    };
    onSendUserData(){
      // example for setUserData
      var options = {};
      options.name = "Trinisoft Technologies";
      options.username = "trinisofttechnologies";
      options.email = "trinisofttechnologies@gmail.com";
      options.org = "Trinisoft Technologies Pvt. Ltd.";
      options.phone = "+91 812 840 2946";
      options.picture = "http://www.trinisofttechnologies.com/images/logo.png";
      options.picturePath = "";
      options.gender = "M";
      options.byear = 1989;
      Countly.setUserData(options);
    };
    basicEvent(){
      // example for basic event
      var events = {"eventName":"Basic Event","eventCount":1};
      Countly.sendEvent(events);
    };
    eventWithSum(){
      // example for event with sum
      var events = {"eventName":"Event With Sum","eventCount":1,"eventSum":"0.99"};
      Countly.sendEvent(events);
    };
    eventWithSegment(){
      // example for event with segment
      var events = {"eventName":"Event With Segment","eventCount":1};
      events.segments = {"Country" : "Turkey", "Age" : "28"};
      Countly.sendEvent(events);
    };
    eventWithSumAndSegment(){
      // example for event with segment and sum
      var events = {"eventName":"Event With Sum And Segment","eventCount":1,"eventSum":"0.99"};
      events.segments = {"Country" : "Turkey", "Age" : "28"};
      Countly.sendEvent(events);
    };

    startEvent(){
      Countly.startEvent("timedEvent");
    };

    endEvent(){
      Countly.endEvent("timedEvent");
    };

    userData_setProperty(){
      Countly.userData.setProperty("keyName", "keyValue");
    };

    userData_increment(){
      Countly.userData.increment("keyName");
    };

    userData_incrementBy(){
      Countly.userData.incrementBy("keyName", 10);
    };

    userData_multiply(){
      Countly.userData.multiply("keyName", 20);
    };

    userData_saveMax(){
      Countly.userData.saveMax("keyName", 100);
    };

    userData_saveMin(){
      Countly.userData.saveMin("keyName", 50);
    };

    userData_setOnce(){
      Countly.userData.setOnce("keyName", 200);
    };

    onRegisterDevice(){
      // Countly.initMessaging('403185924621', Countly.TEST);
    }

    onSendTestTokenAndroid(){
      const testToken = 'coyj3YaNss4:APA91bG_9rwIQF4Ul7J2JB76J3afpcP_4TJA1hTfrSjD4lxklLLQIT82ygxLlqND9uUvFbVTosFWvM83QFGiStm_M3HQFK11yO682_5e6MEzL6qsDwWkt_IBv5PTylMhRM6cn2g0CGXs';
      Countly.registerPush(Countly.TEST, testToken);
    }

    pushMessage(){
      // implementation is pending
      PushNotification.localNotification({
        /* Android Only Properties */
        id: '0',

        /* iOS and Android properties */
        title: 'My Notification Title', // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
        message: 'My Notification Message1', // (required)
        actions: '["Yes", "No"]', // (Android only) See the doc for notification actions to know more
      });
    };

    changeDeviceId(){
      Countly.changeDeviceId('02d56d66-6a39-482d-aff0-d14e4d5e5fda');
    };

    cancelMessage(){
      PushNotification.cancelAllLocalNotifications();
    }

    enableParameterTamperingProtection(){
      Countly.enableParameterTamperingProtection("salt");
    };

    setRequiresConsent(){
      Countly.setRequiresConsent();
    }

    giveConsent(){
      Countly.giveConsent("events");
    };

    removeConsent(){
      Countly.removeConsent("events");
    };

    remoteConfigUpdate(){
      Countly.remoteConfigUpdate();
    };

    updateRemoteConfigForKeysOnly(){
      Countly.updateRemoteConfigForKeysOnly("test1");
    };

    updateRemoteConfigExceptKeys(){
      Countly.updateRemoteConfigExceptKeys("test1");
    };

    getRemoteConfigValueForKey(){
      Countly.getRemoteConfigValueForKey("test1");
    };
    
    


    setupPush(){
      PushNotification.configure({
          // (optional) Called when Token is generated (iOS and Android)
          onRegister: function(token) {
            // alert(JSON.stringify(token))
            var token = token;
            token.messagingMode = "0";
            Countly.sendPushToken(token)
          },
          // (required) Called when a remote or local notification is opened or received
          onNotification: function(notification) {
              alert( 'NOTIFICATION:', notification );
              // process the notification
              // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
              notification.finish(PushNotificationIOS.FetchResult.NoData);
          },
          // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
          senderID: "881000050249",
          // IOS ONLY (optional): default: all - Permissions to register.
          permissions: {
              alert: true,
              badge: true,
              sound: true
          },

          // Should the initial notification be popped automatically
          // default: true
          popInitialNotification: true,
          /**
            * (optional) default: true
            * - Specified if permissions (ios) and token (android and ios) will requested or not,
            * - if not, you must call PushNotificationsHandler.requestPermissions() later
            */
          requestPermissions: true,
      });
    }

    test(){
      this.onInit();
      this.onStart();


      this.basicEvent();
      this.eventWithSum();
      this.eventWithSegment();
      this.eventWithSumAndSegment();

      this.startEvent();
      this.endEvent();

      this.onSendUserData();
      this.userData_setProperty();
      this.userData_increment();
      this.userData_incrementBy();
      this.userData_multiply();
      this.userData_saveMax();
      this.userData_saveMin();
      this.userData_setOnce();

      // this.changeDeviceId();
      this.enableParameterTamperingProtection();
    }
    render() {

        return (
          <ScrollView>
            <Text style={[{fontSize:25, textAlign: 'center'}]}>Countly Cordova Demo App</Text>
            <Image source={{uri: 'https://try.count.ly/images/dashboard/countly_logo.svg'}} style={{width: 300, height: 88}} />
            < Button onPress = { this.test } title = "Test" color = "#1b1c1d"> </Button>
            < Button onPress = { this.onInit } title = "Init"> </Button>
            < Button onPress = { this.onStart } title = "Start" color = "#5bbd72"> </Button>
            < Button onPress = { this.onStop } title = "Stop" color = "#d95c5c"> </Button>

            <Text style={[{textAlign: 'center'}]}>Events Start</Text>

            < Button onPress = { this.basicEvent } title = "Basic Events" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSum } title = "Event with Sum" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSegment } title = "Event with Segment" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSumAndSegment } title = "Even with Sum and Segment" color = "#841584"> </Button>
            < Button onPress = { this.startEvent } title = "Timed event: Start" color = "#e0e0e0"> </Button>
            < Button onPress = { this.endEvent } title = "Timed event: Stop" color = "#e0e0e0"> </Button>



            <Text style={[{textAlign: 'center'}]}>Events End</Text>

            <Text style={[{textAlign: 'center'}]}>2017</Text>
            <Text style={[{textAlign: 'center'}]}>User Methods Start</Text>

            < Button onPress = { this.onSendUserData } title = "Send Users Data" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_setProperty } title = "UserData.setProperty" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_increment } title = "UserData.increment" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_incrementBy } title = "UserData.incrementBy" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_multiply } title = "UserData.multiply" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_saveMax } title = "UserData.saveMax" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_saveMin } title = "UserData.saveMin" color = "#00b5ad"> </Button>
            < Button onPress = { this.userData_setOnce } title = "UserData.setOnce" color = "#00b5ad"> </Button>

            <Text style={[{textAlign: 'center'}]}>User Methods End</Text>

            <Text style={[{textAlign: 'center'}]}>Other Methods Start</Text>
            < Button onPress = { function(){Countly.recordView("HomePage")} } title = "Record View: 'HomePage'" color = "#e0e0e0"> </Button>
            < Button onPress = { function(){Countly.recordView("Dashboard")} } title = "Record View: 'Dashboard'" color = "#e0e0e0"> </Button>



            < Text style={[{ textAlign: 'center' }]}>Push Notification Start</Text>
            < Button onPress={this.onRegisterDevice} title='Register Device' color='#00b5ad' />
            < Button onPress={this.onSendTestTokenAndroid} title='Test Token Android' color='#00b5ad' />
            < Button onPress={this.pushMessage} title='Push Message' color='#00b5ad' />
            < Button onPress={this.cancelMessage} title='Cancel Push Message' color='#00b5ad' />
            < Button onPress={this.changeDeviceId} title='Change Device ID' color='#00b5ad' />
            < Text style={[{ textAlign: 'center' }]}>Push Notification End</Text>


            < Button onPress = { this.enableParameterTamperingProtection } title = "Enable Parameter Tapmering Protection" color = "#00b5ad"> </Button>
            < Button onPress = { this.setRequiresConsent } title = "Init Consent" color = "#00b5ad"> </Button>
            < Button onPress = { this.giveConsent } title = "Events start Consent" color = "#00b5ad"> </Button>
            < Button onPress = { this.removeConsent } title = "Events remove Consent" color = "#00b5ad"> </Button>
            < Button onPress = { this.setupPush } title = "Setup Push" color = "#00b5ad"> </Button>


            < Button onPress = { this.remoteConfigUpdate } title = "Update Remote Config" color = "#00b5ad"> </Button>
            < Button onPress = { this.updateRemoteConfigForKeysOnly } title = "Update Remote Config with Keys Only" color = "#00b5ad"> </Button>
            < Button onPress = { this.updateRemoteConfigExceptKeys } title = "Update Remote Config Except Keys" color = "#00b5ad"> </Button>
            < Button onPress = { this.getRemoteConfigValueForKey } title = "Check Remote Config value" color = "#00b5ad"> </Button>

            <Text style={[{textAlign: 'center'}]}>Other Methods End</Text>


          </ScrollView>
        );
    }
}

module.exports = AwesomeProject;
AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);