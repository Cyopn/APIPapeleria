# API Requests - Clientes (Fetch, Flutter, C#)

Este documento contiene ejemplos completos y listos para usar (demostrativos) de las peticiones a todos los endpoints expuestos bajo el prefijo `/api` en este proyecto. Está organizado por recurso, con subsecciones por lenguaje para integrarse facilmente en un sidebar.

Notas generales

- Host por defecto: http://localhost:4000
- Prefijo base: /api
- Muchas rutas están protegidas por JWT: añade el header `Authorization: Bearer <token>` si corresponde.
- El secreto de pruebas por defecto en este repo es `huevo` (ver `src/config/env.js`).

---

## Usuarios (/api/users)

Descripción: CRUD de usuarios y endpoint de login.

### Fetch (JavaScript)

```javascript
const baseUrl = 'http://localhost:4000/api';
let token = 'TU_JWT_TOKEN_AQUI'; // reemplaza con token real después del login

// POST /users
async function createUser(payload) {
  const res = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// POST /users/login -> devuelve { token, user }
async function login(credentials) {
  const res = await fetch(`${baseUrl}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const body = await res.json();
  if (body.token) token = body.token;
  return body;
}

// GET /users
async function listUsers() {
  const res = await fetch(`${baseUrl}/users`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

// GET /users/:id
async function getUser(id) {
  const res = await fetch(`${baseUrl}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

// PUT /users/:id
async function updateUser(id, payload) {
  const res = await fetch(`${baseUrl}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// DELETE /users/:id
async function deleteUser(id) {
  const res = await fetch(`${baseUrl}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}
```

Ejemplo de payloads rápidos:
- Crear usuario: { username, names, lastnames, email, password, role }
- Update usuario: { username?, names?, lastnames?, email?, role? }

---

### Flutter (Dart) — paquete `http`

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

final baseUrl = 'http://localhost:4000/api';

Future<Map<String,dynamic>> createUserDart(Map payload) async {
  final url = Uri.parse('$baseUrl/users');
  final res = await http.post(url, headers: {'Content-Type':'application/json'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> loginDart(Map credentials) async {
  final url = Uri.parse('$baseUrl/users/login');
  final res = await http.post(url, headers: {'Content-Type':'application/json'}, body: jsonEncode(credentials));
  return jsonDecode(res.body);
}

Future<List<dynamic>> listUsersDart(String token) async {
  final url = Uri.parse('$baseUrl/users');
  final res = await http.get(url, headers: {'Authorization': 'Bearer $token'});
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> getUserDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/users/$id');
  final res = await http.get(url, headers: {'Authorization': 'Bearer $token'});
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> updateUserDart(String token, int id, Map payload) async {
  final url = Uri.parse('$baseUrl/users/$id');
  final res = await http.put(url, headers: {'Content-Type':'application/json','Authorization':'Bearer $token'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> deleteUserDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/users/$id');
  final res = await http.delete(url, headers: {'Authorization':'Bearer $token'});
  return jsonDecode(res.body);
}
```

---

### C# (.NET) — HttpClient

```csharp
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

static async Task<string> CreateUserCSharp(object payload) {
  var client = new HttpClient();
  var url = "http://localhost:4000/api/users";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> LoginCSharp(object credentials) {
  var client = new HttpClient();
  var url = "http://localhost:4000/api/users/login";
  var json = JsonSerializer.Serialize(credentials);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> UpdateUserCSharp(string token, int id, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/users/{id}";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PutAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> DeleteUserCSharp(string token, int id) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/users/{id}";
  var res = await client.DeleteAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Productos (/api/products)

Descripción: gestión de productos que pueden ser `item` o `print`. Para `item` se usan campos `name` y `mount`; para `print` campos `type_print` y `type_paper`.

### Fetch (JavaScript)

```javascript
// POST /products (payload ejemplo para item)
const itemPayload = { type: 'item', name: 'Taza', description: 'Taza cerámica', price: 12.5, mount: 10 };
const printPayload = { type: 'print', name: 'Impresión A4', description: 'A4 color', price: 5.5, type_print: 'A4', type_paper: 'gloss' };

async function createProduct(payload) {
  const res = await fetch(`${baseUrl}/products`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

// GET /products
async function listProducts() {
  const res = await fetch(`${baseUrl}/products`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

// GET /products/:id
async function getProduct(id) {
  const res = await fetch(`${baseUrl}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

// PUT /products/:id
async function updateProduct(id, payload) {
  const res = await fetch(`${baseUrl}/products/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

// DELETE /products/:id
async function deleteProduct(id) {
  const res = await fetch(`${baseUrl}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}
```

---

### Flutter (Dart)

```dart
Future<Map<String,dynamic>> createProductDart(String token, Map payload) async {
  final url = Uri.parse('$baseUrl/products');
  final res = await http.post(url, headers: {'Content-Type':'application/json','Authorization':'Bearer $token'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<List<dynamic>> listProductsDart(String token) async {
  final url = Uri.parse('$baseUrl/products');
  final res = await http.get(url, headers: {'Authorization':'Bearer $token'});
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> updateProductDart(String token, int id, Map payload) async {
  final url = Uri.parse('$baseUrl/products/$id');
  final res = await http.put(url, headers: {'Content-Type':'application/json','Authorization':'Bearer $token'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> deleteProductDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/products/$id');
  final res = await http.delete(url, headers: {'Authorization':'Bearer $token'});
  return jsonDecode(res.body);
}
```

---

### C# (.NET)

```csharp
static async Task<string> CreateProductCSharp(string token, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = "http://localhost:4000/api/products";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> UpdateProductCSharp(string token, int id, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/products/{id}";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PutAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> DeleteProductCSharp(string token, int id) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/products/{id}";
  var res = await client.DeleteAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Métodos de pago (/api/payment-methods)

### Fetch (JavaScript)

```javascript
async function createPaymentMethod(payload) {
  const res = await fetch(`${baseUrl}/payment-methods`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

async function listPaymentMethods() {
  const res = await fetch(`${baseUrl}/payment-methods`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

async function updatePaymentMethod(id, payload) {
  const res = await fetch(`${baseUrl}/payment-methods/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

async function deletePaymentMethod(id) {
  const res = await fetch(`${baseUrl}/payment-methods/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}
```

---

### Flutter (Dart)

```dart
Future<Map<String,dynamic>> createPaymentMethodDart(String token, Map payload) async {
  final url = Uri.parse('$baseUrl/payment-methods');
  final res = await http.post(url, headers: {'Content-Type':'application/json','Authorization':'Bearer $token'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> updatePaymentMethodDart(String token, int id, Map payload) async {
  final url = Uri.parse('$baseUrl/payment-methods/$id');
  final res = await http.put(url, headers: {'Content-Type':'application/json','Authorization':'Bearer $token'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> deletePaymentMethodDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/payment-methods/$id');
  final res = await http.delete(url, headers: {'Authorization':'Bearer $token'});
  return jsonDecode(res.body);
}
```

---

### C# (.NET)

```csharp
static async Task<string> CreatePaymentMethodCSharp(string token, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = "http://localhost:4000/api/payment-methods";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> UpdatePaymentMethodCSharp(string token, int id, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/payment-methods/{id}";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PutAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> DeletePaymentMethodCSharp(string token, int id) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/payment-methods/{id}";
  var res = await client.DeleteAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Transacciones (/api/transactions)

Descripción: creación y gestión de transacciones con detalles. En muchos entornos la creación puede estar abierta, y otras operaciones protegidas; ajusta según tu configuración.

### Fetch (JavaScript)

```javascript
// POST /transactions
async function createTransaction(payload) {
  const res = await fetch(`${baseUrl}/transactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

// GET /transactions
async function listTransactions() {
  const res = await fetch(`${baseUrl}/transactions`);
  return res.json();
}

// GET /transactions/:id
async function getTransaction(id) {
  const res = await fetch(`${baseUrl}/transactions/${id}`);
  return res.json();
}

// PUT /transactions/:id
async function updateTransaction(id, payload) {
  const res = await fetch(`${baseUrl}/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

// DELETE /transactions/:id
async function deleteTransaction(id) {
  const res = await fetch(`${baseUrl}/transactions/${id}`, { method: 'DELETE' });
  return res.json();
}
```

---

### Flutter (Dart)

```dart
Future<Map<String,dynamic>> createTransactionDart(Map payload) async {
  final url = Uri.parse('$baseUrl/transactions');
  final res = await http.post(url, headers: {'Content-Type':'application/json'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<List<dynamic>> listTransactionsDart() async {
  final url = Uri.parse('$baseUrl/transactions');
  final res = await http.get(url);
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> updateTransactionDart(int id, Map payload) async {
  final url = Uri.parse('$baseUrl/transactions/$id');
  final res = await http.put(url, headers: {'Content-Type':'application/json'}, body: jsonEncode(payload));
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> deleteTransactionDart(int id) async {
  final url = Uri.parse('$baseUrl/transactions/$id');
  final res = await http.delete(url);
  return jsonDecode(res.body);
}
```

---

### C# (.NET)

```csharp
static async Task<string> CreateTransactionCSharp(object payload) {
  var client = new HttpClient();
  var url = "http://localhost:4000/api/transactions";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> UpdateTransactionCSharp(int id, object payload) {
  var client = new HttpClient();
  var url = $"http://localhost:4000/api/transactions/{id}";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PutAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> DeleteTransactionCSharp(int id) {
  var client = new HttpClient();
  var url = $"http://localhost:4000/api/transactions/{id}";
  var res = await client.DeleteAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Archivos (/api/files)

Descripción: CRUD de archivos. Todas las rutas requieren autenticación.

### Fetch (JavaScript)

```javascript
// POST /files
async function createFile(payload) {
  const res = await fetch(`${baseUrl}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// GET /files
async function listFiles() {
  const res = await fetch(`${baseUrl}/files`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// GET /files/:id
async function getFile(id) {
  const res = await fetch(`${baseUrl}/files/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// PUT /files/:id
async function updateFile(id, payload) {
  const res = await fetch(`${baseUrl}/files/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// DELETE /files/:id
async function deleteFile(id) {
  const res = await fetch(`${baseUrl}/files/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
```

### Flutter (Dart)

```dart
Future<Map<String,dynamic>> createFileDart(String token, Map payload) async {
  final url = Uri.parse('$baseUrl/files');
  final res = await http.post(
    url,
    headers: {'Content-Type':'application/json', 'Authorization':'Bearer $token'},
    body: jsonEncode(payload)
  );
  return jsonDecode(res.body);
}

Future<List<dynamic>> listFilesDart(String token) async {
  final url = Uri.parse('$baseUrl/files');
  final res = await http.get(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> getFileDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/files/$id');
  final res = await http.get(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> updateFileDart(String token, int id, Map payload) async {
  final url = Uri.parse('$baseUrl/files/$id');
  final res = await http.put(
    url,
    headers: {'Content-Type':'application/json', 'Authorization':'Bearer $token'},
    body: jsonEncode(payload)
  );
  return jsonDecode(res.body);
}

Future<Map<String,dynamic>> deleteFileDart(String token, int id) async {
  final url = Uri.parse('$baseUrl/files/$id');
  final res = await http.delete(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return jsonDecode(res.body);
}
```

### C# (.NET)

```csharp
static async Task<string> CreateFileCSharp(string token, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = "http://localhost:4000/api/files";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> GetFileCSharp(string token, int id) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/files/{id}";
  var res = await client.GetAsync(url);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> UpdateFileCSharp(string token, int id, object payload) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/files/{id}";
  var json = JsonSerializer.Serialize(payload);
  var content = new StringContent(json, Encoding.UTF8, "application/json");
  var res = await client.PutAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> DeleteFileCSharp(string token, int id) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/files/{id}";
  var res = await client.DeleteAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Gestor de Archivos (/api/file_manager)

Descripción: Gestión de archivos incluyendo subida, descarga y listado por usuario o servicio. Todas las rutas requieren autenticación.

### Fetch (JavaScript)

```javascript
// POST /file_manager (subida de archivos)
async function uploadFiles(formData) {
  const res = await fetch(`${baseUrl}/file_manager`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData // FormData con campo 'files' conteniendo hasta 10 archivos
  });
  return res.json();
}

// GET /file_manager/download/:service/:filename
async function downloadFile(service, filename) {
  const res = await fetch(`${baseUrl}/file_manager/download/${service}/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.blob(); // o res.arrayBuffer() según necesidad
}

// GET /file_manager/user/:usernameOrId
async function getUserFiles(usernameOrId) {
  const res = await fetch(`${baseUrl}/file_manager/user/${usernameOrId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// GET /file_manager/service/:service
async function getServiceFiles(service) {
  const res = await fetch(`${baseUrl}/file_manager/service/${service}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}
```

### Flutter (Dart)

```dart
Future<Map<String,dynamic>> uploadFilesDart(String token, List<File> files) async {
  final url = Uri.parse('$baseUrl/file_manager');
  var request = http.MultipartRequest('POST', url)
    ..headers['Authorization'] = 'Bearer $token';
  
  for (var file in files) {
    request.files.add(await http.MultipartFile.fromPath('files', file.path));
  }
  
  var streamedResponse = await request.send();
  var response = await http.Response.fromStream(streamedResponse);
  return jsonDecode(response.body);
}

Future<Uint8List> downloadFileDart(String token, String service, String filename) async {
  final url = Uri.parse('$baseUrl/file_manager/download/$service/$filename');
  final res = await http.get(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return res.bodyBytes;
}

Future<List<dynamic>> getUserFilesDart(String token, String usernameOrId) async {
  final url = Uri.parse('$baseUrl/file_manager/user/$usernameOrId');
  final res = await http.get(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return jsonDecode(res.body);
}

Future<List<dynamic>> getServiceFilesDart(String token, String service) async {
  final url = Uri.parse('$baseUrl/file_manager/service/$service');
  final res = await http.get(
    url,
    headers: {'Authorization':'Bearer $token'}
  );
  return jsonDecode(res.body);
}
```

### C# (.NET)

```csharp
static async Task<string> UploadFilesCSharp(string token, List<string> filePaths) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = "http://localhost:4000/api/file_manager";
  
  using var content = new MultipartFormDataContent();
  foreach (var path in filePaths) {
    var fileContent = new ByteArrayContent(await File.ReadAllBytesAsync(path));
    content.Add(fileContent, "files", Path.GetFileName(path));
  }
  
  var res = await client.PostAsync(url, content);
  return await res.Content.ReadAsStringAsync();
}

static async Task<byte[]> DownloadFileCSharp(string token, string service, string filename) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/file_manager/download/{service}/{filename}";
  var res = await client.GetAsync(url);
  return await res.Content.ReadAsByteArrayAsync();
}

static async Task<string> GetUserFilesCSharp(string token, string usernameOrId) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/file_manager/user/{usernameOrId}";
  var res = await client.GetAsync(url);
  return await res.Content.ReadAsStringAsync();
}

static async Task<string> GetServiceFilesCSharp(string token, string service) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
  var url = $"http://localhost:4000/api/file_manager/service/{service}";
  var res = await client.GetAsync(url);
  return await res.Content.ReadAsStringAsync();
}
```

---

## Notas finales

- Reemplaza `token` por el JWT obtenido desde `/api/users/login`.
- Ajusta host/puerto si no corres en `localhost:4000`.
- Los payloads mostrados son ejemplos; consulta los modelos en `src/models` para los campos exactos.

---

Fin.
