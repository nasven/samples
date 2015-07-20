function renderName(ctx) {
  var name = ctx.getPathTokens().get("name");
  print("Hello ${name}");
  ctx.render("[renderName] Hello <${name}>!\n");
}
