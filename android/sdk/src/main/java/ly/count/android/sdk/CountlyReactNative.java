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
        // if(args.size() == 2){
        //     Countly.sharedInstance()
        //         .init(_reactContext, serverUrl, appKey,null,DeviceId.Type.OPEN_UDID);
        // }else if(args.size() == 3){
        //     String yourDeviceID = args.getString(2);
        //     Countly.sharedInstance()
        //         .init(_reactContext, serverUrl, appKey,yourDeviceID,null);
        // }else{
        //     Countly.sharedInstance()
        //         .init(_reactContext, serverUrl, appKey,null,DeviceId.Type.ADVERTISING_ID);
        // }
		Countly.sharedInstance().onStart(getCurrentActivity());
	}

    @ReactMethod
    public void changeDeviceId(ReadableArray args){
        String newDeviceID = args.getString(0);
        Countly.sharedInstance().changeDeviceId(newDeviceID);  
    }
    
    @ReactMethod
    public void setHttpPostForced(ReadableArray args){
        int isEnabled = Integer.parseInt(args.getString(0));
        if(isEnabled == 1){
            Countly.sharedInstance().setHttpPostForced(true);
        }else{
            Countly.sharedInstance().setHttpPostForced(false);
        }
    }
    
    @ReactMethod
    public void enableParameterTamperingProtection(ReadableArray args){
        String salt = args.getString(0);
        Countly.sharedInstance().enableParameterTamperingProtection(salt);
    }
    
    @ReactMethod
    public void setLocation(ReadableArray args){
        double latitude = Double.parseDouble(args.getString(0));
        double longitude = Double.parseDouble(args.getString(1));
        Countly.sharedInstance().setLocation(latitude, longitude);
    }
    
    @ReactMethod
    public void enableCrashReporting(){
        Countly.sharedInstance().enableCrashReporting();
    }
    
    @ReactMethod
    public void addCrashLog(ReadableArray args){
        String record = args.getString(0);
        Countly.sharedInstance().addCrashLog(record);
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
    public void startEvent(ReadableArray args){
        String startEvent = args.getString(0);
        Countly.sharedInstance().startEvent(startEvent);
    }

    @ReactMethod
    public void endEvent(ReadableArray args){
        String eventType = args.getString(0);
        if("event".equals(eventType)){
            String eventName = args.getString(1);
            Countly.sharedInstance().endEvent(eventName);
        }
        else if ("eventWithSumSegment".equals(eventType)) {
            String eventName = args.getString(1);
            int eventCount= Integer.parseInt(args.getString(2));
            float eventSum= new Float(args.getString(3)).floatValue();
            HashMap<String, String> segmentation = new HashMap<String, String>();
            for(int i=4,il=args.size();i<il;i+=2){
                segmentation.put(args.getString(i), args.getString(i+1));
            }
            Countly.sharedInstance().endEvent(eventName, segmentation, eventCount,eventSum);
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
	public void setloggingenabled(){
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
        Countly.userData.setUserData(bundle);
        Countly.userData.save();
	}

	@ReactMethod
	 public void onregistrationid(ReadableArray args){
        String registrationId = args.getString(0);
        int messagingMode = Integer.parseInt(args.getString(1));
        String projectId = args.getString(2);
        
        Countly.CountlyMessagingMode mode = null;
        if(messagingMode == 0){
            mode = Countly.CountlyMessagingMode.TEST;
        }
        else{
            mode = Countly.CountlyMessagingMode.PRODUCTION;
        }
        Countly.sharedInstance().onRegistrationId(registrationId,mode);
	}

	@ReactMethod
	public void start(){
		Countly.sharedInstance().onStart(getCurrentActivity());
	}

	@ReactMethod
	public void stop(){
		Countly.sharedInstance().onStop();
	}

    @ReactMethod
    public void userData_setProperty(ReadableArray args){
        String keyName = args.getString(0);
        String keyValue = args.getString(1);
        Countly.userData.setProperty(keyName, keyValue);
        Countly.userData.save();
    }

    @ReactMethod
    public void userData_increment(ReadableArray args){
        String keyName = args.getString(0);
        Countly.userData.increment(keyName);
        Countly.userData.save();
    }

    @ReactMethod
    public void userData_incrementBy(ReadableArray args){
        String keyName = args.getString(0);
        int keyIncrement = Integer.parseInt(args.getString(1));
        Countly.userData.incrementBy(keyName, keyIncrement);
        Countly.userData.save();
    }

    @ReactMethod
    public void userData_multiply(ReadableArray args){
        String keyName = args.getString(0);
        int multiplyValue = Integer.parseInt(args.getString(1));
        Countly.userData.multiply(keyName, multiplyValue);
        Countly.userData.save();
    }

    @ReactMethod
    public void userData_saveMax(ReadableArray args){
        String keyName = args.getString(0);
        int maxScore = Integer.parseInt(args.getString(1));
        Countly.userData.saveMax(keyName, maxScore);
        Countly.userData.save();
    }

    @ReactMethod
    public void userData_saveMin(ReadableArray args){
        String keyName = args.getString(0);
        int minScore = Integer.parseInt(args.getString(1));
        Countly.userData.saveMin(keyName, minScore);
        Countly.userData.save();
    }


}






