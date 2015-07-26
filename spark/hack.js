function stop() {
  var stopMethod = Spark.class.getMethod("stop");
  stopMethod.setAccessible(true);
  stopMethod.invoke(null);
}
