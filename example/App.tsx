import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetworkInspector, { NetworkEntry } from "expo-network-inspector";

type ActionButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "danger";
};

function ActionButton({
  title,
  subtitle,
  onPress,
  variant = "secondary",
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === "primary" && styles.actionButtonPrimary,
        variant === "secondary" && styles.actionButtonSecondary,
        variant === "danger" && styles.actionButtonDanger,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.actionButtonTitle,
          (variant === "primary" || variant === "danger") &&
            styles.actionButtonTitleLight,
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            styles.actionButtonSubtitle,
            (variant === "primary" || variant === "danger") &&
              styles.actionButtonSubtitleLight,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EntryCard({ item }: { item: NetworkEntry }) {
  const isSuccess = item.statusCode >= 200 && item.statusCode < 300;
  const headerText =
    item.requestHeaders && Object.keys(item.requestHeaders).length > 0
      ? JSON.stringify(item.requestHeaders, null, 2)
      : "{}";

  return (
    <View style={styles.entryCard}>
      <View style={styles.entryTopRow}>
        <View style={styles.methodBadge}>
          <Text style={styles.methodBadgeText}>{item.method}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isSuccess ? styles.statusBadgeSuccess : styles.statusBadgeError,
          ]}
        >
          <Text style={styles.statusBadgeText}>{item.statusCode}</Text>
        </View>
      </View>

      <Text style={styles.urlText}>{item.url}</Text>

      <View style={styles.entryMeta}>
        <InfoRow label="Duration" value={`${item.durationMs} ms`} />
        <InfoRow label="Protocol" value={item.protocol || "unknown"} />
        <InfoRow label="Error" value={item.error || "none"} />
        <InfoRow
          label="Warnings"
          value={item.warnings.length ? item.warnings.join(", ") : "none"}
        />
      </View>

      <View style={styles.headersBox}>
        <Text style={styles.headersTitle}>Request Headers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.headersText}>{headerText}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Turbo Module Demo</Text>
              <Text style={styles.title}>Network Inspector</Text>
              <Text style={styles.description}>
                Capture requests, test HTTP and HTTPS calls, and inspect entries
                in real time.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Actions</Text>

              <View style={styles.actionsContainer}>
                <ActionButton
                  title="Start Inspector"
                  subtitle="Begin listening for requests"
                  variant="primary"
                  onPress={() => {
                    const result = NetworkInspector.start();
                    setMessage(result);
                  }}
                />

                <ActionButton
                  title="Test HTTPS Request"
                  subtitle="Request jsonplaceholder"
                  onPress={async () => {
                    const result = await NetworkInspector.makeRequest(
                      "https://jsonplaceholder.typicode.com/posts/1",
                    );
                    setMessage(result);
                  }}
                />

                <ActionButton
                  title="Test HTTP Request"
                  subtitle="Request example.com"
                  onPress={async () => {
                    const result =
                      await NetworkInspector.makeRequest("http://example.com");
                    setMessage(result);
                  }}
                />

                <ActionButton
                  title="Load Entries"
                  subtitle="Read stored requests"
                  onPress={() => {
                    const result = NetworkInspector.getEntries();
                    setEntries(result);
                    setMessage("Loaded entries");
                  }}
                />

                <ActionButton
                  title="Clear Entries"
                  subtitle="Remove all captured entries"
                  variant="danger"
                  onPress={() => {
                    NetworkInspector.clear();
                    setEntries([]);
                    setMessage("Cleared entries");
                  }}
                />
              </View>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.cardTitle}>Status</Text>
              <Text style={styles.statusText}>{message}</Text>
            </View>

            <View style={styles.entriesHeader}>
              <Text style={styles.entriesTitle}>Captured Entries</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{entries.length}</Text>
              </View>
            </View>

            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No entries yet</Text>
                <Text style={styles.emptyStateText}>
                  Start the inspector, trigger a request, and your captured
                  requests will appear here.
                </Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => <EntryCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#4F46E5",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  actionButtonPrimary: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  actionButtonSecondary: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  actionButtonDanger: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  actionButtonTitleLight: {
    color: "#FFFFFF",
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  actionButtonSubtitleLight: {
    color: "#E5E7EB",
  },
  statusCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 18,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#312E81",
  },
  entriesHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  countBadge: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 4,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
  },
  entryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  entryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodBadge: {
    backgroundColor: "#E0E7FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  methodBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3730A3",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeSuccess: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeError: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  urlText: {
    marginTop: 12,
    marginBottom: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  entryMeta: {
    gap: 10,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  infoValue: {
    flex: 1.4,
    fontSize: 13,
    color: "#111827",
    textAlign: "right",
  },
  headersBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headersTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  headersText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#374151",
    fontFamily: "Courier",
  },
});
