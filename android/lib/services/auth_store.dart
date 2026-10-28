import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

class AuthStore {
  AuthStore(this.api);

  final ApiClient api;
  final _secure = const FlutterSecureStorage();
  static const _kAccess = 'ms_access';
  static const _kRefresh = 'ms_refresh';
  static const _kEmail = 'ms_email';
  static const _kMaster = 'ms_master_enabled';

  Future<void> load() async {
    api.accessToken = await _secure.read(key: _kAccess);
    api.refreshToken = await _secure.read(key: _kRefresh);
  }

  Future<bool> get isLoggedIn async {
    await load();
    return api.accessToken != null && api.accessToken!.isNotEmpty;
  }

  Future<void> persistTokens(Map<String, dynamic> auth, {String? email}) async {
    api.accessToken = auth['token'] as String?;
    api.refreshToken = auth['refresh_token'] as String? ?? api.refreshToken;
    await _secure.write(key: _kAccess, value: api.accessToken);
    if (api.refreshToken != null) {
      await _secure.write(key: _kRefresh, value: api.refreshToken);
    }
    if (email != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kEmail, email);
    }
  }

  Future<String?> email() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kEmail);
  }

  Future<void> logout() async {
    api.accessToken = null;
    api.refreshToken = null;
    await _secure.deleteAll();
  }

  Future<bool> masterEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kMaster) ?? true;
  }

  Future<void> setMasterEnabled(bool v) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kMaster, v);
  }
}
