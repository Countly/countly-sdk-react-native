// CountlyViewTracking.m
//
// This code is provided under the MIT License.
//
// Please visit www.count.ly for more information.

#import "CountlyCommon.h"

@interface CountlyViewTracking ()
@property (nonatomic) NSTimeInterval lastViewStartTime;
@property (nonatomic, strong) NSMutableArray* exceptionViewControllers;
@end

NSString* const kCountlyReservedEventView = @"[CLY]_view";

@implementation CountlyViewTracking

+ (instancetype)sharedInstance
{
    static CountlyViewTracking* s_sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{s_sharedInstance = self.new;});
    return s_sharedInstance;
}

- (instancetype)init
{
    self = [super init];
    if (self)
    {
        self.exceptionViewControllers = NSMutableArray.new;

        NSArray* internalExceptionViewControllers =
        @[
            @"UINavigationController",
            @"UIAlertController",
            @"UIPageViewController",
            @"UITabBarController",
            @"UIReferenceLibraryViewController",
            @"UISplitViewController",
            @"UIInputViewController",
            @"UISearchController",
            @"UISearchContainerViewController",
            @"UIApplicationRotationFollowingController"
        ];

        for (NSString* className in internalExceptionViewControllers)
        {
            Class c = NSClassFromString(className);
            if(c)
                [self.exceptionViewControllers addObject:c];
        
        }
    }

    return self;
}

- (void)reportView:(NSString *)viewName
{
    [self endView];

    COUNTLY_LOG(@"View tracking started: %@", viewName);

    NSMutableDictionary* segmentation =
    @{
        @"name": viewName,
        @"segment": CountlyDeviceInfo.osName,
        @"visit": @1
    }.mutableCopy;

    if(!self.lastView)
        segmentation[@"start"] = @1;

    [Countly.sharedInstance recordEvent:kCountlyReservedEventView segmentation:segmentation];

    self.lastView = viewName;
    self.lastViewStartTime = CountlyCommon.sharedInstance.uniqueTimestamp;
}

- (void)endView
{
    if(self.lastView)
    {
        NSDictionary* segmentation =
        @{
            @"name": self.lastView,
            @"segment": CountlyDeviceInfo.osName,
        };

        NSTimeInterval duration = NSDate.date.timeIntervalSince1970 - self.lastViewStartTime;
        [Countly.sharedInstance recordEvent:kCountlyReservedEventView segmentation:segmentation count:1 sum:0 duration:duration timestamp:self.lastViewStartTime];

        COUNTLY_LOG(@"View tracking ended: %@ duration: %f", self.lastView, duration);
    }
}

#if (TARGET_OS_IOS || TARGET_OS_TV)
- (void)startAutoViewTracking
{
    self.isAutoViewTrackingEnabled = YES;

    Method O_method;
    Method C_method;

    O_method = class_getInstanceMethod(UIViewController.class, @selector(viewDidAppear:));
    C_method = class_getInstanceMethod(UIViewController.class, @selector(Countly_viewDidAppear:));
    method_exchangeImplementations(O_method, C_method);
}

- (void)addExceptionForAutoViewTracking:(Class)exceptionViewControllerSubclass
{
    [self.exceptionViewControllers addObject:exceptionViewControllerSubclass];
}

- (void)removeExceptionForAutoViewTracking:(Class)exceptionViewControllerSubclass
{
    [self.exceptionViewControllers removeObject:exceptionViewControllerSubclass];
}

#endif
@end


#if (TARGET_OS_IOS || TARGET_OS_TV)
@implementation UIViewController (CountlyViewTracking)
- (void)Countly_viewDidAppear:(BOOL)animated
{
    NSString* viewTitle = self.title;
    if(!viewTitle)
        viewTitle = NSStringFromClass(self.class);

    if(CountlyViewTracking.sharedInstance.isAutoViewTrackingEnabled && ![CountlyViewTracking.sharedInstance.lastView isEqualToString:viewTitle])
    {
        __block BOOL isExceptionClass = NO;
        [CountlyViewTracking.sharedInstance.exceptionViewControllers enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL * stop)
        {
            if([self isKindOfClass:obj] || [NSStringFromClass(self.class) isEqualToString:NSStringFromClass(obj)])
            {
                isExceptionClass = YES;
                *stop = YES;
            }
        }];

        if(!isExceptionClass)
            [CountlyViewTracking.sharedInstance reportView:viewTitle];
    }

    [self Countly_viewDidAppear:animated];
}
@end
#endif
