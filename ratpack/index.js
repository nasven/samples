const System = Java.type("java.lang.System");
const Paths = Java.type("java.nio.file.Paths");
const RatpackServer = Java.type("ratpack.core.server.RatpackServer");

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);

RatpackServer.start((server) => {
  server
    .serverConfig((config) => config
      .baseDir(Paths.get("public").toAbsolutePath())
      .port(port))
    .handlers((chain) => chain.files((files) => files.indexFiles("index.html")));
});

print("Ratpack listening on http://127.0.0.1:" + port);
Nasven.daemon();
