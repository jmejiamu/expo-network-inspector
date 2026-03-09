import * as React from 'react';

import { ExpoNetworkInspectorViewProps } from './ExpoNetworkInspector.types';

export default function ExpoNetworkInspectorView(props: ExpoNetworkInspectorViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
