import { NativeModule, requireNativeModule } from 'expo';

import { ExpoNetworkInspectorModuleEvents } from './ExpoNetworkInspector.types';

declare class ExpoNetworkInspectorModule extends NativeModule<ExpoNetworkInspectorModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoNetworkInspectorModule>('ExpoNetworkInspector');
