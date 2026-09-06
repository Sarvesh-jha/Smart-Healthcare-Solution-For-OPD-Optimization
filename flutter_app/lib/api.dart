import 'dart:convert';

import 'package:http/http.dart' as http;

const apiBase = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://10.0.2.2:5001/api',
);

class ApiClient {
  Future<dynamic> request(
    String path, {
    String? token,
    String method = 'GET',
    Map<String, dynamic>? body,
  }) async {
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    final uri = Uri.parse('$apiBase$path');
    final response = method == 'POST'
        ? await http.post(uri, headers: headers, body: jsonEncode(body ?? {}))
        : await http.get(uri, headers: headers);
    final data = response.body.isEmpty ? {} : jsonDecode(response.body);
    if (response.statusCode < 200 || response.statusCode >= 300)
      throw Exception(data['message'] ?? 'Something went wrong');
    return data;
  }

  Future<Map<String, dynamic>> login(String email, String password) async =>
      Map<String, dynamic>.from(
        await request(
          '/auth/login',
          method: 'POST',
          body: {'email': email, 'password': password},
        ),
      );
  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String phone,
  ) async => Map<String, dynamic>.from(
    await request(
      '/auth/register',
      method: 'POST',
      body: {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'role': 'patient',
      },
    ),
  );
  Future<List<dynamic>> doctors() async =>
      List<dynamic>.from(await request('/doctors'));
  Future<List<dynamic>> appointments(String token) async =>
      List<dynamic>.from(await request('/appointments/upcoming', token: token));
  Future<Map<String, dynamic>> queue(String token) async =>
      Map<String, dynamic>.from(await request('/queue/status', token: token));
  Future<Map<String, dynamic>> careGuide(String issue, String token) async =>
      Map<String, dynamic>.from(
        await request(
          '/ai/doctor',
          token: token,
          method: 'POST',
          body: {'issue': issue},
        ),
      );
  Future<Map<String, dynamic>> book(
    Map<String, dynamic> payload,
    String token,
  ) async => Map<String, dynamic>.from(
    await request('/appointments', token: token, method: 'POST', body: payload),
  );
}
