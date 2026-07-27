#!/bin/sh

set -eu

ROOT=$(CDPATH= cd "$(dirname "$0")" && pwd)
LAUNCHER=${1:-${NASVEN_LAUNCHER:-nasven}}
PORT_BASE=${NASVEN_VERIFY_PORT_BASE:-19080}
NASVEN_JAXRS_URL=
NASVEN_NORUN=false
NASVEN_FATJAR=false
NASVEN_MQTT_LIVE=false
NASVEN_MQTT_HOST=tcp://test.mosquitto.org:1883
NASVEN_MQTT_TOPIC=nasven/samples/graaljs
NASVEN_TWITTER_LIVE=false
export \
  NASVEN_JAXRS_URL \
  NASVEN_NORUN \
  NASVEN_FATJAR \
  NASVEN_MQTT_LIVE \
  NASVEN_MQTT_HOST \
  NASVEN_MQTT_TOPIC \
  NASVEN_TWITTER_LIVE

case "$LAUNCHER" in
  /*)
    ;;
  */*)
    LAUNCHER=$(CDPATH= cd "$(dirname "$LAUNCHER")" && pwd)/$(basename "$LAUNCHER")
    ;;
  *)
    LAUNCHER=$(command -v "$LAUNCHER" 2>/dev/null || true)
    ;;
esac

if [ -z "$LAUNCHER" ] || [ ! -x "$LAUNCHER" ]; then
  echo "ERROR: Nasven launcher is not executable: ${1:-${NASVEN_LAUNCHER:-nasven}}" >&2
  exit 2
fi

case "$PORT_BASE" in
  ''|*[!0-9]*)
    echo "ERROR: NASVEN_VERIFY_PORT_BASE must be an integer: $PORT_BASE" >&2
    exit 2
    ;;
esac

if [ "$PORT_BASE" -lt 1024 ] || [ "$PORT_BASE" -gt 65528 ]; then
  echo "ERROR: NASVEN_VERIFY_PORT_BASE must be between 1024 and 65528: $PORT_BASE" >&2
  exit 2
fi

for command_name in curl jwebserver; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "ERROR: required command is unavailable: $command_name" >&2
    exit 2
  fi
done

TMP_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/nasven-samples.XXXXXX")
PIDS_FILE=$TMP_ROOT/pids
: >"$PIDS_FILE"

clean_sample_state() {
  rm -rf \
    "$ROOT/camel/target" \
    "$ROOT/jdbc/target" \
    "$ROOT/jooq/target" \
    "$ROOT/tomcat/target"
}

stop_process() {
  stop_pid=$1
  if kill -0 "$stop_pid" 2>/dev/null; then
    kill "$stop_pid" 2>/dev/null || true
  fi
  wait "$stop_pid" 2>/dev/null || true
}

cleanup() {
  while IFS= read -r cleanup_pid; do
    if [ -n "$cleanup_pid" ]; then
      stop_process "$cleanup_pid"
    fi
  done <"$PIDS_FILE"
  clean_sample_state
  rm -rf "$TMP_ROOT"
}

trap cleanup 0
trap 'exit 1' HUP INT TERM
clean_sample_state

pass() {
  printf 'PASS  %s\n' "$1"
}

fail_with_log() {
  failure_message=$1
  failure_log=$2
  echo "FAIL  $failure_message" >&2
  if [ -f "$failure_log" ]; then
    sed -n '1,200p' "$failure_log" >&2
  fi
  exit 1
}

assert_contains() {
  assertion_file=$1
  assertion_text=$2
  assertion_label=$3
  if ! grep -F "$assertion_text" "$assertion_file" >/dev/null 2>&1; then
    fail_with_log "$assertion_label: missing '$assertion_text'" "$assertion_file"
  fi
}

run_finite() {
  finite_sample=$1
  finite_expected=$2
  shift 2
  finite_log=$TMP_ROOT/$finite_sample.log

  if ! (cd "$ROOT/$finite_sample" && "$LAUNCHER" . "$@") >"$finite_log" 2>&1; then
    fail_with_log "$finite_sample execution" "$finite_log"
  fi
  assert_contains "$finite_log" "$finite_expected" "$finite_sample output"
  pass "$finite_sample"
}

wait_for_http() {
  wait_url=$1
  wait_body=$2
  wait_log=$3
  wait_pid=$4
  wait_attempt=0

  while [ "$wait_attempt" -lt 30 ]; do
    if curl -fsS --max-time 2 "$wait_url" >"$wait_body" 2>/dev/null; then
      return 0
    fi
    if ! kill -0 "$wait_pid" 2>/dev/null; then
      fail_with_log "process exited before responding at $wait_url" "$wait_log"
    fi
    wait_attempt=$((wait_attempt + 1))
    sleep 1
  done

  fail_with_log "timed out waiting for $wait_url" "$wait_log"
}

run_server() {
  server_sample=$1
  server_port=$2
  server_expected=$3
  server_log=$TMP_ROOT/$server_sample-server.log
  server_body=$TMP_ROOT/$server_sample-body

  (
    cd "$ROOT/$server_sample"
    NASVEN_PORT=$server_port exec "$LAUNCHER" .
  ) >"$server_log" 2>&1 &
  server_pid=$!
  printf '%s\n' "$server_pid" >>"$PIDS_FILE"

  wait_for_http \
    "http://127.0.0.1:$server_port/" \
    "$server_body" \
    "$server_log" \
    "$server_pid"
  assert_contains "$server_body" "$server_expected" "$server_sample HTTP response"
  stop_process "$server_pid"
  pass "$server_sample HTTP"
}

