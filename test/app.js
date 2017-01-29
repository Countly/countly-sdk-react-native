import Countly from 'countly-sdk-react-native';

export default class App{

    test = function(){
        onRegistrationId();
        sendSampleEvent();
    }
    event = function(){
        setInterval(function(){
            sendSampleEvent();
        },1000);
    }
    start = function(){
        Countly.start();
    }
    stop = function(){
        Countly.stop();
    }

    sendSampleEvent = function(){
        basicEvent();
        eventWithSum();
        eventWithSegment();
        eventWithSum_Segment();
    }
    basicEvent = function(){
        // example for basic event
        var events = {"eventName":"basic_event","eventCount":1};
        Countly.sendEvent(events);
    }
    eventWithSum = function(){
        // example for event with sum
        var events = {"eventName":"event_sum","eventCount":1,"eventSum":"0.99"};
        Countly.sendEvent(events);
    }
    eventWithSegment = function(){
        // example for event with segment
        var events = {"eventName":"event_segment","eventCount":1};
        events.segments = {"Country" : "Turkey", "Age" : "28"};
        Countly.sendEvent(events);
    }
    eventWithSum_Segment = function(){
        // example for event with segment and sum
        var events = {"eventName":"event_segment_sum","eventCount":1,"eventSum":"0.99"};
        events.segments = {"Country" : "Turkey", "Age" : "28"};
        Countly.sendEvent(events);
    }
    setUserData = function(){
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
    }
    setloggingenabled = function(){
        // example for setLoggingEnabled
        Countly.setLoggingEnabled();
    }

    onRegistrationId = function(){
        // Countly.messagingMode.TEST
        // Countly.messagingMode.PRODUCTION
        // Countly.mode = Countly.messagingMode.TEST;
        // Countly.Push.onRegisterPushNotification();
        Countly.initMessaging({
            "messageMode": Countly.messagingMode.TEST,
            "projectId": "881000050249"
        });

        // Tesint purpose only
        Countly.onRegistrationId({
            "registrationId":"abcdefg",
            "mode":Countly.messagingMode.TEST,
            "projectId": "881000050249"
        })
    }
    recordView = function(viewName){
        Countly.recordView(viewName);
    }
};