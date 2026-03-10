import Foundation

class NetworkInspectorURLProtocol: URLProtocol {
  private static let handledKey = "ExpoNetworkInspectorHandledKey"

  private var dataTask: URLSessionDataTask?
  private var startTime: Date?

  override class func canInit(with request: URLRequest) -> Bool {
    guard NetworkInspectorStore.shared.isStarted else {
      return false
    }

    if URLProtocol.property(forKey: handledKey, in: request) != nil {
      return false
    }

    guard let scheme = request.url?.scheme?.lowercased() else {
      return false
    }

    return scheme == "http" || scheme == "https"
  }

  override class func canonicalRequest(for request: URLRequest) -> URLRequest {
    request
  }

  override func startLoading() {
    startTime = Date()

    let mutableRequest = ((request as NSURLRequest).mutableCopy() as? NSMutableURLRequest) ?? NSMutableURLRequest()
    mutableRequest.url = request.url
    mutableRequest.httpMethod = request.httpMethod ?? "GET"
    mutableRequest.allHTTPHeaderFields = request.allHTTPHeaderFields
    mutableRequest.httpBody = request.httpBody

    URLProtocol.setProperty(true, forKey: Self.handledKey, in: mutableRequest)

    let configuration = URLSessionConfiguration.default
    configuration.protocolClasses = []

    let session = URLSession(configuration: configuration)

    dataTask = session.dataTask(with: mutableRequest as URLRequest) { data, response, error in
      let durationMs = Int((Date().timeIntervalSince(self.startTime ?? Date())) * 1000)

      let urlString = self.request.url?.absoluteString ?? ""
      let method = self.request.httpMethod ?? "GET"
      let protocolValue = self.request.url?.scheme?.lowercased() ?? ""
      var warnings: [String] = []

      if protocolValue == "http" {
        warnings.append("insecure_http")
      }

      if durationMs > 2000 {
        warnings.append("slow_request")
      }

      let requestHeaders = Self.sanitizeHeaders(self.request.allHTTPHeaderFields ?? [:])

      let statusCode: Int
      if let httpResponse = response as? HTTPURLResponse {
        statusCode = httpResponse.statusCode
      } else {
        statusCode = 0
      }

      let entry: [String: Any] = [
        "id": UUID().uuidString,
        "url": urlString,
        "method": method,
        "statusCode": statusCode,
        "durationMs": durationMs,
        "protocol": protocolValue,
        "timestamp": Date().timeIntervalSince1970 * 1000,
        "error": error?.localizedDescription ?? "",
        "warnings": warnings,
        "requestHeaders": requestHeaders
      ]

      NetworkInspectorStore.shared.addEntry(entry)

      if let response = response {
        self.client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
      }

      if let data = data {
        self.client?.urlProtocol(self, didLoad: data)
      }

      if let error = error {
        self.client?.urlProtocol(self, didFailWithError: error)
      } else {
        self.client?.urlProtocolDidFinishLoading(self)
      }
    }

    dataTask?.resume()
  }

  override func stopLoading() {
    dataTask?.cancel()
  }

  private static func sanitizeHeaders(_ headers: [String: String]) -> [String: String] {
    let redacted = Set(["authorization", "cookie", "set-cookie", "x-api-key"])
    var result: [String: String] = [:]

    for (key, value) in headers {
      if redacted.contains(key.lowercased()) {
        result[key] = "[REDACTED]"
      } else {
        result[key] = value
      }
    }

    return result
  }
}