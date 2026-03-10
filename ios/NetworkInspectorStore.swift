import Foundation

final class NetworkInspectorStore {
  static let shared = NetworkInspectorStore()

  private init() {}

  var isStarted = false
  var entries: [[String: Any]] = []

  func addEntry(_ entry: [String: Any]) {
    entries.insert(entry, at: 0)

    if entries.count > 200 {
      entries.removeLast()
    }
  }

  func clear() {
    entries.removeAll()
  }
}