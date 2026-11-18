// App entry: platform globals first, then Expo Router (ES imports evaluate in order).
import './src/native/platform/installGlobals';
import 'expo-router/entry';
