import 'package:flutter/material.dart';
import '../services/api_client.dart';
import '../services/auth_store.dart';
import '../services/fcm_service.dart';
import '../services/mute_bridge.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    required this.api,
    required this.auth,
    required this.bridge,
    required this.sync,
  });

  final ApiClient api;
  final AuthStore auth;
  final MuteBridge bridge;
  final ScheduleSync sync;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _schedule;
  bool _master = true;
  String? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _master = await widget.auth.masterEnabled();
      _schedule = await widget.sync.refreshAndReschedule();
      await widget.bridge.setMasterEnabled(_master);
    } catch (e) {
      _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return Scaffold(
      appBar: AppBar(
        title: const Text('MuteSound'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => Navigator.of(context).pushNamed('/settings'),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  SwitchListTile(
                    title: const Text('Master mute'),
                    subtitle: const Text('Schedule mute windows when enabled'),
                    value: _master,
                    onChanged: (v) async {
                      setState(() => _master = v);
                      await widget.auth.setMasterEnabled(v);
                      await widget.bridge.setMasterEnabled(v);
                      if (!v) await widget.bridge.cancelAll();
                      if (v) await _load();
                    },
                  ),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(_error!,
                          style: const TextStyle(color: Colors.red)),
                    ),
                  Text("Today's schedule",
                      style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  ...prayers.map((p) {
                    final t = _schedule?[p]?.toString() ?? '—';
                    return ListTile(
                      title: Text(p[0].toUpperCase() + p.substring(1)),
                      trailing: Text(t),
                    );
                  }),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: () => widget.bridge.undoMute(),
                    child: const Text('Undo mute now'),
                  ),
                ],
              ),
            ),
    );
  }
}
