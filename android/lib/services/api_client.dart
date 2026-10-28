import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class ApiClient {
  ApiClient({http.Client? client, this.baseUrl = kApiBase})
      : _http = client ?? http.Client();

  final http.Client _http;
  final String baseUrl;
  String? accessToken;
  String? refreshToken;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (accessToken != null) 'Authorization': 'Bearer $accessToken',
      };

  Future<Map<String, dynamic>> signup(String email, String password) async {
    final res = await _http.post(
      Uri.parse('$baseUrl/auth/signup'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> refresh() async {
    final res = await _http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh_token': refreshToken}),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> getPrayerTimesMe() async {
    final res = await _http.get(
      Uri.parse('$baseUrl/prayer-times/me'),
      headers: _headers,
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> getLocation() async {
    final res = await _http.get(
      Uri.parse('$baseUrl/settings/location'),
      headers: _headers,
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> saveLocation(Map<String, dynamic> body) async {
    final res = await _http.put(
      Uri.parse('$baseUrl/settings/location'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> getMutePrefs() async {
    final res = await _http.get(
      Uri.parse('$baseUrl/settings/mute'),
      headers: _headers,
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> saveMutePrefs(Map<String, dynamic> body) async {
    final res = await _http.put(
      Uri.parse('$baseUrl/settings/mute'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _decode(res);
  }

  Future<Map<String, dynamic>> registerDevice({
    required String pushToken,
  }) async {
    final res = await _http.post(
      Uri.parse('$baseUrl/devices/register'),
      headers: _headers,
      body: jsonEncode({
        'platform': 'android',
        'push_token': pushToken,
      }),
    );
    return _decode(res);
  }

  Map<String, dynamic> _decode(http.Response res) {
    final body = res.body.isEmpty ? <String, dynamic>{} : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, body is Map ? body : {'raw': body});
    }
    if (body is Map<String, dynamic>) return body;
    return {'data': body};
  }
}

class ApiException implements Exception {
  ApiException(this.status, this.body);
  final int status;
  final Object body;
  @override
  String toString() => 'ApiException($status, $body)';
}
