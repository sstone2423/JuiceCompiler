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
            _Control.outputElement = document.getElementById("output");
            _Control.CSTtextElement = document.getElementById("CSTtext");
            _Control.ASTtextElement = document.getElementById("ASTtext");
            _Control.outputElement.value = "";
            _Control.CSTtextElement.value = "";
            _Control.ASTtextElement.value = "";
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
            _Control.outputElement.value += msg + "\n";
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
            // Iterate through each program result
            for (var programIndex = 0; programIndex < _Control.lexResults.length; programIndex++) {
                // Check if there were warnings
                if (_Control.lexResults[programIndex].warnings.length != 0) {
                    _Control.lexWarning = true;
                }
                else {
                    _Control.lexWarning = false;
                }
                // Output the log if there are any errors
                if (_Control.lexResults[programIndex].errors.length != 0) {
                    _Control.prepareLexLog(programIndex);
                    _Control.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    _Control.lexError = true;
                }
                // If no tokens are found, output an error
                else if (_Control.lexResults[programIndex].tokens.length == 0) {
                    _Control.putMessage(INFO + "\tCompilation failed due to no tokens being found. Where's the code?");
                } // Otherwise continue to output the lex log
                else {
                    _Control.prepareLexLog(programIndex);
                    // Only parse if there were no errors. No need to waste time and resources
                    _Control.putMessage(INFO + "\tParsing Program " + (programIndex + 1));
                    var parseResult = _Parser.parse(_Control.lexResults[programIndex].tokens);
                    _Control.parserLog(parseResult, programIndex);
                    // Semantic analysis only if there were no parser errors
                    if (!parseResult.error) {
                        var _Semantic = new JuiceC.Semantic(parseResult.cst);
                        _Control.putMessage(INFO + "\tStarting Semantic Analysis of Program " + (programIndex + 1));
                        var semanticResult = _Semantic.analyze();
                        if (!semanticResult.error) {
                            if (document.getElementById("verboseCheck").checked) {
                                for (var j = 0; j < semanticResult.log.length; j++) {
                                    _Control.putMessage(semanticResult.log[j]);
                                }
                                var ast = semanticResult.ast.traverseTreeAST(_Control.treantAST, (programIndex + 1));
                                for (var k = 0; k < ast.tree.length; k++) {
                                    _Control.ASTtextElement.value += ast.tree[k] + "\n";
                                }
                                _Control.scrollToBottom();
                                // Display AST visually with Treant.js
                                Treant(ast.treant);
                                // Display symbols in Symbol Table
                                var symbols = semanticResult.symbols;
                                for (var l = 0; l < symbols.length; l++) {
                                    var table = document.getElementById("symbolTable");
                                    var row = table.insertRow(-1);
                                    var program = row.insertCell(0);
                                    program.innerHTML = (programIndex + 1).toString();
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
                                scopeInput.value += "Program " + (programIndex + 1) + "\n";
                                // Display scope tree in scope tree field
                                for (var m = 0; m < scopeTreeArr.length; m++) {
                                    scopeInput.value += scopeTreeArr[m] + "\n";
                                }
                            }
                        }
                        else {
                            _Control.putMessage(INFO + "\tAST failed to generate due to semantic analysis errors");
                        }
                        if (document.getElementById("verboseCheck").checked) {
                            // Print warnings
                            if (semanticResult.warnings.length > 0) {
                                for (var j = 0; j < semanticResult.warnings.length; j++) {
                                    switch (semanticResult.warnings[j].warningType) {
                                        // Uninitialized Variable
                                        case "Uninitialized Variable" /* UNINIT_VAR */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Variable [ " + semanticResult.warnings[j].value
                                                + " ] was declared at ( " + semanticResult.warnings[j].lineNum + " : " + semanticResult.warnings[j].colNum
                                                + " ), but never initialized");
                                            break;
                                        }
                                        // Unused Variable
                                        case "Unused Variable" /* UNUSED_VAR */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Variable [ " + semanticResult.warnings[j].value
                                                + " ] was declared at ( " + semanticResult.warnings[j].lineNum + " : " + semanticResult.warnings[j].colNum
                                                + " ), but never used");
                                            break;
                                        }
                                        // Used before initialized Variable
                                        case "Variable Used Before Being Initialized" /* USED_BEFORE_INIT */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Variable [ " + semanticResult.warnings[j].value
                                                + " ] was used before being initialized at ( " + semanticResult.warnings[j].lineNum + " : " + semanticResult.warnings[j].colNum
                                                + " )");
                                            break;
                                        }
                                        default: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Not sure what happened. Oops?");
                                        }
                                    }
                                }
                            }
                            // Print errors
                            if (semanticResult.errors.length > 0) {
                                for (var j = 0; j < semanticResult.errors.length; j++) {
                                    switch (semanticResult.errors[j].errorType) {
                                        // Duplicate Variable in scope
                                        case "Duplicate Variable" /* DUPLICATE_VARIABLE */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Duplicate Variable - [ " + semanticResult.errors[j].value.value
                                                + " ] was declared at ( " + semanticResult.errors[j].lineNum + ":" + semanticResult.errors[j].colNum
                                                + " ), but the variable was already declared within the same scope at ( " + semanticResult.errors[j].firstDeclareLine
                                                + " : " + semanticResult.errors[j].firstDeclareCol + " )");
                                            break;
                                        }
                                        // Type mismatch
                                        case "Type Mismatch" /* TYPE_MISMATCH */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Type Mismatch - Variable [ " + semanticResult.errors[j].value.value
                                                + " ] of type [ " + semanticResult.errors[j].targetType + " ] was assigned to type [ " + semanticResult.errors[j].idType.value
                                                + " ] at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum + " )");
                                            break;
                                        }
                                        // Undeclared variable being assigned
                                        case "Undeclared Variable" /* UNDECLARED_VARIABLE */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Undeclared Variable - [ " + semanticResult.errors[j].value.value
                                                + " ] was assigned at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum
                                                + " ), but was not declared beforehand");
                                            break;
                                        }
                                        // Incorrect Int expression
                                        case "Incorrect Integer Expression" /* INCORRECT_INT_EXPR */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Incorrect Int Expression - [ " + semanticResult.errors[j].value
                                                + " ] of type [ " + semanticResult.errors[j].targetType + " ] was assigned to type [ " + semanticResult.errors[j].idType
                                                + " ] at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum + " )");
                                            break;
                                        }
                                        // Incorrect type comparison
                                        case "Incorrect Type Comparison" /* INCORRECT_TYPE_COMPAR */: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Incorrect Type Comparison - [ " + semanticResult.errors[j].value
                                                + " ] of type [ " + semanticResult.errors[j].targetType + " ] was compared to type [ " + semanticResult.errors[j].idType
                                                + " ] at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum + " )");
                                            break;
                                        }
                                        default: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Not sure what happened. Oops?");
                                        }
                                    }
                                }
                            }
                        }
                        _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors.length + " ERROR(S) and " + semanticResult.warnings.length + " WARNING(S)");
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
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + "Invalid New Line" /* INVALID_NEW_LINE */ + " ] found at ( " + lexResults[programIndex].errors[i].lineNum
                                + ":" + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments");
                            break;
                        }
                        // Unknown error
                        default: {
                            _Control.putMessage(DEBUG + " - " + JuiceC.Lexer + " - ERROR: Unknown error found [ " + lexResults[programIndex].errors[i].value
                                + " ] at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
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
                var cst = parseResult.cst.traverseTreeCST(_Control.treantCST, (programIndex + 1));
                for (var i = 0; i < cst.tree.length; i++) {
                    _Control.outputElement.value += cst.tree[i] + "\n";
                }
                this.scrollToBottom();
                // Display CST visually with Treant.js
                Treant(cst.treant);
            }
            else {
                _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
            }
            _Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors + " ERROR(S)");
        };
        // Helper function to scroll to the bottom of the output div
        Control.prototype.scrollToBottom = function () {
            _Control.outputElement.scrollTop = _Control.outputElement.scrollHeight;
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
