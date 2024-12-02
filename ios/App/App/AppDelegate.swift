import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var webView: WKWebView? // Declare the webView

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
      
      
      
        let screenWidth = UIScreen.main.bounds.width
         let screenHeight = UIScreen.main.bounds.height
         
         print("Screen Width: \(screenWidth)")
         print("Screen Height: \(screenHeight)")

        // Get status bar height using statusBarManager
        let statusBarHeight = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?
            .statusBarManager?
            .statusBarFrame.height ?? 0
        
        print("Status Bar Height: \(statusBarHeight)")

        if UIDevice.current.hasNotch {
            print("Device has a notch.")
            // Device has a notch
            webView = WKWebView(
                frame: CGRect(
                    x: 0,
                    y: statusBarHeight,
                    width: screenWidth,
                    height: screenHeight - statusBarHeight - 80
                ),
                configuration: WKWebViewConfiguration()
            )
        } else {
            print("Device does not have a notch.")
            // Device does not have a notch
            webView = WKWebView(
                frame: CGRect(
                    x: 0,
                    y: statusBarHeight,
                    width: screenWidth,
                    height: screenHeight - statusBarHeight
                ),
                configuration: WKWebViewConfiguration()
            )
        }
      
 
        
        print("WebView Frame: \(webView?.frame ?? CGRect.zero)")
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// Updated UIDevice Extension
extension UIDevice {
    var hasNotch: Bool {
        let bottom = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows
            .first { $0.isKeyWindow }?
            .safeAreaInsets.bottom ?? 0
        
        print("Safe Area Bottom Inset: \(bottom)")
        return bottom > 0
    }
}
