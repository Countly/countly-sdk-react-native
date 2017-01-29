
##What's Countly?
[Countly](http://count.ly) is an innovative, real-time, open source mobile analytics and push notifications platform. It collects data from mobile devices, and visualizes this information to analyze mobile application usage and end-user behavior. There are two parts of Countly: [the server that collects and analyzes data](http://github.com/countly/countly-server), and mobile SDK that sends this data. Both parts are open source with different licensing terms.

* **Slack user?** [Join our Slack community](http://slack.count.ly:3000/)
* **Questions?** [Ask in our Community forum](http://community.count.ly)

##About this SDK

This repository includes the Countly React Native SDK. See [Countly React Native SDK](http://resources.count.ly) documentation for installation.

### Other Github resources ###

This SDK needs one of the following Countly Editions to work:

* Countly Community Edition, [downloadable from Github](https://github.com/Countly/countly-server).
* [Countly Enterprise Edition](http://count.ly/product), available for purchase.

For more information about Countly Enterprise Edition, see [comparison of different Countly Editions](https://count.ly/compare/)

There are also other Countly SDK repositories (both official and community supported) on [Countly Resources](http://resources.count.ly/v1.0/docs/downloading-sdks).

### How can I help you with your efforts?
Glad you asked. We need ideas, feedbacks and constructive comments. All your suggestions will be taken care with upmost importance. We are on [Twitter](http://twitter.com/gocountly) and [Facebook](http://www.facebook.com/Countly) if you would like to keep up with our fast progress!

If you liked Countly (just like we do!), [why not use one of our badges](https://count.ly/brand-assets/) and give a link back to us, so others know about this wonderful platform?

![Light badge](https://count.ly/wp-content/uploads/2014/10/countly_badge_5.png)  ![Dark badge](https://count.ly/wp-content/uploads/2014/10/countly_badge_6.png)

### Support

Have any questions? Visit [http://community.count.ly](http://community.count.ly "Countly Community Forum").

# Getting Started
=================

```cmd
react-native init AwesomeProject
cd AwesomeProject
adb reverse tcp:8081 tcp:8081
react-native run-android
npm start
```

# Plugin Installation Guide
===========================

```cmd
npm install https://github.com/Countly/countly-sdk-react-native.git

# go to android/settings.gradle
# and add these 2 lines

include ':countly-sdk-react-native'
project(':countly-sdk-react-native').projectDir = new File(rootProject.projectDir,   './node_modules/countly-sdk-react-native/android/sdk')

# Add this line in android/app/build.gradle inside dependencies {}
compile project(':countly-sdk-react-native')

# go to android/src/main/java/com/{{projectname}}/MainApplication.java
# import this below line
import ly.count.android.sdk.CountlyReactNativePackage;

# and add this line below new MainReactPackage(),
new CountlyReactNativePackage()

# So it should look like this in the end
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new CountlyReactNativePackage()
    );
}
```
