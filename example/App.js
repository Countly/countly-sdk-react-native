import React, { Component } from 'react';
import { AppRegistry, Text, Button, ScrollView, Image } from 'react-native';
import Countly from 'countly-sdk-react-native';

class AwesomeProject extends Component {
    constructor(props) {
        super(props);
        this.test = this.test.bind(this);
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
    pushMessage(){
      // implementation is pending

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

    changeDeviceId(){
      Countly.changeDeviceId("123456");
    };

    enableParameterTamperingProtection(){
      Countly.enableParameterTamperingProtection("salt");
    };

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

            < Button onPress = { this.pushMessage } title = "Push Message" color = "#00b5ad"> </Button>
            < Button onPress = { this.changeDeviceId } title = "Change Device ID" color = "#00b5ad"> </Button>
            < Button onPress = { this.enableParameterTamperingProtection } title = "Enable Parameter Tapmering Protection" color = "#00b5ad"> </Button>


            <Text style={[{textAlign: 'center'}]}>Other Methods End</Text>


          </ScrollView>
        );
    }
}

module.exports = AwesomeProject;
AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);