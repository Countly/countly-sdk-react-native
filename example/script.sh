SDK=/Users/trinisoft/office/countly/app/take6/AwesomeProject/sdk/countly-sdk-react-native

cp ./Countly.js $SDK/Countly.js
cp ./example/App.js $SDK/../App.js

cp ./android/sdk/src/main/java/ly/count/android/sdk/CountlyReactNative.java $SDK/android/sdk/src/main/java/ly/count/android/sdk/CountlyReactNative.java
cp ./android/sdk/src/main/java/ly/count/android/sdk/CountlyReactNativePackage.java $SDK/android/sdk/src/main/java/ly/count/android/sdk/CountlyReactNativePackage.java

cp ./ios/CountlyReactNative.h $SDK/ios/CountlyReactNative.h
cp ./ios/CountlyReactNative.m $SDK/ios/CountlyReactNative.m