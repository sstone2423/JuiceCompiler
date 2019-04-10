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
            _Control.astVisual = {
                chart: {
                    container: "#tree-ast"
                },
                nodeStructure: {}
            };
            document.getElementById("output").value = "";
            document.getElementById("CSTtext").value = "";
            // Clear symbol table
            var table = document.getElementById("symbolTable");
            // Leave header in place
            var rowCount = table.rows.length;
            for (var i = rowCount - 1; i > 1; i--) {
                table.deleteRow(i);
            }
        };
        // Output a message to the HTML output log
        Control.prototype.putMessage = function (msg) {
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
            _Control.treantAST = {
                chart: {
                    container: "#tree-ast"
                },
                nodeStructure: {
                    text: { name: "Root" },
                    children: []
                }
            };
            _Control.putMessage(INFO + "\tCompilation started");
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
                    _Control.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    _Control.lexError = true;
                }
                // If no tokens are found, output an error
                else if (_Control.lexResults[i].tokens.length == 0) {
                    _Control.putMessage(INFO + "\tCompilation failed due to no tokens being found. Where's the code?");
                } // Otherwise continue to output the lex log
                else {
                    _Control.prepareLexLog(i);
                    // Only parse if there were no errors. No need to waste time and resources
                    _Control.putMessage(INFO + "\tParsing Program " + (i + 1));
                    var parseResult = _Parser.parse(_Control.lexResults[i].tokens);
                    _Control.parserLog(parseResult, i);
                    // Semantic analysis only if there were no parser errors
                    if (!parseResult.error) {
                        var _Semantic = new JuiceC.Semantic(parseResult.cst);
                        _Control.putMessage(INFO + "\tStarting Semantic Analysis of Program " + (i + 1));
                        var semanticResult = _Semantic.analyze();
                        if (!semanticResult.error) {
                            if (document.getElementById("verboseCheck").checked) {
                                for (var j = 0; j < semanticResult.log.length; j++) {
                                    _Control.putMessage(semanticResult.log[j]);
                                }
                                var ast = semanticResult.ast.traverseTreeAST(_Control.treantAST, i);
                                for (var k = 0; k < ast.tree.length; k++) {
                                    document.getElementById("ASTtext").value += ast.tree[k] + "\n";
                                }
                                document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
                                // Display AST visually with Treant.js
                                Treant(ast.treant);
                                // Display symbols in Symbol Table
                                var symbols = semanticResult.symbols;
                                for (var l = 0; l < symbols.length; l++) {
                                    var table = document.getElementById("symbolTable");
                                    var row = table.insertRow(-1);
                                    var program = row.insertCell(0);
                                    program.innerHTML = i.toString();
                                    var key = row.insertCell(1);
                                    key.innerHTML = symbols[l].key;
                                    var type = row.insertCell(2);
                                    type.innerHTML = symbols[l].type;
                                    var scope = row.insertCell(3);
                                    scope.innerHTML = symbols[l].scope;
                                    var lineNum = row.insertCell(4);
                                    lineNum.innerHTML = symbols[l].line;
                                    var colNum = row.insertCell(5);
                                    colNum.innerHTML = symbols[l].col;
                                }
                                // Fill out scope tree
                                var scopeTreeArr = _Semantic.printScopeTree(semanticResult.scopeTree.root);
                                var scopeInput = document.getElementById("taScope");
                                scopeInput.value += "Program " + i + "\n";
                                // Display scope tree in scope tree field
                                for (var m = 0; m < scopeTreeArr.length; m++) {
                                    scopeInput.value += scopeTreeArr[m] + "\n";
                                }
                            }
                            else {
                                _Control.putMessage(INFO + "\tAST failed to generate due to semantic analysis errors");
                            }
                            _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors.length + " ERROR(S)");
                        }
                    }
                }
            }
        };
        // Swaps programDetected boolean to true, outputs the program that is being compiled, and begins the lexerLog
        Control.prototype.prepareLexLog = function (programIndex) {
            // Errors mean there was typed code
            _Control.programDetected = true;
            _Control.putMessage(INFO + "\tCompiling Program " + (programIndex + 1));
            // Log/output the lexer analysis results
            _Control.lexerLog(_Control.lexResults, programIndex);
        };
        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        Control.prototype.lexerLog = function (lexResults, programIndex) {
            if (document.getElementById("verboseCheck").checked) {
                // Print all tokens
                for (var i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    _Control.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value
                        + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (_Control.lexWarning) {
                    for (var i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[i].warningType == "No EOP" /* NO_EOP */) {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new JuiceC.Token(JuiceC.TokenType.EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        }
                        else {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: Not really sure why I'm warning so oops?");
                        }
                    }
                }
                // Print all errors
                for (var i = 0; i < lexResults[programIndex].errors.length; i++) {
                    switch (lexResults[programIndex].errors[i].errorType) {
                        // Invalid Token check
                        case "Invalid Token" /* INVALID_T */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token" /* INVALID_T */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Missing end of comment
                        case "No End Comment" /* NO_END_COMMENT */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Missing end of string quote
                        case "No End Quote in string literal" /* NO_END_QUOTE */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "No End Quote in string literal" /* NO_END_QUOTE */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                        // Invalid token in string
                        case "Invalid Token in string literal" /* INVALID_T_STRING */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token in string literal" /* INVALID_T_STRING */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only lowercase characters a - z are allowed");
                            break;
                        }
                        // Invalid token in comment
                        case "Invalid Token" /* INVALID_T */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid Token in Comment" /* INVALID_T_COMMENT */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only characters and digits are allowed");
                            break;
                        }
                        // Invalid new line
                        case "Invalid New Line" /* INVALID_NEW_LINE */: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid New Line" /* INVALID_NEW_LINE */ + " [ " + lexResults[programIndex].errors[i].value
                                + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments");
                            break;
                        }
                        // Unknown error
                        default: {
                            _Control.putMessage(DEBUG + " - " + PARSER + " - ERROR: Unknown error found [ " + lexResults[programIndex].errors[i].value
                                + " ] at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Oops");
                            break;
                        }
                    }
                }
            }
            _Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        };
        Control.prototype.parserLog = function (parseResult, programIndex) {
            if (document.getElementById("verboseCheck").checked) {
                for (var i = 0; i < parseResult.log.length; i++) {
                    _Control.putMessage(parseResult.log[i]);
                }
            }
            // If there were no errors while parsing, display the CST
            if (!parseResult.error) {
                var cst = parseResult.cst.traverseTreeCST(_Control.treantCST, programIndex);
                for (var i = 0; i < cst.tree.length; i++) {
                    document.getElementById("CSTtext").value += cst.tree[i] + "\n";
                }
                document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
                // Display CST visually with Treant.js
                Treant(cst.treant);
            }
            else {
                _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
            }
            _Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors + " ERROR(S)");
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
