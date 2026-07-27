const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const System = Java.type("java.lang.System");
const Tomcat = Java.type("org.apache.catalina.startup.Tomcat");

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);
const baseDirectory = Paths.get("target", "tomcat");
Files.createDirectories(baseDirectory);

const tomcat = new Tomcat();
tomcat.setHostname("127.0.0.1");
tomcat.setPort(port);
tomcat.setBaseDir(baseDirectory.toString());
tomcat.getConnector();
tomcat.addWebapp("", Paths.get("web").toAbsolutePath().toString());
tomcat.start();

print("Tomcat listening on http://127.0.0.1:" + port);
tomcat.getServer().await();
