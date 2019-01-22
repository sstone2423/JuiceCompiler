/*
    globals.ts
        All global variables can be found here.
*/

// Global variables
let _Lexer: JuiceC.Lexer;
let _Control: JuiceC.Control;
let _Utils: JuiceC.Utils;
let tokens: string = "";
let tokenIndex: number = 0;
let currentToken: string = "";
let errorCount: number = 0;
const EOF: string = "$";

let onDocumentLoad = () => {
    JuiceC.Control.init();
};