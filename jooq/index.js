const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const Properties = Java.type("java.util.Properties");
const Driver = Java.type("org.h2.Driver");
const DSL = Java.type("org.jooq.impl.DSL");

Files.createDirectories(Paths.get("target"));
const properties = new Properties();
properties.setProperty("user", "sa");
properties.setProperty("password", "");

const driver = new Driver();
let connection;

try {
  connection = driver.connect("jdbc:h2:./target/nasven-jooq", properties);
  const context = DSL.using(connection);
  context.execute(
    "CREATE TABLE IF NOT EXISTS sample_book (" +
    "id INTEGER PRIMARY KEY, title VARCHAR(100) NOT NULL)"
  );
  context.execute(
    "MERGE INTO sample_book (id, title) KEY(id) VALUES (1, 'GraalJS in Action')"
  );

  const records = context.fetch(
    "SELECT id, title FROM sample_book ORDER BY id"
  );
  for (const record of records) {
    print("Book " + record.get("ID") + ": " + record.get("TITLE"));
  }
} finally {
  if (connection !== undefined) {
    connection.close();
  }
}
