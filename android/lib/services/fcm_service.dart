import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_client.dart';
import 'mute_bridge.dart';
import 'schedule_sync.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Background isolate: schedule refresh is handled when app resumes / via sync.
}

class FcmRegistrar {
  FcmRegistrar(this.api, this.sync);

  final ApiClient api;
  final ScheduleSync sync;

  Future<void> init() async {
    try {
      await Firebase.initializeApp();
    } catch (_) {
      // google-services.json may be missing in local scaffold — skip FCM.
      return;
    }

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();
    final token = await messaging.getToken();
    if (token != null && api.accessToken != null) {
      await api.registerDevice(pushToken: token);
    }

    FirebaseMessaging.onMessage.listen((msg) async {
      final type = msg.data['type'];
      if (type == 'schedule_updated' || type == 'settings_updated') {
        await sync.refreshAndReschedule();
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((_) async {
      await sync.refreshAndReschedule();
    });
  }
}

class ScheduleSync {
  ScheduleSync(this.api, this.bridge);

  final ApiClient api;
  final MuteBridge bridge;

  Future<Map<String, dynamic>?> refreshAndReschedule() async {
    if (api.accessToken == null) return null;
    final schedule = await api.getPrayerTimesMe();
    final mute = await api.getMutePrefs();
    final duration = (mute['duration_minutes'] as num?)?.toInt() ?? 5;
    final enabled = mute['enabled_prayers'];
    final enabledList = enabled is List
        ? enabled.map((e) => e.toString().toLowerCase()).toList()
        : <String>['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    final windows = <Map<String, dynamic>>[];
    for (final name in enabledList) {
      final t = schedule[name] ?? schedule[name.toLowerCase()];
      if (t is! String || t.isEmpty) continue;
      windows.add({
        'id': name,
        'time': t,
        'durationMinutes': duration,
        'label': name,
      });
    }
    await bridge.scheduleWindows(windows);
    return schedule;
  }
}
