/*
    globals.ts
        All global variables can be found here.
*/

// Global classes
let _Lexer: JuiceC.Lexer;
let _Parser: JuiceC.Parser;
let _Control: JuiceC.Control;
let _Utils: JuiceC.Utils;

// String constants
const INFO: string = "INFO";
const DEBUG: string = "DEBUG";
const LEXER: string = "Lexer";
const EOF: string = "$";

let programCount: number = 0;
let programDetected: boolean = false;
let lexResults = [];
let lexWarning: boolean = false;
let lexError: boolean = false;
let tokenIndex: number = 0;
let currentToken: string = "";
let errorCount: number = 0;

// Regex
const rLBRACE = new RegExp('{$'); // Left Brace
const rRBRACE = new RegExp('}$'); // Right brace
const rPRINT = new RegExp('print$'); // Print
const rLPAREN = new RegExp('\\($'); // Left Paren
const rRPAREN = new RegExp('\\)$'); // Right paren
const rASSIGN = new RegExp('\=$'); // Assignment operator
const rWHILE = new RegExp('while$'); // While
const rIF = new RegExp('if$'); // If
const rQUOTE = new RegExp('"$'); // Quote
const rTYPEINT = new RegExp('int$'); // Integer type
const rTYPEBOOL = new RegExp('boolean$'); // Boolean type
const rTYPESTR = new RegExp('string$'); // String type
const rCHAR = new RegExp('[a-z]$'); // Character
const rSPACE = new RegExp(' $'); // Space
const rDIGIT = new RegExp('[0-9]$'); // Digit
const rEOP = new RegExp('\\$$'); // EOP
const rID = new RegExp('[a-z]$'); // ID
const rBOOLOPEQUALS = new RegExp('\=\=$'); // Boolean operator equals
const rBOOLOPNOTEQUALS = new RegExp('\\!\=$'); // Boolean operator not equals
const rBOOLVALTRUE = new RegExp('true$'); // Boolean true value
const rBOOLVALFALSE = new RegExp('false$'); // Boolean false value
const rINTOP = new RegExp('\\+$'); // Integer operation
const rWHITESPACE = new RegExp(' $|\t$|\n$|\r$'); // Whitespace
const rNEWLINE = new RegExp('\n$'); // New line
const rCOMMENTSTART = new RegExp('/\\*$'); // Start of comment
const rCOMMENTEND = new RegExp('\\*/$'); // End of comment

let onDocumentLoad = () => {
    (<HTMLInputElement>document.getElementById("verboseCheck")).checked = true;
    JuiceC.Control.init();
};