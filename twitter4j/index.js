const System = Java.type("java.lang.System");
const Twitter = Java.type("twitter4j.Twitter");

const live = String(System.getenv("NASVEN_TWITTER_LIVE")).toLowerCase() === "true";
const credentialNames = [
  "TWITTER_OAUTH_CONSUMER_KEY",
  "TWITTER_OAUTH_CONSUMER_SECRET",
  "TWITTER_OAUTH_ACCESS_TOKEN",
  "TWITTER_OAUTH_ACCESS_TOKEN_SECRET"
];
const credentials = credentialNames.map((name) => System.getenv(name));

if (!live) {
  print("Twitter4J no-credential validation mode; set NASVEN_TWITTER_LIVE=true for a live request");
} else if (credentials.some((value) => value === null || value.isBlank())) {
  throw new Error("Live Twitter4J mode requires: " + credentialNames.join(", "));
} else {
  const builder = Twitter.newBuilder();
  builder.oAuthConsumer(credentials[0], credentials[1]);
  builder.oAuthAccessToken(credentials[2], credentials[3]);
  const twitter = builder.build();
  const timeline = twitter.v1().timelines().getHomeTimeline();
  for (const status of timeline) {
    print(status.getUser().getName() + ": " + status.getText());
  }
}
