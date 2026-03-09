import { registerWebModule, NativeModule } from 'expo';

import { ExpoNetworkInspectorModuleEvents } from './ExpoNetworkInspector.types';

class ExpoNetworkInspectorModule extends NativeModule<ExpoNetworkInspectorModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoNetworkInspectorModule, 'ExpoNetworkInspectorModule');
