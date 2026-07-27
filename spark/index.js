const Paths = Java.type("java.nio.file.Paths");
const System = Java.type("java.lang.System");
const Spark = Java.type("spark.Spark");

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);
const publicDirectory = Paths.get("public").toAbsolutePath().toString();

Spark.port(port);
Spark.staticFiles.externalLocation(publicDirectory);
Spark.init();
Spark.awaitInitialization();

print("Spark listening on http://127.0.0.1:" + port);
Nasven.daemon();
