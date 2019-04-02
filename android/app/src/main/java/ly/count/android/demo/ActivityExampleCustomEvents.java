package ly.count.android.demo;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import ly.count.android.sdk.Countly;

@SuppressWarnings("UnusedParameters")
public class ActivityExampleCustomEvents extends Activity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_example_custom_events);
        Countly.onCreate(this);

    }

    public void onClickRecordEvent01(View v) {
        Countly.sharedInstance().recordEvent("Custom event 1");
    }

    public void onClickRecordEvent02(View v) {
        Countly.sharedInstance().recordEvent("Custom event 2", 3);
    }

    public void onClickRecordEvent03(View v) {
        Countly.sharedInstance().recordEvent("Custom event 3", 1, 134);
    }

    public void onClickRecordEvent04(View v) {
        Countly.sharedInstance().recordEvent("Custom event 4", null, 1, 0, 55);
    }

    public void onClickRecordEvent05(View v) {
        Map<String, String> segmentation = new HashMap<>();
        segmentation.put("wall", "green");
        Countly.sharedInstance().recordEvent("Custom event 5", segmentation, 1, 0, 0);
    }

    public void onClickRecordEvent06(View v) {
        Map<String, String> segmentation = new HashMap<>();
        segmentation.put("wall", "red");
        Map<String, Integer> segmentationInt = new HashMap<>();
        segmentationInt.put("flowers", 3);
        Map<String, Double> segmentationDouble = new HashMap<>();
        segmentationDouble.put("area", 1.23);
        segmentationDouble.put("volume", 7.88);
        Countly.sharedInstance().recordEvent("Custom event 6", segmentation, segmentationInt, segmentationDouble, 15, 0, 0);
    }

    public void onClickRecordEvent07(View v) {
        Map<String, String> segmentation = new HashMap<>();
        segmentation.put("wall", "blue");
        Map<String, Integer> segmentationInt = new HashMap<>();
        segmentationInt.put("flowers", new Random().nextInt());
        Map<String, Double> segmentationDouble = new HashMap<>();
        segmentationDouble.put("area", new Random().nextDouble());
        segmentationDouble.put("volume", new Random().nextDouble());

        Countly.sharedInstance().recordEvent("Custom event 7", segmentation, segmentationInt, segmentationDouble,25, 10, 0);
    }

    public void onClickRecordEvent08(View v) {
        Map<String, String> segmentation = new HashMap<>();
        segmentation.put("wall", "yellow");
        Countly.sharedInstance().recordEvent("Custom event 8", segmentation, 25, 10, 50);
    }

    public void onClickRecordEvent09(View v) {
        Countly.sharedInstance().startEvent("Custom event 9");
    }

    public void onClickRecordEvent10(View v) {
        Countly.sharedInstance().endEvent("Custom event 9");
    }

    public void onClickRecordEvent11(View v) {
        Map<String, String> segmentation = new HashMap<>();
        segmentation.put("wall", "orange");
        Countly.sharedInstance().endEvent("Custom event 9", segmentation, 4, 34);
    }

    @Override
    public void onStart()
    {
        super.onStart();
        Countly.sharedInstance().onStart(this);
    }

    @Override
    public void onStop()
    {
        Countly.sharedInstance().onStop();
        super.onStop();
    }
}
