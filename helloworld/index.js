/**
 * Author: Bruno Borges (@brunoborges)
 * Updated for GraalJS ES2024.
 */
const suppliedArguments = Array.from(arguments);

console.log("Hello from Nasven on GraalJS");
console.log("Arguments: " + JSON.stringify(suppliedArguments));
if (suppliedArguments.length > 0) {
  console.log("First argument: " + suppliedArguments[0]);
}
