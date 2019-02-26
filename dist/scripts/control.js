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
            this.programDetected = false;
            this.lexResults = [];
            this.lexWarning = false;
            this.lexError = false;
            this.parseResults = [];
            this.parseError = false;
        }
        // Set the initial values for our globals
        Control.init = function () {
            _Control = new Control();
            _Lexer = new JuiceC.Lexer();
            _Parser = new JuiceC.Parser();
        };
        // Output a message to the HTML output log
        Control.putMessage = function (msg) {
            document.getElementById("output").value += msg + "\n";
        };
        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        Control.btnCompile_click = function () {
            // Reset the compiler each time the compiler is clicked
            Control.init();
            Control.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            _Control.lexResults = _Lexer.lex();
            console.log(_Control.lexResults);
            // Iterate through each program result
            for (var i = 0; i < _Control.lexResults.length; i++) {
                // Check if there were warnings
                if (_Control.lexResults[i].warnings.length != 0) {
                    _Control.lexWarning = true;
                }
                else {
                    _Control.lexWarning = false;
                }
                // Output the log if there are any errors
                if (_Control.lexResults[i].errors.length != 0) {
                    _Control.prepareLexLog(i);
                    Control.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    _Control.lexError = true;
                }
                // If no tokens are found, output an error
                else if (_Control.lexResults[i].tokens.length == 0) {
                    Control.putMessage(INFO + "\tCompilation failed due to no tokens being found. Where's the code?");
                } // Otherwise continue to output the lex log
                else {
                    _Control.prepareLexLog(i);
                    // Only parse if there were no errors. No need to waste time and resources
                    Control.putMessage(INFO + "\tParsing Program " + i);
                    var parseResult = _Parser.parse(_Control.lexResults[i].tokens);
                    if (parseResult.errors.length != 0) {
                        _Control.parserLog(parseResult);
                    }
                }
            }
        };
        // Swaps programDetected boolean to true, outputs the program that is being compiled, and begins the lexerLog
        Control.prototype.prepareLexLog = function (programIndex) {
            // Errors mean there was typed code
            _Control.programDetected = true;
            Control.putMessage(INFO + "\tCompiling Program " + (programIndex + 1));
            // Log/output the lexer analysis results
            _Control.lexerLog(_Control.lexResults, programIndex);
        };
        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        Control.prototype.lexerLog = function (lexResults, programIndex) {
            if (document.getElementById("verboseCheck").checked) {
                // Print all tokens
                for (var i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    console.log("token " + i + ": " + lexResults[programIndex].tokens[i]);
                    Control.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value
                        + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (_Control.lexWarning) {
                    console.log("entered lexerlog if lexWarning if statement");
                    for (var i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[programIndex].type == "NO EOP" /* W_NO_EOP */) {
                            Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new JuiceC.Token(JuiceC.TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        }
                    }
                }
                // Print all errors
                for (var i = 0; i < lexResults[programIndex].errors.length; i++) {
                    console.log("lexresults" + i + ": " + lexResults[programIndex].errors[i].errorType);
                    // Invalid token check
                    if (lexResults[programIndex].errors[i].errorType == "Invalid Token" /* E_INVALID_T */) {
                        Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token [ " + lexResults[programIndex].errors[i].value
                            + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of comment
                    else if (lexResults[programIndex].errors[i].errorType == "No End Comment" /* E_NO_END_COMMENT */) {
                        Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at ("
                            + lexResults[programIndex].errors[i].lineNum + " col " + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of string quote
                    else if (lexResults[programIndex].errors[i].errorType == "No End Quote" /* E_NO_END_QUOTE */) {
                        Control.putMessage("LEXER -> | ERROR: Missing ending quote for string literal starting at ("
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Invalid token in string
                    else if (lexResults[programIndex].errors[i].errorType == "Invalid Token in String" /* E_INVALID_T_STRING */) {
                        Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in string literal [ " + lexResults[programIndex].errors[i].value
                            + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only lowercase characters a - z are allowed");
                    }
                    // Invalid token in comment
                    else if (lexResults[programIndex].errors[i].errorType == "Invalid Token in Comment" /* E_INVALID_T_COMMENT */) {
                        Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in comment [ " + lexResults[programIndex].errors[i].value
                            + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only characters and digits are allowed");
                    }
                    // Invalid new line
                    else if (lexResults[programIndex].errors[i].errorType == "Invalid New Line" /* E_INVALID_NEW_LINE */) {
                        Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Invalid New Line used [ " + lexResults[programIndex].errors[i].value
                            + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - New lines are not allowed in comments");
                    }
                }
            }
            Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        };
        Control.prototype.parserLog = function (parseResult) {
            if (document.getElementById("verboseCheck").checked) {
                // Print all errors
                for (var i = 0; i < parseResult.errors.length; i++) {
                }
            }
            Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors.length + " ERROR(S)");
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
