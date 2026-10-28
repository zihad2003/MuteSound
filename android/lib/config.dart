/// API base for Android emulator → host machine localhost.
/// Physical device: set to your LAN IP, e.g. http://192.168.1.10:3000/v1
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:3000/v1',
);

const String kMuteChannel = 'app.mutesound/mute';
