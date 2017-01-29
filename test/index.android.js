import React, { Component } from 'react';
import { AppRegistry, Text, Button, View, Image } from 'react-native';
import Countly from './Countly';

Countly.init("https://try.count.ly","21b377226a4260dcbf42e88db5a7d0f2d904c928");
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
      options.gender = "Male";
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
    render() {
        return (
          <View>
            <Text style={[{fontSize:25, textAlign: 'center'}]}>Countly Cordova Demo App</Text>
            <Image source={{uri: 'https://count.ly/wp-content/uploads/2014/10/countly_logo_color.png'}} style={{width: 300, height: 88}} />
            < Button onPress = { this.onStart } title = "Start" color = "#5bbd72"> </Button>
            < Button onPress = { this.onStop } title = "Stop" color = "#d95c5c"> </Button>
            < Button onPress = { this.onSendUserData } title = "Send Users Data" color = "#00b5ad"> </Button>
            < Button onPress = { this.pushMessage } title = "Push Message" color = "#00b5ad"> </Button>
            < Button onPress = { this.basicEvent } title = "Basic Events" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSum } title = "Event with Sum" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSegment } title = "Event with Segment" color = "#e0e0e0"> </Button>
            < Button onPress = { this.eventWithSumAndSegment } title = "Even with Sum and Segment" color = "#841584"> </Button>
            < Button onPress = { this.allEvent } title = "All Event" color = "#1b1c1d"> </Button>
            < Button onPress = { function(){Countly.recordView("HomePage")} } title = "Record View: 'HomePage'" color = "#e0e0e0"> </Button>
            < Button onPress = { function(){Countly.recordView("Dashboard")} } title = "Record View: 'Dashboard'" color = "#e0e0e0"> </Button>
          </View>
        );
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);