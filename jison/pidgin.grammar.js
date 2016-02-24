var grammar = {

  "lex": {
    "rules": [

      ["\\s+",                    "/* skip whitespace */"],

      [/^\[[^\]]+\]/,                 "return 'ESCAPED_IDENTIFIER'"],

      [/^set/i,                    "return 'SET'"],
      [/^null/i,                   "return 'NULL'"],
      [/^true/i,                   "return 'TRUE'"],
      [/^false/i,                  "return 'FALSE'"],

      ["[0-9]+(?:\\.[0-9]+)?\\b", "return 'NUMBER'"],
      ["[a-zA-Z][a-zA-Z0-9]*",    "return 'IDENTIFIER'"],

      //Matches string literals, delimited by a pair of double or single quotes
      ['("[^"]*")|(\'[^\'])*\'',  "return 'STRING'"],

      //Boolean-valued operators
      ["<=",                      "return '<='"],
      [">=",                      "return '>='"],
      ["<>",                      "return '!='"],
      ["<",                       "return '<'"],
      [">",                       "return '>'"],
      ["=",                       "return '='"],
      ["!=",                      "return '!='"],

      ["\\|\\|",                  "return '||'"],
      ["&&",                      "return '&&'"],

      ["\\*",                     "return '*'"],
      ["\\/",                     "return '/'"],
      ["-",                       "return '-'"],
      ["\\+",                     "return '+'"],
      ["\\^",                     "return '^'"],
      ["!",                       "return '!'"],
      ["%",                       "return '%'"],
      ["\\(",                     "return '('"],
      ["\\)",                     "return ')'"],
      ["\\[",                     "return '['"],
      ["\\]",                     "return ']'"],

      //Property acces operator
      ["\\.",                     "return '.'"],

      [",",                       "return ','"],

      ["\\?",                      "return '?'"],

      [":",                       "return ':'"],

      [";",                       "return ';'"],

      ["$",                       "return 'EOF'"]
    ]
  },

  "operators": [
    ["left", "<", ">", "<=", ">=", "!="]
  ],

  "start": "Start",

  "bnf": {
    "Start": [["Expressions EOF", "return $1"]],

    "Expressions": [
      ["Empty", ""],
      ["Expression", "$$ = [$1]"],
      ["Expressions ; Expression", "$$ = $1; $1.push($3);"],
      ["Expressions ;", "$$ = $1;"]
    ],

    "Expression": [
      ["AssignmentExpression", "$$ = $1"]
    ],

    "AssignmentExpression": [
      ["ConditionalExpression", "$$ = $1"],

      /*
       * Assignment expressions must be right associative, so "SET x = SET y = 1" is parsed as
       * SET x = (SET y = 1)
       */
      ["SET MemberAccessExpression = AssignmentExpression", "$$ = {type: 'assignmentExpression', lhs: $2, rhs: $4}"]
    ],

    "ConditionalExpression": [
      ["OrExpression", "$$ = $1"],
      ["OrExpression ? AssignmentExpression : AssignmentExpression",
        "$$ = {type: 'shortConditional', condition: $1, trueExpression: $3, falseExpression: $5}"]
    ],

    "OrExpression": [
      ["AndExpression", "$$ = $1"],
      ["AndExpression || OrExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "AndExpression": [
      ["EqualityExpression", "$$ = $1"],
      ["EqualityExpression && AndExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "EqualityExpression": [
      ["RelationalExpression", "$$ = $1"],
      ["RelationalExpression = EqualityExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "RelationalExpression": [
      ["AdditiveExpression", "$$ = $1"],
      ["AdditiveExpression RelationalOperator RelationalExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "AdditiveExpression": [
      ["MultiplicativeExpression", "$$ = $1"],
      ["MultiplicativeExpression + AdditiveExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"],
      ["MultiplicativeExpression - AdditiveExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "MultiplicativeExpression": [
      ["UnaryExpression", "$$ = $1"],
      ["UnaryExpression * MultiplicativeExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"],
      ["UnaryExpression / MultiplicativeExpression", "$$ = {type: 'binaryExpression', operator: $2, left: $1, right: $3}"]
    ],

    "UnaryExpression": [
      ["MemberAccessExpression", "$$ = $1"]
    ],

    "MemberAccessExpression": [
      ["PrimaryExpression", "$$ = $1"],
      ["PrimaryExpression . MemberAccessExpression", "$$ = {type: 'memberAccess', context: $1, member: $3}"],
      ["PrimaryExpression [ Expression ]", "$$ = {type: 'memberAccess', context: $1, member: $3}"],
      ["PrimaryExpression ( ArgumentList )", "$$ = {type: 'functionCall', callee: $1, arguments: $3}"],
      ["PrimaryExpression ( )", "$$ = {type: 'functionCall', callee: $1, arguments: []}"]
    ],

    "ArgumentList": [
      ["Expression", "$$ = [$1]"],
      ["Expression , ArgumentList", "$$ = $3; $3.unshift($1)"]
    ],

    "PrimaryExpression": [
      ["( Expression )", "$$ = $2"],
      ["Identifier", "$$ = $1"],
      ["NumberLiteral", "$$ = $1"],
      ["StringLiteral", "$$ = $1"],
      ["BooleanLiteral", "$$ = $1"],
      ["NullLiteral", "$$ = 1"]
    ],

    "Identifier": [
      ["ESCAPED_IDENTIFIER", "$$ = {type: 'identifier', name: yytext.substr(1, yytext.length - 2), location: {firstLine: @1.first_line, firstColumn: @1.first_column}};"],
      ["IDENTIFIER", "$$ = {type:'identifier', name: yytext}"]
    ],

    "StringLiteral": [
      ["STRING", "$$ = {type: 'stringLiteral', value: yytext}"]
    ],

    "NumberLiteral": [
      ["NUMBER", "$$ = {type: 'numberLiteral', value: +yytext}"]
    ],

    "BooleanLiteral": [
      ["TRUE", "$$ = {type: 'booleanLiteral', value: true}"],
      ["FALSE", "$$ = {type: 'booleanLiteral', value: false}"]
    ],

    "NullLiteral": [
      ['NULL', "$$ = {type:'nullLiteral', value: null}"]
    ],

    "RelationalOperator": [
      ["<", "$$ = yytext"],
      [">", "$$ = yytext"],
      ["<=", "$$ = yytext"],
      [">=", "$$ = yytext"],
      ["!=", "$$ = yytext"]
    ]

  }
};

module.exports = grammar;