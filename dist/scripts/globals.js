/*
    globals.ts
        All global variables can be found here.
*/
// Global classes
var _Lexer;
var _Control;
var _Utils;
// String constants
var INFO = "INFO";
var DEBUG = "DEBUG";
var tokens = "";
var tokenIndex = 0;
var currentToken = "";
var errorCount = 0;
var EOF = "$";
// Regex
var rLBRACE = new RegExp('{$'); // Left Brace
var rRBRACE = new RegExp('}$'); // Right brace
var rPRINT = new RegExp('print$'); // Print
var rLPAREN = new RegExp('\\($'); // Left Paren
var rRPAREN = new RegExp('\\)$'); // Right paren
var rASSIGN = new RegExp('\=$'); // Assignment operator
var rWHILE = new RegExp('while$'); // While
var rIF = new RegExp('if$'); // If
var rQUOTE = new RegExp('"$'); // Quote
var rTYPEINT = new RegExp('int$'); // Integer type
var rTYPEBOOL = new RegExp('boolean$'); // Boolean type
var rTYPESTR = new RegExp('string$'); // String type
var rCHAR = new RegExp('[a-z]$'); // Character
var rSPACE = new RegExp(' $'); // Space
var rDIGIT = new RegExp('[0-9]$'); // Digit
var rEOP = new RegExp('\\$$'); // EOP
var rID = new RegExp('[a-z]$'); // ID
var rBOOLOPEQUALS = new RegExp('\=\=$'); // Boolean operator equals
var rBOOLOPNOTEQUALS = new RegExp('\\!\=$'); // Boolean operator not equals
var rBOOLVALTRUE = new RegExp('true$'); // Boolean true value
var rBOOLVALFALSE = new RegExp('false$'); // Boolean false value
var rINTOP = new RegExp('\\+$'); // Integer operation
var rWHITESPACE = new RegExp(' $|\t$|\n$|\r$'); // Whitespace
var rNEWLINE = new RegExp('\n$'); // New line
var rCOMMENTSTART = new RegExp('/\\*$'); // Start of comment
var rCOMMENTEND = new RegExp('\\*/$'); // End of comment
var onDocumentLoad = function () {
    JuiceC.Control.init();
};
