/*
    globals.ts
        All global variables can be found here.
*/
// Global variables
var _Lexer;
var _Control;
var _Utils;
var tokens = "";
var tokenIndex = 0;
var currentToken = "";
var errorCount = 0;
var EOF = "$";
var onDocumentLoad = function () {
    JuiceC.Control.init();
};
