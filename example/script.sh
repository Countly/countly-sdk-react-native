SDK=/Users/trinisoft/office/react/Countly/AwesomeProject

cp ./Countly.js $SDK/Countly.js
cp ./example/App.js $SDK/App.js

cp ./android/src/main/java/ly/count/android/sdk/CountlyReactNative.java $SDK/node_modules/countly-sdk-react-native/android/src/main/java/ly/count/android/sdk/CountlyReactNative.java
cp ./android/src/main/java/ly/count/android/sdk/CountlyReactNativePackage.java $SDK/node_modules/countly-sdk-react-native/android/src/main/java/ly/count/android/sdk/CountlyReactNativePackage.java

# cp ./ios/CountlyReactNative.h $SDK/ios/CountlyReactNative.h
# cp ./ios/CountlyReactNative.m $SDK/ios/CountlyReactNative.m


echo 'done'