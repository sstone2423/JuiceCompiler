/**
 *  globals.ts
 *
 *  All global variables can be found here.
 */
// Global classes
var _Lexer;
var _Parser;
var _Control;
var _CodeGen;
// String constants
var INFO = "INFO";
var DEBUG = "DEBUG";
var LEXER = "Lexer";
var PARSER = "Parser";
var SEMANTIC = "Semantic";
var CODEGEN = "Code Gen";
var VALID = "VALID";
var EOF = "$";
var SCOPE = "SCOPE";
var WARNING = "WARNING";
var ERROR = "ERROR";
var ZERO = "0";
var BACKPATCH = "Backpatching";
var TRUE = "true";
var FALSE = "false";
// Start with an active verboseCheck
var onDocumentLoad = function () {
    document.getElementById("verboseCheck").checked = true;
};
