import ExpoModulesCore
import Foundation

public class ExpoNetworkInspectorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNetworkInspector")

    Function("start") { () -> String in
      NetworkInspectorStore.shared.isStarted = true
      URLProtocol.registerClass(NetworkInspectorURLProtocol.self)
      return "start"
    }

    Function("stop") { () -> String in
      NetworkInspectorStore.shared.isStarted = false
      URLProtocol.unregisterClass(NetworkInspectorURLProtocol.self)
      return "stop"
    }

    Function("clear") { () -> String in
      NetworkInspectorStore.shared.clear()
      return "clear"
    }

    Function("getEntries") { () -> [[String: Any]] in
      return NetworkInspectorStore.shared.entries
    }

    AsyncFunction("makeRequest") { (urlString: String) async -> String in
      guard NetworkInspectorStore.shared.isStarted else {
        return "inspector_not_started"
      }

      guard let url = URL(string: urlString) else {
        return "invalid_url"
      }

      var request = URLRequest(url: url)
      request.httpMethod = "GET"
      request.setValue("Bearer super-secret-token", forHTTPHeaderField: "Authorization")
      request.setValue("hello-from-ios-module", forHTTPHeaderField: "X-Demo")
      request.setValue("sessionid=abc123", forHTTPHeaderField: "Cookie")

      do {
        let (_, response) = try await URLSession.shared.data(for: request)
        let statusCode = (response as? HTTPURLResponse)?.statusCode ?? 0
        return "request_logged_\(statusCode)"
      } catch {
        return "request_failed"
      }
    }
  }
}