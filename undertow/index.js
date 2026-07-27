const Paths = Java.type("java.nio.file.Paths");
const System = Java.type("java.lang.System");
const Undertow = Java.type("io.undertow.Undertow");
const PathResourceManager = Java.type(
  "io.undertow.server.handlers.resource.PathResourceManager"
);
const ResourceHandler = Java.type(
  "io.undertow.server.handlers.resource.ResourceHandler"
);

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);
const resourceManager = new PathResourceManager(
  Paths.get("public").toAbsolutePath(),
  1024
);
const handler = new ResourceHandler(resourceManager)
  .setDirectoryListingEnabled(false)
  .addWelcomeFiles("index.html");
const server = Undertow.builder()
  .addHttpListener(port, "127.0.0.1")
  .setHandler(handler)
  .build();

server.start();
print("Undertow listening on http://127.0.0.1:" + port);
Nasven.daemon();
