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
        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        Control.btnCompile_click = function () {
            // Reset the compiler each time the compiler is clicked
            this.init();
            this.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            lexResults = _Lexer.lex();
            console.log(lexResults);
            // Iterate through each program result
            for (var i = 0; i < lexResults.length; i++) {
                // Check if there were warnings
                if (lexResults[i].warnings.length != 0) {
                    lexWarning = true;
                }
                else {
                    lexWarning = false;
                }
                // Check if there were errors
                if (lexResults[i].errors.length != 0) {
                    this.beginLexLog(i);
                    // Save the previous program error state
                    prevProgramError = true;
                    this.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    lexError = true;
                }
                // If no tokens are found, save the lex complete state
                else if (lexResults[i].tokens.length == 0) {
                    isLexComplete = true;
                }
                // Otherwise continue to output the lex log
                else {
                    this.beginLexLog(i);
                    prevProgramError = false;
                }
                if (lexResults[i].complete) {
                    isLexComplete = true;
                }
                // If the user tried to compile without typing any code besides comments, throw error
                if (!programDetected) {
                    this.putMessage(INFO + "\tCompilation failed due to no actual code. This isn't a text editor.");
                }
                // . . . and parse!
                //this.parse();
            }
        };
        // Helper function for duplicated code
        Control.beginLexLog = function (programIndex) {
            // Errors mean there was typed code
            programDetected = true;
            this.putMessage(INFO + "\tCompiling Program " + programCount);
            // Log/output the lexer analysis results
            this.lexerLog(lexResults, programIndex);
            // Increment the program count
            programCount++;
        };
        Control.putMessage = function (msg) {
            document.getElementById("output").value += msg + "\n";
        };
        Control.lexerLog = function (lexResults, programIndex) {
            console.log("lex log began");
            // Print all tokens
            for (var i = 0; i < lexResults[programIndex].tokens.length; i++) {
                console.log("token " + i + ": " + lexResults[programIndex].tokens[i]);
                this.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value
                    + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
            }
            // Print all warnings
            if (lexWarning) {
                for (var i = 0; i < lexResults[programIndex].warnings.length; i++) {
                    // Check for EOP warning
                    if (lexResults[programIndex].warnings[programIndex].type == "NO EOP" /* W_NO_EOP */) {
                        this.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [$] detected at end-of-file. Adding to end-of-file for you.");
                        // Insert an EOP into the tokens array
                        lexResults[programIndex].tokens.push(new JuiceC.Token(JuiceC.TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                    }
                }
            }
            // Print all errors
            for (var i = 0; i < lexResults[programIndex].errors.length; i++) {
                // Invalid token check
                if (lexResults[programIndex].errors[i].type == "INVALID TOKEN" /* E_INVALID_T */) {
                    this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized or Invalid Token [ " + lexResults[programIndex].errors[i].value
                        + " ] found at (" + lexResults[programIndex].errors[i].lineNumber + ":" + lexResults[programIndex].errors[i].colNumber + ")");
                }
                // Missing end of comment
                else if (lexResults[programIndex].errors[i].type == "NO END COMMENT" /* E_NO_END_COMMENT */) {
                    this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at ("
                        + lexResults[programIndex].errors[i].lineNumber + " col " + lexResults[programIndex].errors[i].colNumber);
                }
                // Missing end of string quote
                else if (lexResults[programIndex].errors[i].type == "NO END QUOTE" /* E_NO_END_QUOTE */) {
                    this.putMessage("LEXER -> | ERROR: Missing ending quote for String literal starting on line  "
                        + lexResults[programIndex].errors[i].lineNumber + ":" + lexResults[programIndex].errors[i].colNumber + ")");
                }
            }
            this.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
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
