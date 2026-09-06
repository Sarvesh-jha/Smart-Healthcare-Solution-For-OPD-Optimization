import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api.dart';

const teal = Color(0xff0e7773);
const ink = Color(0xff173a36);
const pale = Color(0xfff7faf8);
const mint = Color(0xffd7eee4);

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'MEDIrxCARE Patient',
    theme: ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: teal),
      scaffoldBackgroundColor: pale,
    ),
    home: const Gate(),
  );
}

class Gate extends StatefulWidget {
  const Gate({super.key});
  @override
  State<Gate> createState() => _GateState();
}

class _GateState extends State<Gate> {
  final store = const FlutterSecureStorage();
  final api = ApiClient();
  String? token;
  Map<String, dynamic>? user;
  @override
  void initState() {
    super.initState();
    store.read(key: 'session').then((value) {
      if (value != null) {
        final data = jsonDecode(value);
        token = data['token'];
        user = Map<String, dynamic>.from(data['user']);
      }
      setState(() {});
    });
  }

  Future<void> login(Map<String, dynamic> data) async {
    await store.write(key: 'session', value: jsonEncode(data));
    setState(() {
      token = data['token'];
      user = Map<String, dynamic>.from(data['user']);
    });
  }

  Future<void> logout() async {
    await store.delete(key: 'session');
    setState(() {
      token = null;
      user = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (token == null) return Login(api: api, onLogin: login);
    return Shell(api: api, token: token!, user: user!, onLogout: logout);
  }
}

class Login extends StatefulWidget {
  final ApiClient api;
  final Future<void> Function(Map<String, dynamic>) onLogin;
  const Login({super.key, required this.api, required this.onLogin});
  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final email = TextEditingController();
  final password = TextEditingController();
  final name = TextEditingController();
  bool register = false, busy = false;
  Future<void> submit() async {
    setState(() => busy = true);
    try {
      final result = register
          ? await widget.api.register(name.text, email.text, password.text, '')
          : await widget.api.login(email.text, password.text);
      if (result['user']['role'] != 'patient')
        throw Exception('Use a patient account.');
      await widget.onLogin(result);
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xff0d3f3d),
    body: SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(26, 48, 26, 0),
            child: Text(
              'MEDIrxCARE',
              style: TextStyle(
                color: Color(0xffa9e6d1),
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(26, 42, 26, 24),
            child: Text(
              'Your care, in your hands.',
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: pale,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              padding: const EdgeInsets.all(24),
              child: ListView(
                children: [
                  if (register) input('Full name', name),
                  input('Email', email),
                  input('Password', password, secret: true),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: busy ? null : submit,
                    child: busy
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            register
                                ? 'Create patient account'
                                : 'Sign in securely',
                          ),
                  ),
                  TextButton(
                    onPressed: () => setState(() => register = !register),
                    child: Text(
                      register
                          ? 'Already registered? Sign in'
                          : 'Create a patient account',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  );
  Widget input(
    String label,
    TextEditingController controller, {
    bool secret = false,
  }) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: TextField(
      controller: controller,
      obscureText: secret,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    ),
  );
}

class Shell extends StatefulWidget {
  final ApiClient api;
  final String token;
  final Map<String, dynamic> user;
  final Future<void> Function() onLogout;
  const Shell({
    super.key,
    required this.api,
    required this.token,
    required this.user,
    required this.onLogout,
  });
  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int index = 0;
  List<dynamic> appointments = [], doctors = [];
  Map<String, dynamic>? queue;
  bool loading = true;
  @override
  void initState() {
    super.initState();
    refresh();
  }

  Future<void> refresh() async {
    try {
      final data = await Future.wait([
        widget.api.appointments(widget.token),
        widget.api.doctors(),
        widget.api.queue(widget.token),
      ]);
      setState(() {
        appointments = data[0] as List<dynamic>;
        doctors = data[1] as List<dynamic>;
        queue = data[2] as Map<String, dynamic>;
        loading = false;
      });
    } catch (_) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      Home(
        user: widget.user,
        appointment: appointments.isEmpty ? null : appointments.first,
        queue: queue,
        open: (value) => setState(() => index = value),
      ),
      DoctorPage(
        api: widget.api,
        token: widget.token,
        doctors: doctors,
        booked: (item) {
          setState(() {
            appointments.insert(0, item);
            index = 0;
          });
        },
      ),
      QueuePage(queue: queue, refresh: refresh),
      GuidePage(api: widget.api, token: widget.token),
      ProfilePage(user: widget.user, logout: widget.onLogout),
    ];
    return Scaffold(
      body: SafeArea(
        child: loading
            ? const Center(child: CircularProgressIndicator(color: teal))
            : pages[index],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(
            icon: Icon(Icons.medical_services_outlined),
            label: 'Doctors',
          ),
          NavigationDestination(
            icon: Icon(Icons.queue_outlined),
            label: 'Queue',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            label: 'Care Guide',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class Home extends StatelessWidget {
  final Map<String, dynamic> user;
  final dynamic appointment;
  final Map<String, dynamic>? queue;
  final void Function(int) open;
  const Home({
    super.key,
    required this.user,
    required this.appointment,
    required this.queue,
    required this.open,
  });
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(22),
    children: [
      Text('GOOD MORNING', style: label),
      Text(
        '${(user['name'] ?? 'Patient').toString().split(' ').first}  ✦',
        style: heading,
      ),
      const SizedBox(height: 22),
      Card(
        color: mint,
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'CARE THAT MOVES WITH YOU',
                style: label.copyWith(color: teal),
              ),
              const SizedBox(height: 10),
              const Text(
                'Small steps. Better health.',
                style: TextStyle(
                  color: ink,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => open(1),
                child: const Text('Find a doctor  ›'),
              ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 22),
      const Text('Your next step', style: section),
      const SizedBox(height: 10),
      appointment == null
          ? Card(
              child: ListTile(
                title: const Text('No upcoming visits'),
                subtitle: const Text('Book a consultation when ready.'),
                trailing: TextButton(
                  onPressed: () => open(1),
                  child: const Text('Browse'),
                ),
              ),
            )
          : Card(
              child: ListTile(
                title: Text(
                  appointment['doctor'] ?? '',
                  style: const TextStyle(
                    color: ink,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(
                  '${appointment['date']} · ${appointment['time']}\n${appointment['specialty']}',
                ),
              ),
            ),
      const SizedBox(height: 22),
      const Text('Live queue', style: section),
      Card(
        color: const Color(0xfffff1e9),
        child: ListTile(
          title: Text('Token: ${queue?['patientToken'] ?? '--'}'),
          subtitle: Text(
            'People ahead: ${queue?['patientsAhead'] ?? '--'} · ${queue?['estimatedWaitTime'] ?? '--'}',
          ),
          trailing: TextButton(
            onPressed: () => open(2),
            child: const Text('Track'),
          ),
        ),
      ),
      const SizedBox(height: 22),
      const Text('Quick care', style: section),
      Row(
        children: [
          Expanded(child: action('✦  AI Care Guide', () => open(3))),
          const SizedBox(width: 10),
          Expanded(child: action('＋  Doctors', () => open(1))),
        ],
      ),
    ],
  );
  Widget action(String text, VoidCallback onTap) => InkWell(
    onTap: onTap,
    child: Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Text(
          text,
          style: const TextStyle(color: ink, fontWeight: FontWeight.bold),
        ),
      ),
    ),
  );
}

class DoctorPage extends StatefulWidget {
  final ApiClient api;
  final String token;
  final List<dynamic> doctors;
  final void Function(Map<String, dynamic>) booked;
  const DoctorPage({
    super.key,
    required this.api,
    required this.token,
    required this.doctors,
    required this.booked,
  });
  @override
  State<DoctorPage> createState() => _DoctorPageState();
}

class _DoctorPageState extends State<DoctorPage> {
  String search = '';
  @override
  Widget build(BuildContext context) {
    final list = widget.doctors
        .where(
          (d) => '${d['name']} ${d['specialization']}'.toLowerCase().contains(
            search.toLowerCase(),
          ),
        )
        .toList();
    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Header(eyebrow: 'Care team', title: 'Find your doctor'),
        TextField(
          onChanged: (value) => setState(() => search = value),
          decoration: const InputDecoration(
            hintText: 'Search doctors or specialties',
            prefixIcon: Icon(Icons.search),
            filled: true,
            fillColor: Colors.white,
          ),
        ),
        const SizedBox(height: 14),
        for (final doctor in list)
          Card(
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: mint,
                child: Text(
                  doctor['avatar'] ?? 'DR',
                  style: const TextStyle(color: teal),
                ),
              ),
              title: Text(
                doctor['name'] ?? 'Doctor',
                style: const TextStyle(color: ink, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                '${doctor['specialization']}\n${doctor['experience']} · ★ ${doctor['rating']}',
              ),
              trailing: FilledButton(
                onPressed: () => book(doctor),
                child: const Text('Book'),
              ),
            ),
          ),
      ],
    );
  }

  Future<void> book(dynamic doctor) async {
    final date = DateTime.now().add(const Duration(days: 1));
    try {
      final result = await widget.api.book({
        'doctorId': doctor['id'],
        'consultationType': 'online',
        'selectedDate': date.toIso8601String(),
        'selectedSlot': '10:30 AM',
        'reason': 'General consultation',
        'paymentMethod': 'upi',
      }, widget.token);
      widget.booked(Map<String, dynamic>.from(result['appointment']));
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }
}

class QueuePage extends StatelessWidget {
  final Map<String, dynamic>? queue;
  final Future<void> Function() refresh;
  const QueuePage({super.key, required this.queue, required this.refresh});
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(22),
    children: [
      const Header(eyebrow: 'Stay in the loop', title: 'Live queue'),
      Card(
        color: const Color(0xff0d3f3d),
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            children: [
              const Text(
                'YOUR TOKEN',
                style: TextStyle(color: Color(0xffa9e6d1)),
              ),
              Text(
                queue?['patientToken']?.toString() ?? '--',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 60,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                queue?['doctorName'] ?? 'No offline appointment yet',
                style: const TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ),
      ),
      Text(
        'People ahead: ${queue?['patientsAhead'] ?? 0}',
        style: const TextStyle(
          color: ink,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      Text(
        'Estimated wait: ${queue?['estimatedWaitTime'] ?? '0 mins'}',
        style: const TextStyle(
          color: ink,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      OutlinedButton(onPressed: refresh, child: const Text('Refresh queue')),
    ],
  );
}

class GuidePage extends StatefulWidget {
  final ApiClient api;
  final String token;
  const GuidePage({super.key, required this.api, required this.token});
  @override
  State<GuidePage> createState() => _GuidePageState();
}

class _GuidePageState extends State<GuidePage> {
  final issue = TextEditingController();
  String? answer;
  bool busy = false;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(22),
    children: [
      const Header(eyebrow: 'Thoughtful guidance', title: 'Care Guide'),
      const Card(
        color: Color(0xfffff1e9),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Describe how you are feeling and get a helpful next step.',
          ),
        ),
      ),
      const SizedBox(height: 16),
      TextField(
        controller: issue,
        maxLines: 6,
        decoration: const InputDecoration(
          hintText: 'Example: headache since yesterday',
          filled: true,
          fillColor: Colors.white,
        ),
      ),
      FilledButton(
        onPressed: busy ? null : ask,
        child: busy
            ? const CircularProgressIndicator(color: Colors.white)
            : const Text('Get guidance'),
      ),
      if (answer != null)
        Card(
          color: mint,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Text(answer!),
          ),
        ),
    ],
  );
  Future<void> ask() async {
    setState(() => busy = true);
    try {
      final result = await widget.api.careGuide(issue.text, widget.token);
      answer =
          '${result['summary'] ?? 'Guidance'}\n\n${result['recommendation'] ?? 'Please consult a healthcare professional.'}';
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }
}

class ProfilePage extends StatelessWidget {
  final Map<String, dynamic> user;
  final Future<void> Function() logout;
  const ProfilePage({super.key, required this.user, required this.logout});
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(22),
    children: [
      const Header(eyebrow: 'Your space', title: 'Profile'),
      Card(
        child: ListTile(title: Text('Patient account'), subtitle: Text('')),
      ),
      OutlinedButton(onPressed: logout, child: const Text('Sign out')),
    ],
  );
}

class Header extends StatelessWidget {
  final String eyebrow, title;
  const Header({super.key, required this.eyebrow, required this.title});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 14, bottom: 22),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(eyebrow.toUpperCase(), style: label),
        Text(title, style: heading),
      ],
    ),
  );
}

const label = TextStyle(
  color: Color(0xff77908b),
  fontSize: 11,
  fontWeight: FontWeight.w800,
  letterSpacing: 1.1,
);
const heading = TextStyle(
  color: ink,
  fontSize: 31,
  fontWeight: FontWeight.w800,
);
const section = TextStyle(
  color: ink,
  fontSize: 18,
  fontWeight: FontWeight.w800,
);
