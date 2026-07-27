# Nasven samples

These applications demonstrate Nasven on JDK 25 with GraalJS ES2024 and
Maven-resolved Java libraries.

Run a sample with a Nasven 2 launcher:

```sh
nasven helloworld "argument with spaces"
```

Run the complete repository verification against a packaged launcher:

```sh
./verify-samples.sh /path/to/nasven
```

The verifier resolves every manifest, executes finite and deterministic
external-service samples, and starts and probes every HTTP server sample.

## JavaFX status

`javafx-3d`, `javafx-dialogs`, and `javafx-enzo` remain documentation of the
deferred JavaFX category. Nasven on JDK 25 intentionally rejects their
`options: "-fx"` manifests with a clear error. They are not counted as passing
runtime samples, and the verifier checks that explicit rejection.

## External services

- `jaxrs` uses a checked-in fixture unless `NASVEN_JAXRS_URL` names an HTTP
  JSON endpoint.
- `mqtt` performs a deterministic client-configuration dry run unless
  `NASVEN_MQTT_LIVE=true`.
- `twitter4j` validates no-credential behavior unless
  `NASVEN_TWITTER_LIVE=true` and all four `TWITTER_OAUTH_*` variables are set.

HTTP server samples accept `NASVEN_PORT`; the verifier gives each one a
separate local port.

## Docker sample

Build the JDK 25 runtime image from the coordinated `nasven/nasven` checkout,
then build this repository's Spark-based application image:

```sh
docker build -f docker/Dockerfile -t nasven.js-local /path/to/nasven
docker build -f dockerapp/Dockerfile -t nasven-spark-sample .
```

`dockerapp/Dockerfile` accepts `--build-arg NASVEN_IMAGE=...` when the runtime
image uses a different local or published tag.
