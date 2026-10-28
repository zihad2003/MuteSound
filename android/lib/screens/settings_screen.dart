import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/fcm_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.api, required this.sync});

  final ApiClient api;
  final ScheduleSync sync;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _city = TextEditingController(text: 'Dhaka');
  final _country = TextEditingController(text: 'Bangladesh');
  int _method = 1;
  int _duration = 5;
  final _enabled = <String>{'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'};
  bool _busy = false;
  String? _msg;

  @override
  void initState() {
    super.initState();
    _hydrate();
  }

  Future<void> _hydrate() async {
    try {
      final loc = await widget.api.getLocation();
      final mute = await widget.api.getMutePrefs();
      _city.text = (loc['city'] ?? _city.text).toString();
      _country.text = (loc['country'] ?? _country.text).toString();
      _method = (loc['method'] as num?)?.toInt() ?? _method;
      _duration = (mute['duration_minutes'] as num?)?.toInt() ?? _duration;
      final ep = mute['enabled_prayers'];
      if (ep is List) {
        _enabled
          ..clear()
          ..addAll(ep.map((e) => e.toString().toLowerCase()));
      }
      if (mounted) setState(() {});
    } catch (_) {}
  }

  Future<void> _save() async {
    setState(() {
      _busy = true;
      _msg = null;
    });
    try {
      await widget.api.saveLocation({
        'city': _city.text.trim(),
        'country': _country.text.trim(),
        'method': _method,
      });
      await widget.api.saveMutePrefs({
        'duration_minutes': _duration,
        'enabled_prayers': _enabled.toList(),
      });
      await widget.sync.refreshAndReschedule();
      setState(() => _msg = 'Saved & rescheduled');
    } catch (e) {
      setState(() => _msg = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _city,
            decoration: const InputDecoration(labelText: 'City'),
          ),
          TextField(
            controller: _country,
            decoration: const InputDecoration(labelText: 'Country'),
          ),
          const SizedBox(height: 12),
          Text('Calculation method id: $_method'),
          Slider(
            value: _method.toDouble(),
            min: 0,
            max: 15,
            divisions: 15,
            label: '$_method',
            onChanged: (v) => setState(() => _method = v.round()),
          ),
          Text('Mute duration: $_duration min'),
          Slider(
            value: _duration.toDouble(),
            min: 1,
            max: 30,
            divisions: 29,
            label: '$_duration',
            onChanged: (v) => setState(() => _duration = v.round()),
          ),
          const SizedBox(height: 8),
          const Text('Enabled prayers'),
          ...['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(
            (p) => CheckboxListTile(
              title: Text(p),
              value: _enabled.contains(p),
              onChanged: (v) => setState(() {
                if (v == true) {
                  _enabled.add(p);
                } else {
                  _enabled.remove(p);
                }
              }),
            ),
          ),
          if (_msg != null) Text(_msg!),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _busy ? null : _save,
            child: Text(_busy ? 'Saving…' : 'Save'),
          ),
        ],
      ),
    );
  }
}
