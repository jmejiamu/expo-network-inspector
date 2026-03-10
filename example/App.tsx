import React, { useEffect, useState } from "react";
import { Button, FlatList, SafeAreaView, Text, View } from "react-native";
import NetworkInspector, { NetworkEntry } from "expo-network-inspector";

export default function App() {
  const [message, setMessage] = useState("Nothing yet");
  const [entries, setEntries] = useState<NetworkEntry[]>([]);

  useEffect(() => {
    const sub = NetworkInspector.addListener("onRequest", (entry) => {
      setEntries((prev) => [entry, ...prev]);
      setMessage(`Live request: ${entry.method} ${entry.url}`);
    });

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, marginTop: 60 }}>
      <Button
        title="Start"
        onPress={() => {
          const result = NetworkInspector.start();
          setMessage(result);
        }}
      />

      <View style={{ height: 12 }} />

      <Button
        title="Make HTTPS Request"
        onPress={async () => {
          const result = await NetworkInspector.makeRequest(
            "https://jsonplaceholder.typicode.com/posts/1",
          );
          setMessage(result);
        }}
      />

      <View style={{ height: 12 }} />

      <Button
        title="Make HTTP Request"
        onPress={async () => {
          const result =
            await NetworkInspector.makeRequest("http://example.com");
          setMessage(result);
        }}
      />

      <View style={{ height: 12 }} />

      <Button
        title="Load Existing Entries"
        onPress={() => {
          const result = NetworkInspector.getEntries();
          setEntries(result);
          setMessage("Loaded entries");
        }}
      />

      <View style={{ height: 12 }} />

      <Button
        title="Clear"
        onPress={() => {
          NetworkInspector.clear();
          setEntries([]);
          setMessage("clear");
        }}
      />

      <View style={{ height: 20 }} />

      <Text style={{ marginBottom: 16 }}>{message}</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1 }}>
            <Text>
              {item.method} {item.url}
            </Text>
            <Text>Status: {item.statusCode}</Text>
            <Text>Duration: {item.durationMs}ms</Text>
            <Text>Protocol: {item.protocol}</Text>
            <Text>Error: {item.error || "none"}</Text>
            <Text>
              Warnings:{" "}
              {item.warnings.length ? item.warnings.join(", ") : "none"}
            </Text>
            <Text>Headers: {JSON.stringify(item.requestHeaders, null, 2)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
