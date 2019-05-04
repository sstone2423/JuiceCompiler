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
const INFO: string = "INFO";
const DEBUG: string = "DEBUG";
const LEXER: string = "Lexer";
const PARSER: string = "Parser";
const SEMANTIC: string = "Semantic";
const CODEGEN: string = "Code Gen";
const VALID: string = "VALID";
const EOF: string = "$";
const SCOPE: string = "SCOPE";
const WARNING: string = "WARNING";
const ERROR: string = "ERROR";
const ZERO: string = "0";
const BACKPATCH: string = "Backpatching";
const TRUE: string = "true";
const FALSE: string = "false";

// Start with an active verboseCheck
let onDocumentLoad = () => {
    (<HTMLInputElement>document.getElementById("verboseCheck")).checked = true;
};