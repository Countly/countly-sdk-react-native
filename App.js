import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import { Text, Button, ScrollView, Image } from 'react-native'; // eslint-disable-line import/no-extraneous-dependencies
import PushNotification from 'react-native-push-notification'; // eslint-disable-line import/no-extraneous-dependencies
import Countly from './Countly';

Countly.isDebug = true;
// Countly.setHttpPostForced(true);
export default class AwesomeProject extends React.Component {
  init = async () => {
    try {
      await Countly.begin('https://try.count.ly', '111dcd50d5f4a43a23202330cec19c069a68bc19');
    } catch (err) {
      console.log('error', err);
    }
  }

  onStart = async () => {
    try {
      await Countly.start();
    } catch (err) {
      console.log('error', err);
    }
  }

  onStop = async () => {
    try {
      await Countly.stop();
    } catch (err) {
      console.log('error', err);
    }
  }

  onSendUserData = () => {
    Countly.setUserData({
      name: 'Nicolson Dsouza',
      username: 'nicolsondsouza',
      email: 'nicolson@trinisofttechnologies.com',
      organization: 'Trinisoft Technologies',
      phone: '+17278287040',
      // Web URL to picture
      picture: 'https://avatars1.githubusercontent.com/u/10754117?v=4&s=460',
      gender: 'M',
      byear: 1989, // birth year
      custom: {
        key1: 'value1',
        key2: 'value2',
      },
    });
  }

  pushMessage = () => {
    // implementation is pending
  }

  basicEvent = () => {
    // example for basic event
    const events = { key: 'basic_event', count: 1 };
    Countly.recordEvent(events);
  }

  eventWithSum = () => {
    // example for event with sum
    const events = { key: 'event_sum', count: 1, sum: '0.99' };
    Countly.recordEvent(events);
  }

  eventWithSegment = () => {
    // example for event with segment
    const events = { key: 'event_segment', count: 1 };
    events.segmentation = { Country: 'Turkey', Age: '28' };
    Countly.recordEvent(events);
  }

  eventWithSumAndSegment = () => {
    // example for event with segment and sum
    const events = { key: 'event_segment_sum', count: 1, sum: '0.99' };
    events.segmentation = { Country: 'Turkey', Age: '28' };
    Countly.recordEvent(events);
  }

  allEvent = () => {
  }

  startEvent = () => {
    Countly.startEvent({ key: 'timedEvent', count: 1 });
  }

  endEvent = () => {
    Countly.endEvent({ key: 'timedEvent', count: 1 });
  }

  userDataSetProperty = () => {
    Countly.userData.setProperty('setPropertyKey', 'setPropertyKeyValue');
  }

  userDataIncrement = () => {
    Countly.userData.increment('incrementKey');
  }

  userDataIncrementBy = () => {
    Countly.userData.incrementBy('incrementByKey', 10);
  }

  userDataMultiply = () => {
    Countly.userData.multiply('multiplyKey', 20);
  }

  userDataSaveMax = () => {
    Countly.userData.saveMax('saveMaxKey', 100);
  }

  userDataSaveMin = () => {
    Countly.userData.saveMin('saveMinKey', 50);
  }

  userDataSetOnce = () => {
    Countly.userData.setOnce('setOnceKey', 200);
  }

  changeDeviceId = () => {
    Countly.changeDeviceId('654321');
  }

  enableParameterTamperingProtection = () => {
    Countly.enableParameterTamperingProtection('salt');
  }

  onRegisterDevice = () => {
    console.log('onRegister');
    PushNotification.configure({
      onRegister: (token) => {
        console.log('token');
        console.log(token.token);
        console.log(Countly.TEST);
        Countly.registerPush(Countly.TEST, token.token);
      },
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
      },
      senderID: '881000050249',
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  onSendTestTokenAndroid = () => {
    const testToken = 'coyj3YaNss4:APA91bG_9rwIQF4Ul7J2JB76J3afpcP_4TJA1hTfrSjD4lxklLLQIT82ygxLlqND9uUvFbVTosFWvM83QFGiStm_M3HQFK11yO682_5e6MEzL6qsDwWkt_IBv5PTylMhRM6cn2g0CGXs';
    Countly.registerPush(Countly.TEST, testToken);
  }

  throwNewError = () => {
    throw new Error({ Test: 'Test' });
  }

  render() {
    return (
      <ScrollView>
        <Text style={[{ fontSize: 25, textAlign: 'center' }]}>Countly React Native Demo</Text>
        <Image source={{ uri: 'https://count.ly/wp-content/uploads/2014/10/countly_logo_color.png' }} style={{ width: 300, height: 88 }} />
        <Button onPress={this.init} title='Init' color='#841584' />
        <Button onPress={this.onStart} title='Start' color='#5bbd72' />
        <Button onPress={this.onStop} title='Stop' color='#d95c5c' />
        <Button onPress={this.throwNewError} title='Throw Error' color='#d95c5c' />

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

        <Text style={[{ textAlign: 'center' }]}>Push Notification Start</Text>
        <Button onPress={this.onRegisterDevice} title='Register Device' color='#00b5ad' />
        <Button onPress={this.onSendTestTokenAndroid} title='Test Token Android' color='#00b5ad' />
        <Text style={[{ textAlign: 'center' }]}>Push Notification End</Text>


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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
