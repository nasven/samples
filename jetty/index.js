const Paths = Java.type("java.nio.file.Paths");
const System = Java.type("java.lang.System");
const Server = Java.type("org.eclipse.jetty.server.Server");
const ResourceHandler = Java.type("org.eclipse.jetty.server.handler.ResourceHandler");
const ResourceFactory = Java.type("org.eclipse.jetty.util.resource.ResourceFactory");

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);
const server = new Server(port);
const handler = new ResourceHandler();
handler.setBaseResource(
  ResourceFactory.of(handler).newResource(Paths.get("public").toAbsolutePath())
);
handler.setWelcomeFiles(Java.to(["index.html"], "java.lang.String[]"));
server.setHandler(handler);
server.start();

print("Jetty listening on http://127.0.0.1:" + port);
server.join();
