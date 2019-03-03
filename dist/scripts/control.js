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
            _Control.cstVisual = {
                chart: {
                    container: "#tree-cst"
                },
                nodeStructure: {}
            };
        };
        // Output a message to the HTML output log
        Control.putMessage = function (msg) {
            document.getElementById("output").value += msg + "\n";
        };
        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        Control.btnCompile_click = function () {
            // Reset the compiler each time the compiler is clicked
            Control.init();
            _Control.treantCST = {
                chart: {
                    container: "#tree-cst"
                },
                nodeStructure: {
                    text: { name: "Root" },
                    children: []
                }
            };
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
                    Control.putMessage(INFO + "\tParsing Program " + (i + 1));
                    var parseResult = _Parser.parse(_Control.lexResults[i].tokens);
                    _Control.parserLog(parseResult, i);
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
                    Control.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value
                        + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (_Control.lexWarning) {
                    for (var i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[programIndex].type == "NO EOP" /* W_NO_EOP */) {
                            Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new JuiceC.Token(JuiceC.TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        }
                        else {
                            Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: Not really sure why I'm warning so oops?");
                        }
                    }
                }

                // Print all errors
                for (var i = 0; i < lexResults[programIndex].errors.length; i++) {
                    switch (lexResults[programIndex].errors[i].errorType) {
                        // Invalid Token check
                        case "Invalid Token" /* E_INVALID_T */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token" /* E_INVALID_T */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Missing end of comment
                        case "No End Comment" /* E_NO_END_COMMENT */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Missing end of string quote
                        case "No End Quote in string literal" /* E_NO_END_QUOTE */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "No End Quote in string literal" /* E_NO_END_QUOTE */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Invalid token in string
                        case "Invalid Token in string literal" /* E_INVALID_T_STRING */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token in string literal" /* E_INVALID_T_STRING */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only lowercase characters a - z are allowed");
                            break;
                        }
                        // Invalid token in comment
                        case "Invalid Token" /* E_INVALID_T */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token in Comment" /* E_INVALID_T_COMMENT */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only characters and digits are allowed");
                            break;
                        }
                        // Invalid new line
                        case "Invalid New Line" /* E_INVALID_NEW_LINE */: {
                            Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid New Line" /* E_INVALID_NEW_LINE */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments");
                            break;
                        }
                        // Unknown error
                        default: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: Unknown error found [ " + lexResults[programIndex].errors[i].value
                                + " ] at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Oops");
                            break;
                        }
                    }

                }
            }
            Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        };
        Control.prototype.parserLog = function (parseResult, programIndex) {
            if (document.getElementById("verboseCheck").checked) {
                // Print valid tokens that were consumed
                for (var j = 0; j < parseResult.valids.length; j++) {
                    Control.putMessage(parseResult.valids[j]);
                }
                // Print all errors with grammar details about how to fix the errors
                for (var i = 0; i < parseResult.errors.length; i++) {
                    switch (parseResult.errors[i].errorType) {
                        // Block expected
                        case "Block Expected" /* E_BLOCK_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Block Expected" /* E_BLOCK_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Block
                                + " ::== <strong>{</strong> " + JuiceC.Production.StatementList + " <strong>}</strong>");
                            break;
                        }
                        // PrintStatement expected
                        case "Print Statement Expected" /* E_PRINT_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Print Statement Expected" /* E_PRINT_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.PrintStatement
                                + " ::== <strong>print (</strong> " + JuiceC.Production.Expr + " <strong>)</strong>");
                            break;
                        }
                        // AssignmentStatement Expected
                        case "Assignment Statement Expected" /* E_ASSIGNMENT_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Assignment Statement Expected" /* E_ASSIGNMENT_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.AssignStatement
                                + " ::== " + JuiceC.Production.Id + " <strong>=</strong> " + JuiceC.Production.Expr);
                            break;
                        }
                        // Expr Expected
                        case "Expression Expected" /* E_EXPR_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Expression Expected" /* E_EXPR_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Expr
                                + " ::== " + JuiceC.Production.IntExpr + " or " + JuiceC.Production.StringExpr + " or " + JuiceC.Production.BooleanExpr + " or " + JuiceC.Production.Id);
                            break;
                        }
                        // VarDecl Expected
                        case "Variable Declaration Expected" /* E_VAR_DECL_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Variable Declaration Expected" /* E_VAR_DECL_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - "
                                + JuiceC.Production.VarDeclaration + " ::== " + JuiceC.Production.Type + " " + JuiceC.Production.Id);
                            break;
                        }
                        // WhileStatement Expected
                        case "While Statement Expected" /* E_WHILE_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "While Statement Expected" /* E_WHILE_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.WhileStatement
                                + " ::== <strong>while</strong> " + JuiceC.Production.BooleanExpr + " " + JuiceC.Production.Block);
                            break;
                        }
                        // IfStatement Expected
                        case "If Statement Expected" /* E_IF_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "If Statement Expected" /* E_IF_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.IfStatement
                                + " ::== <strong>if</strong> " + JuiceC.Production.BooleanExpr + " " + JuiceC.Production.Block);
                            break;
                        }
                        // IntExpr Expected
                        case "Integer Expression Expected" /* E_INT_EXPR_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Integer Expression Expected" /* E_INT_EXPR_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.IntExpr
                                + " ::==  " + JuiceC.Production.Digit + " " + JuiceC.Production.IntOp + " " + JuiceC.Production.Expr + " OR ::== " + JuiceC.Production.Digit);
                            break;
                        }
                        // StringExpr Expected
                        case "String Expression Expected" /* E_STRING_EXPR_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "String Expression Expected" /* E_STRING_EXPR_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.StringExpr
                                + " ::== <strong>\"</strong> " + JuiceC.Production.CharList + " " + " \"");
                            break;
                        }
                        // BoolExpr Expected
                        case "Boolean Expression Expected" /* E_BOOL_EXPR_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Expression Expected" /* E_BOOL_EXPR_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.BooleanExpr
                                + " ::== <strong>(</strong> " + JuiceC.Production.Expr + " " + JuiceC.Production.BoolOp + " " + JuiceC.Production.Expr + " <strong>)</strong>");
                            break;
                        }
                        // Id Expected
                        case "ID Expected" /* E_ID_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "ID Expected" /* E_ID_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Id
                                + " ::== " + JuiceC.Production.Char);
                            break;
                        }
                        // Type Expected
                        case "Type Expected" /* E_TYPE_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Type Expected" /* E_TYPE_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Type
                                + " ::== <strong>int</strong> | <strong>string</strong> | <strong>boolean</strong>");
                            break;
                        }
                        // Char Expected
                        case "Character Expected" /* E_CHAR_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Character Expected" /* E_CHAR_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Char
                                + " ::== <strong>a</strong> | <strong>b</strong> | <strong>c</strong> ... <strong>z</strong>");
                            break;
                        }
                        // Space Expected
                        case "Space Expected" /* E_SPACE_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Space Expected" /* E_SPACE_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Space
                                + " ::== the <strong>space</strong> character");
                            break;
                        }
                        // Digit Expected
                        case "Digit Expected" /* E_DIGIT_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Digit Expected" /* E_DIGIT_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.Digit
                                + " ::== <strong>0</strong> | <strong>1</strong> | <strong>2</strong> ... <strong>9</strong>");
                            break;
                        }
                        // BoolOp Expected
                        case "Boolean Operation Expected" /* E_BOOL_OP_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Operation Expected" /* E_BOOL_OP_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.BoolOp
                                + " ::== <strong>==</strong> | <strong>!=</strong>");
                            break;
                        }
                        // BoolVal Expected
                        case "Boolean Value Expected" /* E_BOOL_VAL_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Value Expected" /* E_BOOL_VAL_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.BoolVal
                                + " ::== <strong>false</strong> | <strong>true</strong>");
                            break;
                        }
                        // IntOp Expected
                        case "Integer Operation Expected" /* E_INT_OP_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Integer Operation Expected" /* E_INT_OP_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - " + JuiceC.Production.IntOp
                                + " ::== <strong>+</strong>");
                            break;
                        }
                        // Token Expected
                        case "Token Expected" /* E_TOKEN_EXPECTED */: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: " + "Token Expected" /* E_TOKEN_EXPECTED */ + " - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - Unable to find token");
                            break;
                        }
                        // Unknown error
                        default: {
                            Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: Unknown error - found [ " + parseResult.errors[i].value
                                + " ] at ( " + parseResult.errors[i].lineNum + ":" + parseResult.errors[i].colNum + " ) - Oops");
                            break;
                        }
                    }
                }
            }
            // If there were no errors while parsing, display the CST
            if (parseResult.errors.length == 0) {
                var cst = parseResult.cst.traverseTreeCST(_Control.treantCST, programIndex);
                // Display CST visually with Treant.js
                Treant(cst.treant);
            }
            else {
                Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
            }
            Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors.length + " ERROR(S)");
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
