const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const Thread = Java.type("java.lang.Thread");
const DefaultCamelContext = Java.type("org.apache.camel.impl.DefaultCamelContext");
const RouteBuilder = Java.type("org.apache.camel.builder.RouteBuilder");

const output = Paths.get("target", "hello.txt");
Files.createDirectories(output.getParent());
Files.deleteIfExists(output);

const GraalRouteBuilder = Java.extend(RouteBuilder);
let route;
route = new GraalRouteBuilder({
  configure() {
    Java.super(route)
      .from("direct:copy")
      .routeId("graaljs-file-copy")
      .to("file:target?fileName=hello.txt");
  }
});

const context = new DefaultCamelContext();
try {
  context.addRoutes(route);
  context.start();
  context.createProducerTemplate().sendBody(
    "direct:copy",
    Files.readString(Paths.get("hello.txt"))
  );

  const deadline = Date.now() + 10_000;
  while (!Files.exists(output) && Date.now() < deadline) {
    Thread.sleep(50);
  }
  if (!Files.exists(output)) {
    throw new Error("Camel did not create target/hello.txt within 10 seconds");
  }
  print("Camel copied hello.txt to " + output);
} finally {
  context.stop();
}
