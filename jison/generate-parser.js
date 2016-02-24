var Generator = require("jison").Generator;
var Parser = require("jison").Parser;
var fs = require('fs');
var grammar = require('./pidgin.grammar');

var generator = new Generator(grammar, {moduleType: 'amd'});
var parser = new Parser(grammar);

console.log(parser.parse('a.b.c()'));

fs.writeFile('../dist/es6/parser.js', generator.generate(), function(err) {
  if (err) console.error(err.message);
});
