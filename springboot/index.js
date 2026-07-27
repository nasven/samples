const System = Java.type("java.lang.System");
const HashMap = Java.type("java.util.HashMap");
const SpringApplication = Java.type("org.springframework.boot.SpringApplication");
const ServletWebServerFactoryAutoConfiguration = Java.type(
  "org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration"
);
const DispatcherServletAutoConfiguration = Java.type(
  "org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration"
);
const WebMvcAutoConfiguration = Java.type(
  "org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration"
);
const ErrorMvcAutoConfiguration = Java.type(
  "org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration"
);

const configuredPort = System.getenv("NASVEN_PORT");
const port = configuredPort === null ? 8080 : Number(configuredPort);
const sources = Java.to([
  ServletWebServerFactoryAutoConfiguration.class,
  DispatcherServletAutoConfiguration.class,
  WebMvcAutoConfiguration.class,
  ErrorMvcAutoConfiguration.class
], "java.lang.Class[]");

const properties = new HashMap();
properties.put("server.address", "127.0.0.1");
properties.put("server.port", String(port));
properties.put("spring.main.banner-mode", "off");
properties.put("spring.web.resources.static-locations", "file:./public/");

const application = new SpringApplication(sources);
application.setDefaultProperties(properties);
application.run(Java.to([], "java.lang.String[]"));

print("Spring Boot listening on http://127.0.0.1:" + port);
Nasven.daemon();
