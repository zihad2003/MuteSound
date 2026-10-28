import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/api_client.dart';
import 'services/auth_store.dart';
import 'services/fcm_service.dart';
import 'services/mute_bridge.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MuteSoundApp());
}

class MuteSoundApp extends StatefulWidget {
  const MuteSoundApp({super.key});

  @override
  State<MuteSoundApp> createState() => _MuteSoundAppState();
}

class _MuteSoundAppState extends State<MuteSoundApp> {
  final api = ApiClient();
  late final auth = AuthStore(api);
  final bridge = MuteBridge();
  late final sync = ScheduleSync(api, bridge);
  late final fcm = FcmRegistrar(api, sync);

  bool _loading = true;
  bool _loggedIn = false;
  bool _onboarded = false;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    await auth.load();
    _loggedIn = await auth.isLoggedIn;
    final prefs = await SharedPreferences.getInstance();
    _onboarded = prefs.getBool('ms_onboarded') ?? false;
    if (_loggedIn) {
      try {
        await fcm.init();
        await sync.refreshAndReschedule();
      } catch (_) {}
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MuteSound',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F6B4D)),
        useMaterial3: true,
      ),
      routes: {
        '/login': (_) => LoginScreen(
              auth: auth,
              onSuccess: () async {
                await fcm.init();
                await sync.refreshAndReschedule();
                setState(() => _loggedIn = true);
              },
            ),
        '/settings': (_) => SettingsScreen(api: api, sync: sync),
        '/onboarding': (_) => OnboardingScreen(
              bridge: bridge,
              onDone: () => setState(() => _onboarded = true),
            ),
      },
      home: _loading
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : !_loggedIn
              ? LoginScreen(
                  auth: auth,
                  onSuccess: () async {
                    await fcm.init();
                    await sync.refreshAndReschedule();
                    setState(() => _loggedIn = true);
                  },
                )
              : !_onboarded
                  ? OnboardingScreen(
                      bridge: bridge,
                      onDone: () => setState(() => _onboarded = true),
                    )
                  : HomeScreen(
                      api: api,
                      auth: auth,
                      bridge: bridge,
                      sync: sync,
                    ),
    );
  }
}
