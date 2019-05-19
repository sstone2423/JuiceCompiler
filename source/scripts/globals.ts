/**
 *  globals.ts
 * 
 *  All global variables can be found here.
 */

// Global classes
let _Lexer: JuiceC.Lexer;
let _Parser: JuiceC.Parser;
let _Control: JuiceC.Control;
let _CodeGen: JuiceC.CodeGen;

// String constants
const INFO = "INFO";
const DEBUG = "DEBUG";
const LEXER = "Lexer";
const PARSER = "Parser";
const SEMANTIC = "Semantic";
const CODEGEN = "Code Gen";
const VALID = "VALID";
const EOF = "$";
const SCOPE = "SCOPE";
const WARNING = "WARNING";
const ERROR = "ERROR";
const ZERO = "0";
const BACKPATCH = "Backpatching";
const TRUE = "true";
const FALSE = "false";

// Start with an active verboseCheck
let onDocumentLoad = () => {
    (<HTMLInputElement>document.getElementById("verboseCheck")).checked = true;
};
