package ly.count.android.sdk;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.hardware.Camera;
import android.util.Base64;
import android.widget.Toast;
import android.util.Log;

import android.os.Environment;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import android.provider.MediaStore.Images.Media;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import java.util.HashMap;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import android.widget.Toast;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import ly.count.android.sdk.Countly;

public class CountlyReactNative extends ReactContextBaseJavaModule {
	private ReactApplicationContext _reactContext;

    public CountlyReactNative(ReactApplicationContext reactContext) {
        super(reactContext);
        _reactContext = reactContext;
    }
    @Override
    public String getName() {
        return "CountlyReactNative";
    }

    @Override
	public Map<String, Object> getConstants() {
		final Map<String, Object> constants = new HashMap<>();
		constants.put("Example", "Data");
		return constants;
	}

	@ReactMethod
	public void init(ReadableArray args){
		String serverUrl = args.getString(0);
        String appKey = args.getString(1);
		Countly.sharedInstance().init(_reactContext, serverUrl, appKey);
		Countly.sharedInstance().onStart(getCurrentActivity());
	}


	 @ReactMethod
	 public void event(ReadableArray args){
         String eventType = args.getString(0);
         if("event".equals(eventType)){
             String eventName = args.getString(1);
             int eventCount= Integer.parseInt(args.getString(2));
             Countly.sharedInstance().recordEvent(eventName, eventCount);
         }
         else if ("eventWithSum".equals(eventType)) {
             String eventName = args.getString(1);
             int eventCount= Integer.parseInt(args.getString(2));
             float eventSum= new Float(args.getString(3)).floatValue();
             Countly.sharedInstance().recordEvent(eventName, eventCount, eventSum);
         }
         else if ("eventWithSegment".equals(eventType)) {
             String eventName = args.getString(1);
             int eventCount= Integer.parseInt(args.getString(2));
             HashMap<String, String> segmentation = new HashMap<String, String>();
             for(int i=3,il=args.size();i<il;i+=2){
                 segmentation.put(args.getString(i), args.getString(i+1));
             }
             Countly.sharedInstance().recordEvent(eventName, segmentation, eventCount);
         }
         else if ("eventWithSumSegment".equals(eventType)) {
             String eventName = args.getString(1);
             int eventCount= Integer.parseInt(args.getString(2));
             float eventSum= new Float(args.getString(3)).floatValue();
             HashMap<String, String> segmentation = new HashMap<String, String>();
             for(int i=4,il=args.size();i<il;i+=2){
                 segmentation.put(args.getString(i), args.getString(i+1));
             }
             Countly.sharedInstance().recordEvent(eventName, segmentation, eventCount,eventSum);
         }
         else{
         }
	 }

	 @ReactMethod
	 public void recordView(ReadableArray args){
         String viewName = args.getString(0);
	 	Countly.sharedInstance().recordView(viewName);
	 }

	 @ReactMethod
	 public void setloggingenabled(ReadableArray args){
	 	Countly.sharedInstance().setLoggingEnabled(true);
	 }

	 @ReactMethod
	 public void setuserdata(ReadableArray args){
         Map<String, String> bundle = new HashMap<String, String>();

         bundle .put("name", args.getString(0));
         bundle.put("username", args.getString(1));
         bundle.put("email", args.getString(2));
         bundle.put("org", args.getString(3));
         bundle.put("phone", args.getString(4));
         bundle.put("picture", args.getString(5));
         bundle.put("picturePath", args.getString(6));
         bundle.put("gender", args.getString(7));
         bundle.put("byear", String.valueOf(args.getInt(8)));
         Countly.sharedInstance().setUserData(bundle);
	 }

	 @ReactMethod
	 public void onregistrationid(ReadableArray args){
         int messagingMode = Integer.parseInt(args.getString(1));
         Countly.CountlyMessagingMode mode = null;
         if(messagingMode == 0){
             mode = Countly.CountlyMessagingMode.TEST;
         }
         else{
             mode = Countly.CountlyMessagingMode.PRODUCTION;
         }
         String projectId = args.getString(2);
         // Countly.sharedInstance().onRegistrationId(registrationId,mode);
         Countly.sharedInstance().initMessaging(getCurrentActivity(), getCurrentActivity().getClass(), projectId, mode);
	 }

	 @ReactMethod
	 public void start(){
	 	Countly.sharedInstance().onStart(getCurrentActivity());
	 }

	 @ReactMethod
	 public void stop(){
	 	Countly.sharedInstance().onStop();
	 }
}
