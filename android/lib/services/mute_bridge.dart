import 'package:flutter/services.dart';
import '../config.dart';

/// Platform channel to Kotlin AlarmManager / AudioManager / service layer.
class MuteBridge {
  static const _ch = MethodChannel(kMuteChannel);

  Future<void> requestPermissions() async {
    await _ch.invokeMethod('requestPermissions');
  }

  Future<void> scheduleWindows(List<Map<String, dynamic>> windows) async {
    await _ch.invokeMethod('scheduleWindows', {'windows': windows});
  }

  Future<void> cancelAll() async {
    await _ch.invokeMethod('cancelAll');
  }

  Future<void> setMasterEnabled(bool enabled) async {
    await _ch.invokeMethod('setMasterEnabled', {'enabled': enabled});
  }

  Future<void> undoMute() async {
    await _ch.invokeMethod('undoMute');
  }

  Future<void> snoozeMinutes(int minutes) async {
    await _ch.invokeMethod('snooze', {'minutes': minutes});
  }

  Future<Map<Object?, Object?>> status() async {
    final r = await _ch.invokeMethod<Map>('status');
    return r ?? {};
  }
}
