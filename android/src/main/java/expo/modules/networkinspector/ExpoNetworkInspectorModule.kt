package expo.modules.networkinspector

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import okhttp3.Headers
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.UUID
import java.util.concurrent.TimeUnit

class ExpoNetworkInspectorModule : Module() {
  private var started = false
  private val entries = mutableListOf<Map<String, Any>>()

  private val redactedHeaderNames = setOf(
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key"
  )

  private fun addEntry(entry: Map<String, Any>) {
    entries.add(0, entry)

    if (entries.size > 200) {
      entries.removeAt(entries.lastIndex)
    }
  }

  private fun sanitizeHeaders(headers: Headers): Map<String, String> {
    val result = mutableMapOf<String, String>()

    for (name in headers.names()) {
      val value = headers[name].orEmpty()

      result[name] =
        if (redactedHeaderNames.contains(name.lowercase())) {
          "[REDACTED]"
        } else {
          value
        }
    }

    return result
  }

  private val loggingInterceptor = Interceptor { chain ->
    val request = chain.request()
    val startTime = System.currentTimeMillis()

    val warnings = mutableListOf<String>()
    val url = request.url.toString()
    val protocol = request.url.scheme
    val requestHeaders = sanitizeHeaders(request.headers)

    if (protocol == "http") {
      warnings.add("insecure_http")
    }

    try {
      val response = chain.proceed(request)
      val durationMs = (System.currentTimeMillis() - startTime).toInt()

      if (durationMs > 2000) {
        warnings.add("slow_request")
      }

      val entry = mapOf(
        "id" to UUID.randomUUID().toString(),
        "url" to url,
        "method" to request.method,
        "statusCode" to response.code,
        "durationMs" to durationMs,
        "protocol" to protocol,
        "timestamp" to System.currentTimeMillis().toDouble(),
        "error" to "",
        "warnings" to warnings,
        "requestHeaders" to requestHeaders
      )

      addEntry(entry)
      sendEvent("onRequest", entry)

      response
    } catch (e: Exception) {
      val durationMs = (System.currentTimeMillis() - startTime).toInt()

      val entry = mapOf(
        "id" to UUID.randomUUID().toString(),
        "url" to url,
        "method" to request.method,
        "statusCode" to 0,
        "durationMs" to durationMs,
        "protocol" to protocol,
        "timestamp" to System.currentTimeMillis().toDouble(),
        "error" to (e.message ?: "unknown_error"),
        "warnings" to warnings,
        "requestHeaders" to requestHeaders
      )

      addEntry(entry)
      sendEvent("onRequest", entry)

      throw e
    }
  }

  private val client: OkHttpClient = OkHttpClient.Builder()
    .addInterceptor(loggingInterceptor)
    .connectTimeout(15, TimeUnit.SECONDS)
    .readTimeout(15, TimeUnit.SECONDS)
    .build()

  override fun definition() = ModuleDefinition {
    Name("ExpoNetworkInspector")

    Events("onRequest")

    Function("start") {
      started = true
      "start"
    }

    Function("stop") {
      started = false
      "stop"
    }

    Function("clear") {
      entries.clear()
      "clear"
    }

    Function("getEntries") {
      entries
    }

    AsyncFunction("makeRequest") { url: String ->
      if (!started) {
        return@AsyncFunction "inspector_not_started"
      }

      val request = Request.Builder()
        .url(url)
        .header("Authorization", "Bearer super-secret-token")
        .header("X-Demo", "hello-from-module")
        .header("Cookie", "sessionid=abc123")
        .get()
        .build()

      try {
        client.newCall(request).execute().use { response ->
          return@AsyncFunction "request_logged_${response.code}"
        }
      } catch (e: Exception) {
        return@AsyncFunction "request_failed"
      }
    }
  }
}