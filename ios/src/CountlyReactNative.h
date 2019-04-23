#import "React/RCTBridgeModule.h"

@interface CountlyReactNative : NSObject <RCTBridgeModule>


- (void)init:(NSArray*)arguments;
- (void)event:(NSArray*)arguments;
- (void)setloggingenabled:(NSArray*)arguments;
- (void)setuserdata:(NSArray*)arguments;
- (void)onregistrationid:(NSArray*)arguments;
- (void)start;
- (void)stop;
- (void)recordView:(NSArray*)arguments;

- (void)setHttpPostForced:(NSArray*)arguments;
- (void)setLocation:(NSArray*)arguments;
- (void)enableCrashReporting:(NSArray*)arguments;
- (void)addCrashLog:(NSArray*)arguments;

- (void)changeDeviceId:(NSArray*)arguments;
- (void)enableParameterTamperingProtection:(NSArray*)arguments;
- (void)startEvent:(NSArray*)arguments;
- (void)endEvent:(NSArray*)arguments;

- (void)userData_setProperty:(NSArray*)arguments;
- (void)userData_increment:(NSArray*)arguments;
- (void)userData_incrementBy:(NSArray*)arguments;
- (void)userData_multiply:(NSArray*)arguments;
- (void)userData_saveMax:(NSArray*)arguments;
- (void)userData_saveMin:(NSArray*)arguments;
- (void)demo:(NSArray*)arguments;
- (void)setRequiresConsent:(NSArray*)arguments;
- (void)giveConsent:(NSArray*)arguments;
- (void)removeConsent:(NSArray*)arguments;
- (void)remoteConfigUpdate:(NSArray*)arguments;
- (void)updateRemoteConfigForKeysOnly:(NSArray*)arguments;
- (void)updateRemoteConfigExceptKeys:(NSArray*)arguments;
- (void)getRemoteConfigValueForKey:(NSArray*)arguments;

@end
