/**
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var TwitterFactory = Java.type("twitter4j.TwitterFactory");
var twitter = TwitterFactory.singleton;
var timeline = twitter.homeTimeline;
for each (status in timeline) {
  print(status.user.name + ":" + status.text);
}
