/**
 * This is a Camel sample application. Requires Apache Camel Core library in classpath,
 * and Scripting extension of Nashorn.
 *
 * Author: Niko Köbler, http://www.n-k.de, @dasniko
 * Since: 2015
 */
var Main = Packages.org.apache.camel.main.Main;
var RouteBuilder = Packages.org.apache.camel.builder.RouteBuilder;

var myRouteBuilder = Java.extend(RouteBuilder);
var route = new myRouteBuilder() {
  configure: function() {
    var _super = Java.super(route);
    _super
      .from("file://.?fileName=hello.txt&noop=true")
      .to("log:nasven?showAll=true")
      .to("file://target");
  }
};

var mainCamel = new Main();
mainCamel.enableHangupSupport();
mainCamel.addRouteBuilder(route);
mainCamel.run();
