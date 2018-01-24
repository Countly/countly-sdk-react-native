import React, { Component } from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { AppRegistry, Text, Button, ScrollView, Image } from 'react-native'; // eslint-disable-line import/no-extraneous-dependencies
import Countly from './Countly';

Countly.init('https://try.count.ly', '111dcd50d5f4a43a23202330cec19c069a68bc19');
class AwesomeProject extends Component {
  // constructor(props) {
  //   super(props);
  // }

  onStart = () => {
    Countly.start();
  }

  onStop = () => {
    Countly.stop();
  }

  onSendUserData = () => {
    // example for setUserData
    const options = {};
    options.name = 'Trinisoft Technologies';
    options.username = 'trinisofttechnologies';
    options.email = 'trinisofttechnologies@gmail.com';
    options.org = 'Trinisoft Technologies Pvt. Ltd.';
    options.phone = '+91 812 840 2946';
    options.picture = 'http://www.trinisofttechnologies.com/images/logo.png';
    options.picturePath = '';
    options.gender = 'M';
    options.byear = 1989;
    Countly.setUserData(options);
  }

  pushMessage = () => {
    // implementation is pending
  }

  basicEvent = () => {
    // example for basic event
    const events = { eventName: 'basic_event', eventCount: 1 };
    Countly.sendEvent(events);
  }

  eventWithSum = () => {
    // example for event with sum
    const events = { eventName: 'event_sum', eventCount: 1, eventSum: '0.99' };
    Countly.sendEvent(events);
  }

  eventWithSegment = () => {
    // example for event with segment
    const events = { eventName: 'event_segment', eventCount: 1 };
    events.segments = { Country: 'Turkey', Age: '28' };
    Countly.sendEvent(events);
  }

  eventWithSumAndSegment = () => {
    // example for event with segment and sum
    const events = { eventName: 'event_segment_sum', eventCount: 1, eventSum: '0.99' };
    events.segments = { Country: 'Turkey', Age: '28' };
    Countly.sendEvent(events);
  }

  allEvent = () => {}


  startEvent = () => {
    Countly.startEvent('timedEvent');
  }

  endEvent = () => {
    Countly.endEvent('timedEvent');
  }

  userDataSetProperty = () => {
    Countly.userData.setProperty('keyName', 'keyValue');
  }

  userDataIncrement = () => {
    Countly.userData.increment('keyName');
  }

  userDataIncrementBy = () => {
    Countly.userData.incrementBy('keyName', 10);
  }

  userDataMultiply = () => {
    Countly.userData.multiply('keyName', 20);
  }

  userDataSaveMax = () => {
    Countly.userData.saveMax('keyName', 100);
  }

  userDataSaveMin = () => {
    Countly.userData.saveMin('keyName', 50);
  }

  userDataSetOnce = () => {
    Countly.userData.setOnce('keyName', 200);
  }

  changeDeviceId = () => {
    Countly.changeDeviceId('123456');
  }

  enableParameterTamperingProtection = () => {
    Countly.enableParameterTamperingProtection('salt');
  }

  render() {
    return (
      <ScrollView>
        <Text style={[{ fontSize: 25, textAlign: 'center' }]}>Countly Cordova Demo App</Text>
        <Image source={{ uri: 'https://count.ly/wp-content/uploads/2014/10/countly_logo_color.png' }} style={{width: 300, height: 88}} />
        <Button onPress={this.onStart} title='Start' color='#5bbd72' />
        <Button onPress={this.onStop} title='Stop' color='#d95c5c' />

        <Text style={[{ textAlign: 'center' }]}>Events Start</Text>

        <Button onPress={this.basicEvent} title='Basic Events' color='#e0e0e0' />
        <Button onPress={this.eventWithSum} title='Event with Sum' color='#e0e0e0' />
        <Button onPress={this.eventWithSegment} title='Event with Segment' color='#e0e0e0' />
        <Button onPress={this.eventWithSumAndSegment} title='Even with Sum and Segment' color='#841584' />
        <Button onPress={this.allEvent} title='All Event' color='#1b1c1d' />
        <Button onPress={this.startEvent} title='Timed event: Start' color='#e0e0e0' />
        <Button onPress={this.endEvent} title='Timed event: Stop' color='#e0e0e0' />

        <Text style={[{ textAlign: 'center' }]}>Events End</Text>

        <Text style={[{ textAlign: 'center' }]}>2017</Text>
        <Text style={[{ textAlign: 'center' }]}>User Methods Start</Text>

        <Button onPress={this.onSendUserData} title='Send Users Data' color='#00b5ad' />
        <Button onPress={this.userDataSetProperty} title='UserData.setProperty' color='#00b5ad' />
        <Button onPress={this.userDataIncrement} title='UserData.increment' color='#00b5ad' />
        <Button onPress={this.userDataIncrementBy} title='UserData.incrementBy' color='#00b5ad' />
        <Button onPress={this.userDataMultiply} title='UserData.multiply' color='#00b5ad' />
        <Button onPress={this.userDataSaveMax} title='UserData.saveMax' color='#00b5ad' />
        <Button onPress={this.userDataSaveMin} title='UserData.saveMin' color='#00b5ad' />
        <Button onPress={this.userDataSetOnce} title='UserData.setOnce' color='#00b5ad' />

        <Text style={[{ textAlign: 'center' }]}>User Methods End</Text>

        <Text style={[{ textAlign: 'center' }]}>Other Methods Start</Text>
        <Button onPress={() => { Countly.recordView('HomePage'); }} title='Record View: "HomePage"' color='#e0e0e0' />
        <Button onPress={() => { Countly.recordView('Dashboard'); }} title='Record View: "Dashboard"' color='#e0e0e0' />
        <Button onPress={this.pushMessage} title='Push Message' color='#00b5ad' />
        <Button onPress={this.changeDeviceId} title='Change Device ID' color='#00b5ad' />
        <Button onPress={this.enableParameterTamperingProtection} title='Enable Parameter Tapmering Protection' color='#00b5ad' />


        <Text style={[{ textAlign: 'center' }]}>Other Methods End</Text>

      </ScrollView>
    );
  }
}


AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
