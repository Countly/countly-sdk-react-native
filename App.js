import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, ScrollView, Image } from 'react-native';

import Countly from './Countly.js';

var PushNotification = require('react-native-push-notification');

Countly.isDebug = true;
// Countly.setHttpPostForced(true);
export default class AwesomeProject extends React.Component {

    init = function(){

      Countly.init("https://try.count.ly","111dcd50d5f4a43a23202330cec19c069a68bc19");
    };
    onStart = function(){
      Countly.start();
    };
    onStop = function(){
      Countly.stop();
    };
    onSendUserData = function(){
      Countly.setUserData({
          "name": "Nicolson Dsouza",
          "username": "nicolsondsouza",
          "email": "nicolson@trinisofttechnologies.com",
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
    };
    pushMessage = function(){
      // implementation is pending

    };
    basicEvent = function(){
      // example for basic event
      var events = {"key":"basic_event","count":1};
      Countly.recordEvent(events);
    };
    eventWithSum = function(){
      // example for event with sum
      var events = {"key":"event_sum","count":1,"sum":"0.99"};
      Countly.recordEvent(events);
    };
    eventWithSegment = function(){
      // example for event with segment
      var events = {"key":"event_segment","count":1};
      events.segmentation = {"Country" : "Turkey", "Age" : "28"};
      Countly.recordEvent(events);
    };
    eventWithSumAndSegment = function(){
      // example for event with segment and sum
      var events = {"key":"event_segment_sum","count":1,"sum":"0.99"};
      events.segmentation = {"Country" : "Turkey", "Age" : "28"};
      Countly.recordEvent(events);
    };
    allEvent = function(){

    };


    startEvent = function(){
      Countly.startEvent("timedEvent");
    };

    endEvent = function(){
      Countly.endEvent("timedEvent");
    };

    userData_setProperty = function(){
      Countly.userData.setProperty("setPropertyKey", "setPropertyKeyValue");
    };

    userData_increment = function(){
      Countly.userData.increment("incrementKey");
    };

    userData_incrementBy = function(){
      Countly.userData.incrementBy("incrementByKey", 10);
    };

    userData_multiply = function(){
      Countly.userData.multiply("multiplyKey", 20);
    };

    userData_saveMax = function(){
      Countly.userData.saveMax("saveMaxKey", 100);
    };

    userData_saveMin = function(){
      Countly.userData.saveMin("saveMinKey", 50);
    };

    userData_setOnce = function(){
      Countly.userData.setOnce("setOnceKey", 200);
    };

    changeDeviceId = function(){
      Countly.changeDeviceId("654321");
    };

    enableParameterTamperingProtection = function(){
      Countly.enableParameterTamperingProtection("salt");
    };

    onRegisterDevice = function(){

        console.log("onRegister");
        PushNotification.configure({
            onRegister: function(token) {
                Countly.onRegisterDevice(function(token){
                    console.log("token");
                    console.log(token);
                    Countly.registerPush(Countly.TEST, token);
                });
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

    onSendTestTokenAndroid = function(){
        var testToken = "coyj3YaNss4:APA91bG_9rwIQF4Ul7J2JB76J3afpcP_4TJA1hTfrSjD4lxklLLQIT82ygxLlqND9uUvFbVTosFWvM83QFGiStm_M3HQFK11yO682_5e6MEzL6qsDwWkt_IBv5PTylMhRM6cn2g0CGXs";
        Countly.registerPush(Countly.PRODUCTION, testToken);
    }

    throwNewError = function(){
        throw new Error({'Test':'Test'});
    }

  render() {
    return (
      <ScrollView>
            <Text style={[{fontSize:25, textAlign: 'center'}]}>Countly React Native Demo</Text>
            <Image source={{uri: 'https://count.ly/wp-content/uploads/2014/10/countly_logo_color.png'}} style={{width: 300, height: 88}} />
            <Button onPress = { this.init } title = "Init" color = "#5bbd72"> </Button>
            <Button onPress = { this.onStart } title = "Start" color = "#5bbd72"> </Button>
            <Button onPress = { this.onStop } title = "Stop" color = "#d95c5c"> </Button>
            <Button onPress = { this.throwNewError } title = "Throw Error" color = "#d95c5c"> </Button>

            <Text style={[{textAlign: 'center'}]}>Events Start</Text>

            <Button onPress = { this.basicEvent } title = "Basic Events" color = "#e0e0e0"> </Button>
            <Button onPress = { this.eventWithSum } title = "Event with Sum" color = "#e0e0e0"> </Button>
            <Button onPress = { this.eventWithSegment } title = "Event with Segment" color = "#e0e0e0"> </Button>
            <Button onPress = { this.eventWithSumAndSegment } title = "Even with Sum and Segment" color = "#841584"> </Button>
            <Button onPress = { this.allEvent } title = "All Event" color = "#1b1c1d"> </Button>
            <Button onPress = { this.startEvent } title = "Timed event: Start" color = "#e0e0e0"> </Button>
            <Button onPress = { this.endEvent } title = "Timed event: Stop" color = "#e0e0e0"> </Button>



            <Text style={[{textAlign: 'center'}]}>Events End</Text>

            <Text style={[{textAlign: 'center'}]}>2017</Text>
            <Text style={[{textAlign: 'center'}]}>User Methods Start</Text>

            <Button onPress = { this.onSendUserData } title = "Send Users Data" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_setProperty } title = "UserData.setProperty" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_increment } title = "UserData.increment" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_incrementBy } title = "UserData.incrementBy" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_multiply } title = "UserData.multiply" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_saveMax } title = "UserData.saveMax" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_saveMin } title = "UserData.saveMin" color = "#00b5ad"> </Button>
            <Button onPress = { this.userData_setOnce } title = "UserData.setOnce" color = "#00b5ad"> </Button>

            <Text style={[{textAlign: 'center'}]}>User Methods End</Text>

            <Text style={[{textAlign: 'center'}]}>Push Notification Start</Text>
            <Button onPress = { this.onRegisterDevice } title = "Register Device" color = "#00b5ad"> </Button>
            <Button onPress = { this.onSendTestTokenAndroid } title = "Test Token Android" color = "#00b5ad"> </Button>
            <Text style={[{textAlign: 'center'}]}>Push Notification End</Text>


            <Text style={[{textAlign: 'center'}]}>Other Methods Start</Text>
            <Button onPress = { function(){Countly.recordView("HomePage")} } title = "Record View: 'HomePage'" color = "#e0e0e0"> </Button>
            <Button onPress = { function(){Countly.recordView("Dashboard")} } title = "Record View: 'Dashboard'" color = "#e0e0e0"> </Button>

            <Button onPress = { this.pushMessage } title = "Push Message" color = "#00b5ad"> </Button>
            <Button onPress = { this.changeDeviceId } title = "Change Device ID" color = "#00b5ad"> </Button>
            <Button onPress = { this.enableParameterTamperingProtection } title = "Enable Parameter Tapmering Protection" color = "#00b5ad"> </Button>


            <Text style={[{textAlign: 'center'}]}>Other Methods End</Text>


          </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
