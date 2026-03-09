// Reexport the native module. On web, it will be resolved to ExpoNetworkInspectorModule.web.ts
// and on native platforms to ExpoNetworkInspectorModule.ts
export { default } from './ExpoNetworkInspectorModule';
export { default as ExpoNetworkInspectorView } from './ExpoNetworkInspectorView';
export * from  './ExpoNetworkInspector.types';
