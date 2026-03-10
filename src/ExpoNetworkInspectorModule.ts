import { NativeModule, requireNativeModule } from "expo";
import type {
  ExpoNetworkInspectorEvents,
  NetworkEntry,
} from "./ExpoNetworkInspector.types";

declare class ExpoNetworkInspectorModule extends NativeModule<ExpoNetworkInspectorEvents> {
  start(): string;
  stop(): string;
  clear(): string;
  getEntries(): NetworkEntry[];
  makeRequest(url: string): Promise<string>;
}

export default requireNativeModule<ExpoNetworkInspectorModule>(
  "ExpoNetworkInspector",
);
