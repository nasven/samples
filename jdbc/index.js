const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const Properties = Java.type("java.util.Properties");
const Driver = Java.type("org.h2.Driver");

Files.createDirectories(Paths.get("target"));
const properties = new Properties();
properties.setProperty("user", "sa");
properties.setProperty("password", "");

const driver = new Driver();
let connection;
let statement;
let resultSet;

try {
  connection = driver.connect("jdbc:h2:./target/nasven-jdbc", properties);
  statement = connection.prepareStatement(
    "SELECT table_name FROM information_schema.tables " +
    "WHERE table_schema = 'INFORMATION_SCHEMA' AND table_name LIKE ? " +
    "ORDER BY table_name"
  );
  statement.setString(1, "%COLUMN%");
  resultSet = statement.executeQuery();

  print("INFORMATION_SCHEMA tables matching %COLUMN%");
  while (resultSet.next()) {
    print("- " + resultSet.getString("TABLE_NAME"));
  }
} finally {
  if (resultSet !== undefined) {
    resultSet.close();
  }
  if (statement !== undefined) {
    statement.close();
  }
  if (connection !== undefined) {
    connection.close();
  }
}
