import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoNetworkInspectorViewProps } from './ExpoNetworkInspector.types';

const NativeView: React.ComponentType<ExpoNetworkInspectorViewProps> =
  requireNativeView('ExpoNetworkInspector');

export default function ExpoNetworkInspectorView(props: ExpoNetworkInspectorViewProps) {
  return <NativeView {...props} />;
}
