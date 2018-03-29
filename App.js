import React, { Component } from 'react';
import { Text, Button, ScrollView, Image, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import NotificationActions from 'react-native-ios-notification-actions';
import DeviceInfo from 'react-native-device-info';
import Countly, { StarRating } from './Countly';
Countly.enableCrashReporting(true, true);


export default class App extends Component {
  constructor(props) {
    console.log(Countly);
    super(props);
    this.state = {
      isVisible: false,
    };
    if (Platform.OS.match('ios')) {
      let upvoteButton = new NotificationActions.Action({
        activationMode: 'background',
        title: 'Upvote',
        identifier: 'UPVOTE_ACTION'
      }, (res, done) => {
        console.log('upvote button pressed with result: ', res);
        res => console.log(res);
        done(); //important!
      });
      
      // Create a "comment" button that will display a text input when the button is pressed
      let commentTextButton = new NotificationActions.Action({
        activationMode: 'background',
        title: 'Reply',
        behavior: 'textInput',
        identifier: 'REPLY_ACTION'
      }, (res, done) => {
        console.log('reply typed via notification from source: ', res.source, ' with text: ', res.text);
        res => console.log(res);
        done(); //important!
      });
      
      // Create a category containing our two actions
      let myCategory = new NotificationActions.Category({
        identifier: 'something_happened',
        actions: [upvoteButton, commentTextButton],
        forContext: 'default'
      });
      
      // ** important ** update the categories
      NotificationActions.updateCategories([myCategory]);
      //iOS setup for push Actions end
    }
  }

  componentDidMount() {
    Countly.isDebug = true;
    Countly.initMessaging('GCM_ID', Countly.TEST);
    Countly.deepLinkHandler = {
      handler1: result => console.log('handler1: ', result),
      handler2: result => console.log('handler2: ', result),
    };
    // return battery level
    DeviceInfo.getBatteryLevel().then(batteryLevel => {
      // 0.759999
      console.log('Battery level: ', batteryLevel);
    });
  }

  init = async () => {
    try {
      const data = await Countly.begin('https://try.count.ly', '111dcd50d5f4a43a23202330cec19c069a68bc19');
      console.log(data);
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

  onRegisterDevice = () => {
    // Countly.initMessaging('403185924621', Countly.TEST);
  }

  onSendTestTokenAndroid = () => {
    const testToken = 'coyj3YaNss4:APA91bG_9rwIQF4Ul7J2JB76J3afpcP_4TJA1hTfrSjD4lxklLLQIT82ygxLlqND9uUvFbVTosFWvM83QFGiStm_M3HQFK11yO682_5e6MEzL6qsDwWkt_IBv5PTylMhRM6cn2g0CGXs';
    Countly.registerPush(Countly.TEST, testToken);
  }

  onSendUserData = () => {
    const options = {};
    options.name = 'Successive Software';
    options.username = 'NodeXperts';
    options.email = '';
    options.org = 'Successive Software';
    options.phone = '+91 812 840 2946';
    options.picture = 'https://contractiq.com/uploads/vendor/vendor_logo/7654/successive-softwares-squarelogo-1448007450496.png';
    options.picturePath = '';
    options.gender = 'M';
    options.byear = 1989;
    Countly.setUserData(options);
  }
  pushMessage = () => {
    PushNotification.localNotification({
      /* Android Only Properties */
      id: '0',

      /* iOS and Android properties */
      title: 'My Notification Title', // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
      message: 'My Notification Message1', // (required)
      actions: '["Yes", "No"]', // (Android only) See the doc for notification actions to know more
    });
  }

  basicEvent = () => {
    // example for basic event
    const events = { eventName: 'basic_event', eventCount: 1 };
    Countly.recordEvent(events);
  }

  eventWithSum = () => {
    // example for event with sum
    const events = { eventName: 'event_sum', eventCount: 1, eventSum: '0.99' };
    Countly.recordEvent(events);
  }

  eventWithSegment = () => {
    // example for event with segment
    const events = { eventName: 'event_segment', eventCount: 1 };
    events.segments = { Country: 'Turkey', Age: '28' };
    Countly.recordEvent(events);
  }

  eventWithSumAndSegment = () => {
    // example for event with segment and sum
    const events = { eventName: 'event_segment_sum', eventCount: 1, eventSum: '0.99' };
    events.segments = { Country: 'Turkey', Age: '28' };
    Countly.recordEvent(events);
  }

  allEvent = () => {}

  startEvent = () => {
    Countly.startEvent('timedEvent');
  }

  endEvent = () => {
    Countly.endEvent('timedEvent');
  }

  userDatasetProperty = () => {
    Countly.userData.setProperty('testArray', [10]);
  }

  userDataIncrement = () => {
    Countly.userData.increment('testValue');
  }

  userDataIncrementBy = () => {
    Countly.userData.incrementBy('testValue', 10);
  }

  userDataMultiply = () => {
    Countly.userData.multiply('testValue', 20);
  }

  userDataSaveMax = () => {
    Countly.userData.saveMax('testValue', 100);
  }

  userDataSaveMin = () => {
    Countly.userData.saveMin('testValue', 50);
  }

  userDataSetOnce = () => {
    Countly.userData.setOnce('testValue', 200);
  }

  userDataPushValue = () => {
    Countly.userData.pushValue('testArray', 11);
  }

  userDataPullValue = () => {
    Countly.userData.pullValue('testArray', 11);
  }

  userDataAddToSet = () => {
    Countly.userData.addToSetValue('testArray', 11);
  }

  changeDeviceId = () => {
    Countly.changeDeviceId('02d56d66-6a39-482d-aff0-d14e4d5e5fda');
  }

  enableParameterTamperingProtection = () => {
    Countly.enableParameterTamperingProtection('salt');
  }

  cancelMessage = () => {
    PushNotification.cancelAllLocalNotifications();
  }

  recordView = () => {
    Countly.recordView('HomeScreen');
  }

  recordViewAction = () => {
    Countly.recordViewActions('Touch', { x: 25, y: 26 });
  }

  recordViewExit = () => {
    Countly.recordView(null);
  }

  hideStar = () => {
    this.setState({ isVisible: false });
  }

  render() {
    return (
      <ScrollView>
        <Text style={[{ fontSize: 25, textAlign: 'center' }]}>Countly React Native Demo App</Text>
        <Image source={{ uri: 'https://count.ly/badges/dark.svg' }} style={{ width: 300, height: 88 }} />
        <Button onPress={this.init} title='Init' color='#841584' />
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

        <Text style={[{ textAlign: 'center' }]}>2018</Text>
        <Text style={[{ textAlign: 'center' }]}>User Methods Start</Text>

        <Button onPress={this.onSendUserData} title='Send Users Data' color='#00b5ad' />
        <Button onPress={this.userDatasetProperty} title='UserData.setProperty' color='#00b5ad' />
        <Button onPress={this.userDataIncrement} title='UserData.increment' color='#00b5ad' />
        <Button onPress={this.userDataIncrementBy} title='UserData.incrementBy' color='#00b5ad' />
        <Button onPress={this.userDataMultiply} title='UserData.multiply' color='#00b5ad' />
        <Button onPress={this.userDataSaveMax} title='UserData.saveMax' color='#00b5ad' />
        <Button onPress={this.userDataSaveMin} title='UserData.saveMin' color='#00b5ad' />
        <Button onPress={this.userDataSetOnce} title='UserData.setOnce' color='#00b5ad' />
        <Button onPress={this.userDataPushValue} title='UserData.pushValue' color='#00b5ad' />
        <Button onPress={this.userDataPullValue} title='UserData.pullValue' color='#00b5ad' />
        <Button onPress={this.userDataAddToSet} title='UserData.addToSet' color='#00b5ad' />

        <Text style={[{ textAlign: 'center' }]}>User Methods End</Text>

        <Text style={[{ textAlign: 'center' }]}>Push Notification Start</Text>
        <Button onPress={this.onRegisterDevice} title='Register Device' color='#00b5ad' />
        <Button onPress={this.onSendTestTokenAndroid} title='Test Token Android' color='#00b5ad' />
        <Text style={[{ textAlign: 'center' }]}>Push Notification End</Text>

        <Text style={[{ textAlign: 'center' }]}>Other Methods Start</Text>
        <Button onPress={() => { Countly.recordView('HomePage'); }} title="Record View: 'HomePage'" color='#e0e0e0' />
        <Button onPress={() => { Countly.recordView('Dashboard'); }} title="Record View: 'Dashboard'" color='#e0e0e0' />

        <Button onPress={this.pushMessage} title='Push Message' color='#00b5ad' />
        <Button onPress={this.cancelMessage} title='Cancel Push Message' color='#00b5ad' />
        <Button onPress={this.changeDeviceId} title='Change Device ID' color='#00b5ad' />
        <Button onPress={this.enableParameterTamperingProtection} title='Enable Parameter Tapmering Protection' color='#00b5ad' />

        <Text style={[{ textAlign: 'center' }]}>Other Methods End</Text>

        <Text style={[{ textAlign: 'center' }]}>Screen Tracking Methods Start</Text>
        <Button onPress={this.recordView} title='Record View' color='#00b5ad' />
        <Button onPress={this.recordViewAction} title='Record View Actions' color='#00b5ad' />
        <Button onPress={this.recordViewExit} title='Record View exit' color='#00b5ad' />
        <Text style={[{ textAlign: 'center' }]}>Screen Tracking Methods End</Text>

        <Text style={[{ textAlign: 'center' }]}>Star Rating Start</Text>
        <Button onPress={() => this.setState({ isVisible: true })} title='View Modal' color='#00b5ad' />
        <Text style={[{ textAlign: 'center' }]}>Star Rating End</Text>
        <StarRating
          isVisible={this.state.isVisible}
          hideStar={() => this.setState({ isVisible: false })}
        />

      </ScrollView>
    );
  }
}
