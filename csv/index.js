const Paths = Java.type("java.nio.file.Paths");
const StandardCharsets = Java.type("java.nio.charset.StandardCharsets");
const CSVFormat = Java.type("org.apache.commons.csv.CSVFormat");
const CSVParser = Java.type("org.apache.commons.csv.CSVParser");

const format = CSVFormat.DEFAULT.builder()
  .setHeader()
  .setSkipHeaderRecord(true)
  .setIgnoreSurroundingSpaces(true)
  .get();
const parser = CSVParser.parse(
  Paths.get("sample.csv").toFile(),
  StandardCharsets.US_ASCII,
  format
);

try {
  for (const record of parser) {
    print("Date: " + record.get("Date") +
      ", Close: " + record.get("Close") +
      ", Volume: " + record.get("Volume"));
  }
} finally {
  parser.close();
}
