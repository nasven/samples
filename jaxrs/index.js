const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const System = Java.type("java.lang.System");
const JavaString = Java.type("java.lang.String");
const ClientBuilder = Java.type("jakarta.ws.rs.client.ClientBuilder");

const endpoint = System.getenv("NASVEN_JAXRS_URL");
let response;

if (endpoint === null || endpoint.isBlank()) {
  response = Files.readString(Paths.get("users.json"));
  print("JAX-RS deterministic fixture mode");
} else {
  const client = ClientBuilder.newClient();
  try {
    response = client.target(endpoint).request().get(JavaString.class);
  } finally {
    client.close();
  }
  print("JAX-RS HTTP endpoint: " + endpoint);
}

const users = JSON.parse(String(response));
print("Number of users: " + users.length);
print(JSON.stringify(users, null, 2));
