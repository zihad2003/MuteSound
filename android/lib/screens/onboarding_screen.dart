import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/mute_bridge.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key, required this.bridge, required this.onDone});

  final MuteBridge bridge;
  final VoidCallback onDone;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _step = 0;

  Future<void> _finish() async {
    try {
      await widget.bridge.requestPermissions();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('ms_onboarded', true);
    widget.onDone();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      (
        'Welcome',
        'MuteSound mutes media during Azan using your prayer schedule. Timing runs on-device for reliability.'
      ),
      (
        'Permissions',
        'We need notifications and exact alarms so mute windows fire on time — including after reboot.'
      ),
      (
        'Ready',
        'You can change city, mute duration, and which prayers are enabled anytime in Settings.'
      ),
    ];
    final page = pages[_step];
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Text(page.$1,
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text(page.$2, textAlign: TextAlign.center),
              const Spacer(),
              FilledButton(
                onPressed: () {
                  if (_step < pages.length - 1) {
                    setState(() => _step++);
                  } else {
                    _finish();
                  }
                },
                child: Text(_step < pages.length - 1 ? 'Next' : 'Grant & continue'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
