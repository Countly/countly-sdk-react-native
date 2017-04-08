import React, { Component } from 'react';
import { AppRegistry, Text, Button, ScrollView, Image } from 'react-native';
import Countly from './Countly';

Countly.init("https://try.count.ly","111dcd50d5f4a43a23202330cec19c069a68bc19");
class AwesomeProject extends Component {
    constructor(props) {
        super(props);
    };    

    onStart = function(){
      Countly.start();
    };
    onStop = function(){
      Countly.stop();
    };
    onSendUserData = function(){
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
    pushMessage = function(){
      // implementation is pending

    };
    basicEvent = function(){
      // example for basic event
      var events = {"eventName":"basic_event","eventCount":1};
      Countly.sendEvent(events);
    };
    eventWithSum = function(){
      // example for event with sum
      var events = {"eventName":"event_sum","eventCount":1,"eventSum":"0.99"};
      Countly.sendEvent(events);
    };
    eventWithSegment = function(){      
      // example for event with segment
      var events = {"eventName":"event_segment","eventCount":1};
      events.segments = {"Country" : "Turkey", "Age" : "28"};
      Countly.sendEvent(events);
    };
    eventWithSumAndSegment = function(){
      // example for event with segment and sum
      var events = {"eventName":"event_segment_sum","eventCount":1,"eventSum":"0.99"};
      events.segments = {"Country" : "Turkey", "Age" : "28"};
      Countly.sendEvent(events);
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
      Countly.userData.setProperty("keyName", "keyValue");
    };

    userData_increment = function(){
      Countly.userData.increment("keyName");
    };

    userData_incrementBy = function(){
      Countly.userData.incrementBy("keyName", 10);
    };

    userData_multiply = function(){
      Countly.userData.multiply("keyName", 20);
    };

    userData_saveMax = function(){
      Countly.userData.saveMax("keyName", 100);
    };

    userData_saveMin = function(){
      Countly.userData.saveMin("keyName", 50);
    };

    userData_setOnce = function(){
      Countly.userData.setOnce("keyName", 200);
    };

    changeDeviceId = function(){
      Countly.changeDeviceId("123456");
    };

    enableParameterTamperingProtection = function(){
      Countly.enableParameterTamperingProtection("salt");
    };

    render() {
        return (
          <ScrollView>
            <Text style={[{fontSize:25, textAlign: 'center'}]}>Countly Cordova Demo App</Text>
            <Image source={{uri: 'https://count.ly/wp-content/uploads/2014/10/countly_logo_color.png'}} style={{width: 300, height: 88}} />
            < Button onPress = { this.onStart } title = "Start" color = "#5bbd72"> </Button>
            < Button onPress = { this.onStop } title = "Stop" color = "#d95c5c"> </Button>
            
            <Text style={[{textAlign: 'center'}]}>Events Start</Text>
            
            < Button onPress = { this.basicEvent } title = "Basic Events" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSum } title = "Event with Sum" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSegment } title = "Event with Segment" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSumAndSegment } title = "Even with Sum and Segment" color = "#841584"> </Button>
            < Button onPress = { this.allEvent } title = "All Event" color = "#1b1c1d"> </Button>
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

            < Button onPress = { this.pushMessage } title = "Push Message" color = "#00b5ad"> </Button>
            < Button onPress = { this.changeDeviceId } title = "Change Device ID" color = "#00b5ad"> </Button>
            < Button onPress = { this.enableParameterTamperingProtection } title = "Enable Parameter Tapmering Protection" color = "#00b5ad"> </Button>


            <Text style={[{textAlign: 'center'}]}>Other Methods End</Text>

            
          </ScrollView>
        );
    }
}


AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);