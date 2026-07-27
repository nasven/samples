const System = Java.type("java.lang.System");
const JavaString = Java.type("java.lang.String");
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
const TimeUnit = Java.type("java.util.concurrent.TimeUnit");
const MQTT = Java.type("org.fusesource.mqtt.client.MQTT");
const QoS = Java.type("org.fusesource.mqtt.client.QoS");
const Topic = Java.type("org.fusesource.mqtt.client.Topic");

const host = System.getenv("NASVEN_MQTT_HOST") || "tcp://test.mosquitto.org:1883";
const live = String(System.getenv("NASVEN_MQTT_LIVE")).toLowerCase() === "true";
const topic = System.getenv("NASVEN_MQTT_TOPIC") || "nasven/samples/graaljs";
const payload = "Hello from GraalJS!";
const mqtt = new MQTT();
mqtt.setHost(host);

if (!live) {
  print("MQTT deterministic dry run: " + host + " topic=" + topic + " payload=" + payload);
} else {
  const connection = mqtt.blockingConnection();
  try {
    connection.connect();
    connection.subscribe(Java.to([new Topic(topic, QoS.AT_LEAST_ONCE)], "org.fusesource.mqtt.client.Topic[]"));
    connection.publish(
      topic,
      new JavaString(payload).getBytes(StandardCharsets.UTF_8),
      QoS.AT_LEAST_ONCE,
      false
    );
    const message = connection.receive(10, TimeUnit.SECONDS);
    if (message === null) {
      throw new Error("MQTT message was not received within 10 seconds");
    }
    print("MQTT received: " +
      new JavaString(message.getPayload(), StandardCharsets.UTF_8));
    message.ack();
  } finally {
    connection.disconnect();
  }
}
