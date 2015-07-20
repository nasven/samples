/**
 * This is a sample application of Ratpack.IO using Nashorn. 
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var RatpackServer = Packages.ratpack.server.RatpackServer;

require('renderWorld.js');
require('renderName.js');
require('renderName.js');

RatpackServer.start(function (server) { server 
  .handlers(function (chain) { 
     chain
    .get(function(ctx){renderWorld(ctx);})
    .get(":name",function(ctx){renderName(ctx);});
  })
});

Nasven.daemon();
