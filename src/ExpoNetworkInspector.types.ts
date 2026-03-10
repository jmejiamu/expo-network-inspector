export type NetworkEntry = {
  id: string;
  url: string;
  method: string;
  statusCode: number;
  durationMs: number;
  protocol: string;
  timestamp: number;
  error: string;
  warnings: string[];
  requestHeaders: Record<string, string>;
};

export type ExpoNetworkInspectorEvents = {
  onRequest: (entry: NetworkEntry) => void;
};
