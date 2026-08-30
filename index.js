import { AppRegistry, LogBox } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

// @shopify/flash-list reaches into a React Native private module that isn't in
// RN's "exports" map. Nothing we can do from here, and the LogBox notification
// covers the tab bar. Scoped to that exact message.
LogBox.ignoreLogs(['Attempted to import the module']);

AppRegistry.registerComponent(appName, () => App);