echo "Resolving all supported manifests"
for resolve_sample in \
  asciidoctor camel csv hellodocker helloworld jaxrs jdbc jetty jooq mqtt \
  ratpack spark springboot tomcat twitter4j undertow
do
  resolve_log=$TMP_ROOT/$resolve_sample-resolve.log
  if ! (
    cd "$ROOT/$resolve_sample"
    NASVEN_NORUN=true "$LAUNCHER" .
  ) >"$resolve_log" 2>&1; then
    fail_with_log "$resolve_sample dependency resolution" "$resolve_log"
  fi
done
pass "16 supported manifests resolve"

echo "Checking explicitly deferred JavaFX manifests"
for javafx_sample in javafx-3d javafx-dialogs javafx-enzo; do
  javafx_log=$TMP_ROOT/$javafx_sample.log
  if (
    cd "$ROOT/$javafx_sample"
    NASVEN_NORUN=true "$LAUNCHER" .
  ) >"$javafx_log" 2>&1; then
    fail_with_log "$javafx_sample unexpectedly succeeded" "$javafx_log"
  fi
  assert_contains \
    "$javafx_log" \
    "JavaFX compatibility is deferred" \
    "$javafx_sample expected rejection"
  pass "$javafx_sample unsupported as documented"
done

echo "Running finite and deterministic samples"
run_finite asciidoctor '<h2 id="_origins">Origins</h2>'
run_finite camel "Camel copied hello.txt to target/hello.txt"
if ! cmp "$ROOT/camel/hello.txt" "$ROOT/camel/target/hello.txt" >/dev/null 2>&1; then
  fail_with_log "camel copied file content" "$TMP_ROOT/camel.log"
fi
run_finite csv "Date: 14-Mar-14, Close: 221.51, Volume: 79448141"
run_finite hellodocker "Hello Nasven from a Docker container"
run_finite helloworld "First argument: argument with spaces" "argument with spaces"
run_finite jaxrs "JAX-RS deterministic fixture mode"
run_finite jdbc "CONSTRAINT_COLUMN_USAGE"
run_finite jooq "Book 1: GraalJS in Action"
run_finite mqtt \
  "MQTT deterministic dry run: tcp://test.mosquitto.org:1883 topic=nasven/samples/graaljs payload=Hello from GraalJS!"
run_finite twitter4j "Twitter4J no-credential validation mode"

twitter_failure_log=$TMP_ROOT/twitter4j-live-no-credentials.log
if (
  cd "$ROOT/twitter4j"
  NASVEN_TWITTER_LIVE=true \
  TWITTER_OAUTH_CONSUMER_KEY= \
  TWITTER_OAUTH_CONSUMER_SECRET= \
  TWITTER_OAUTH_ACCESS_TOKEN= \
  TWITTER_OAUTH_ACCESS_TOKEN_SECRET= \
  "$LAUNCHER" .
) >"$twitter_failure_log" 2>&1; then
  fail_with_log "twitter4j live mode unexpectedly accepted missing credentials" "$twitter_failure_log"
fi
assert_contains \
  "$twitter_failure_log" \
  "Live Twitter4J mode requires" \
  "twitter4j missing-credential failure"
pass "twitter4j missing credentials fail clearly"

echo "Checking JAX-RS against a deterministic local HTTP endpoint"
fixture_port=$((PORT_BASE + 7))
fixture_log=$TMP_ROOT/jaxrs-fixture.log
fixture_body=$TMP_ROOT/jaxrs-fixture-body
(
  cd "$ROOT/jaxrs"
  exec jwebserver -b 127.0.0.1 -p "$fixture_port" -d .
) >"$fixture_log" 2>&1 &
fixture_pid=$!
printf '%s\n' "$fixture_pid" >>"$PIDS_FILE"
wait_for_http \
  "http://127.0.0.1:$fixture_port/users.json" \
  "$fixture_body" \
  "$fixture_log" \
  "$fixture_pid"

jaxrs_http_log=$TMP_ROOT/jaxrs-http.log
if ! (
  cd "$ROOT/jaxrs"
  NASVEN_JAXRS_URL="http://127.0.0.1:$fixture_port/users.json" "$LAUNCHER" .
) >"$jaxrs_http_log" 2>&1; then
  fail_with_log "jaxrs local HTTP execution" "$jaxrs_http_log"
fi
assert_contains "$jaxrs_http_log" "Number of users: 2" "jaxrs HTTP output"
stop_process "$fixture_pid"
pass "jaxrs local HTTP"

echo "Starting and probing HTTP server samples"
run_server jetty $((PORT_BASE + 1)) "Hello from Jetty and GraalJS"
run_server ratpack $((PORT_BASE + 2)) "Hello from Ratpack and GraalJS"
run_server spark $((PORT_BASE + 3)) "Hello from Spark and GraalJS"
run_server springboot $((PORT_BASE + 4)) "Hello from Spring Boot and GraalJS"
run_server tomcat $((PORT_BASE + 5)) "Hello from Tomcat and GraalJS"
run_server undertow $((PORT_BASE + 6)) "Hello from Undertow and GraalJS"

echo "All Nasven samples verified with $LAUNCHER"
