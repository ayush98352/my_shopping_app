//
//  SceneDelegate.swift
//  App
//
//  Created by Ayush Kumar on 01/12/24.
//

import UIKit
import Capacitor
import WebKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    var webView: WKWebView?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // This method will be called when the scene is first connected
        print("SceneDelegate: Scene will connect.")
        
        // Make sure window is set
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        
        // Your WebView setup code here...
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        print("SceneDelegate: Scene did become active.")
        
        // Safe area calculations and WebView adjustments
        guard let windowScene = scene as? UIWindowScene else {
            print("Error: Unable to find a valid window scene.")
            return
        }

        guard let keyWindow = windowScene.windows.first(where: { $0.isKeyWindow }) else {
            print("Error: Unable to find key window.")
            return
        }

        let safeAreaInsets = keyWindow.safeAreaInsets
        print("Safe Area Insets - Top: \(safeAreaInsets.top), Bottom: \(safeAreaInsets.bottom), Left: \(safeAreaInsets.left), Right: \(safeAreaInsets.right)")
    }
}
