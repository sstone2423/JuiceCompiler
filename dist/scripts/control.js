///<reference path="globals.ts" />
/*
    control.ts
        Methods and variables for use with the index.html . All changes and functionality of the HTML
        should be here.
*/
var JuiceC;
(function (JuiceC) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.init = function () {
            // Set the initial values for our globals
            _Control = new Control();
            _Lexer = new JuiceC.Lexer();
            _Utils = new JuiceC.Utils();
            tokens = "";
            tokenIndex = 0;
            currentToken = ' ';
            errorCount = 0;
        };
        Control.btnCompile_click = function () {
            // This is executed as a result of the user pressing the "compile" button between the two text areas, above.  
            // Note the <input> element's event handler: onclick="btnCompile_click();
            this.init();
            this.putMessage("Compilation Started");
            // Grab the tokens from the lexer . . .
            lexResults = _Lexer.lex();
            console.log(lexResults);
            if (lexResults.warnings.length != 0) {
                lexWarning = true;
            }
            if (lexResults.errors.length != 0) {
                programDetected = true; // we know a program was detected, aka user actually typed code besides comments
                this.putMessage("______________________________");
                this.putMessage("Compiling Program " + programCount + " . . .\n");
                this.lexerLog(lexResults, programCount);
                programCount++;
                prevProgramError = true;
                this.putMessage("Compilation stopped due to Lexer errors . . .");
                lexError = true;
            } // No tokens were found but lex completed, meaning that there is no more input to lex
            else if (lexResults.tokens.length == 0) {
                isLexComplete = true;
            }
            else {
                programDetected = true; // we know a program was detected, aka user actually typed code besides comments
                this.putMessage("______________________________");
                this.putMessage("Compiling Program " + programCount + " . . .\n");
                this.lexerLog(lexResults, programCount);
                prevProgramError = false;
                programCount++;
            }
            if (lexResults.complete) {
                isLexComplete = true;
            }
            // If the user tried to compile without typing any code besides comments, throw error
            if (!programDetected) {
                this.putMessage("Why are you trying to compile zero code? Cheese and crackers, you dimwit. Go eat a sock.");
            }
            // . . . and parse!
            //this.parse();
        };
        Control.putMessage = function (msg) {
            document.getElementById("output").value += msg + "\n";
        };
        Control.lexerLog = function (lexerResults, programCount) {
            this.putMessage("Lexical Analysis:");
            // Print all warnings
            for (var i = 0; i < lexResults.warnings.length; i++) {
                if (lexResults.warnings[i].type == "NO EOP" /* W_NO_EOP */) {
                    this.putMessage("LEXER -> | WARNING: No EOP [$] detected at end-of-file. Adding to end-of-file...");
                    // Insert an EOP into the tokens array
                    lexResults.tokens.push(new JuiceC.Token(JuiceC.TokenType.T_EOP, "$", lexResults.line, lexResults.col));
                }
            }
            // Print all errors
            for (var i = 0; i < lexResults.errors.length; i++) {
                // Invalid token check
                if (lexResults.errors[i].type == "INVALID TOKEN" /* E_INVALID_T */) {
                    this.putMessage("LEXER -> | ERROR: Unrecognized or Invalid Token [ " + lexResults.errors[i].value
                        + " ] on line " + lexResults.errors[i].lineNumber + " col " + lexResults.errors[i].colNumber);
                }
                // Missing end of comment
                else if (lexResults.errors[i].type == "NO END COMMENT" /* E_NO_END_COMMENT */) {
                    this.putMessage("LEXER -> | ERROR: Missing ending comment brace (*/) for comment starting on line  "
                        + lexResults.errors[i].lineNumber + " col " + lexResults.errors[i].colNumber);
                }
                // Missing end of string quote
                else if (lexResults.errors[i].type == "NO END QUOTE" /* E_NO_END_QUOTE */) {
                    this.putMessage("LEXER -> | ERROR: Missing ending quote for String literal starting on line  "
                        + lexResults.errors[i].lineNumber + " col " + lexResults.errors[i].colNumber);
                }
            }
            this.putMessage("\n");
            this.putMessage("Lexical Analysis complete! " + lexResults.warnings.length + " WARNING(S) and " + lexResults.errors.length + " ERROR(S)");
            this.putMessage("-------------------------");
        };
        Control.parse = function () {
            this.putMessage("Parsing [" + tokens + "]");
            // Grab the next token.
            currentToken = this.getNextToken();
            // A valid parse derives the G(oal) production, so begin there.
            this.parseG();
            // Report the results.
            this.putMessage("Parsing found " + errorCount + " error(s).");
        };
        Control.parseG = function () {
            // A G(oal) production can only be an E(xpression), so parse the E production.
            this.parseE();
        };
        Control.parseE = function () {
            // All E productions begin with a digit, so make sure that we have one.
            this.checkToken("digit");
            // Look ahead 1 char (which is now in currentToken because checkToken 
            // consumes another one) and see which E production to follow.
            if (currentToken != EOF) {
                // We're not done, we expect to have an op.
                this.checkToken("op");
                this.parseE();
            }
            else {
                // There is nothing else in the token stream, 
                // and that's cool since E --> digit is valid.
                this.putMessage("EOF reached");
            }
        };
        Control.checkToken = function (expectedKind) {
            // Validate that we have the expected token kind and get the next token.
            switch (expectedKind) {
                case "digit":
                    this.putMessage("Expecting a digit");
                    if (currentToken == "0" || currentToken == "1" || currentToken == "2" ||
                        currentToken == "3" || currentToken == "4" || currentToken == "5" ||
                        currentToken == "6" || currentToken == "7" || currentToken == "8" ||
                        currentToken == "9") {
                        this.putMessage("Got a digit!");
                    }
                    else {
                        errorCount++;
                        this.putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
                    }
                    break;
                case "op":
                    this.putMessage("Expecting an operator");
                    if (currentToken == "+" || currentToken == "-") {
                        this.putMessage("Got an operator!");
                    }
                    else {
                        errorCount++;
                        this.putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
                    }
                    break;
                default:
                    this.putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
                    break;
            }
            // Consume another token, having just checked this one, because that 
            // will allow the code to see what's coming next... a sort of "look-ahead".
            currentToken = this.getNextToken();
        };
        Control.getNextToken = function () {
            var thisToken = EOF; // Let's assume that we're at the EOF.
            if (tokenIndex < tokens.length) {
                // If we're not at EOF, then return the next token in the stream and advance the index.
                thisToken = tokens[tokenIndex];
                this.putMessage("Current token:" + thisToken);
                tokenIndex++;
            }
            return thisToken;
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
