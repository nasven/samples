const Files = Java.type("java.nio.file.Files");
const Paths = Java.type("java.nio.file.Paths");
const Asciidoctor = Java.type("org.asciidoctor.Asciidoctor");
const Options = Java.type("org.asciidoctor.Options");

const source = Files.readString(Paths.get("mysample.adoc"));
const asciidoctor = Asciidoctor.Factory.create();

try {
  print(asciidoctor.convert(source, Options.builder().build()));
} finally {
  asciidoctor.shutdown();
}
