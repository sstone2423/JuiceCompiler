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
            this.lexResults = [];
            this.parseResults = [];
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
            _Control.codeGenElement = document.getElementById("codeGen");
            _Control.scopeTreeElement = document.getElementById("scopeTree");
            _Control.outputElement.value = "";
            _Control.CSTtextElement.value = "";
            _Control.ASTtextElement.value = "";
            _Control.codeGenElement.value = "";
            _Control.scopeTreeElement.value = "";
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
                // Output the log if there are any errors
                if (_Control.lexResults[programIndex].errors.length != 0) {
                    _Control.prepareLexLog(programIndex);
                    _Control.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
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
                    if (document.getElementById("verboseCheck").checked) {
                        parseResult.log.forEach(function (entry) {
                            _Control.putMessage(entry);
                        });
                    }
                    else {
                        parseResult.log.forEach(function (entry) {
                            if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                _Control.putMessage(entry);
                            }
                        });
                    }
                    // If there were no errors while parsing, display the CST
                    if (!parseResult.error) {
                        var cst = parseResult.cst.traverseTreeCST(_Control.treantCST, (programIndex + 1));
                        for (var i = 0; i < cst.tree.length; i++) {
                            _Control.CSTtextElement.value += cst.tree[i] + "\n";
                        }
                        _Control.scrollToBottom();
                        // Display CST visually with Treant.js
                        Treant(cst.treant);
                    }
                    else {
                        _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
                    }
                    _Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors + " ERROR(S)");
                    // Semantic analysis only if there were no parser errors
                    if (!parseResult.error) {
                        var _Semantic_1 = new JuiceC.Semantic(parseResult.cst);
                        _Control.putMessage(INFO + "\tStarting Semantic Analysis of Program " + (programIndex + 1));
                        var semanticResult = _Semantic_1.analyze();
                        if (document.getElementById("verboseCheck").checked) {
                            semanticResult.log.forEach(function (entry) {
                                _Control.putMessage(entry);
                            });
                        }
                        else {
                            semanticResult.log.forEach(function (entry) {
                                if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                    _Control.putMessage(entry);
                                }
                            });
                        }
                        if (semanticResult.errors === 0) {
                            if (document.getElementById("verboseCheck").checked) {
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
                                var scopeTreeArr = _Semantic_1.printScopeTree(semanticResult.scopeTree.root);
                                _Control.scopeTreeElement.value += "Program " + (programIndex + 1) + "\n";
                                // Display scope tree in scope tree field
                                for (var m = 0; m < scopeTreeArr.length; m++) {
                                    _Control.scopeTreeElement.value += scopeTreeArr[m] + "\n";
                                }
                            }
                            _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors + " ERROR(S) and " + semanticResult.warnings + " WARNING(S)");
                            _CodeGen = new JuiceC.CodeGen(semanticResult);
                            _Control.putMessage(INFO + "\tStarting Code Generation of Program " + (programIndex + 1));
                            // If code gen is successful, add the code to the Code output
                            if (_CodeGen.generateCode()) {
                                _CodeGen.generatedCode.forEach(function (code) {
                                    _Control.codeGenElement.value += code + " ";
                                });
                            }
                            if (document.getElementById("verboseCheck").checked) {
                                _CodeGen.log.forEach(function (entry) {
                                    _Control.putMessage(entry);
                                });
                            }
                            else {
                                _CodeGen.log.forEach(function (entry) {
                                    if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                        _Control.putMessage(entry);
                                    }
                                });
                            }
                            _Control.putMessage(INFO + "\tCode Generation complete with " + _CodeGen.errors + " ERROR(S)");
                            _Control.scrollToBottom();
                        }
                        else {
                            _Control.putMessage(INFO + "\tAST failed to generate due to semantic analysis errors");
                            _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors + " ERROR(S) and " + semanticResult.warnings + " WARNING(S)");
                        }
                    }
                }
            }
        };
        // Outputs the program that is being compiled, and begins the lexerLog
        Control.prototype.prepareLexLog = function (programIndex) {
            // Errors mean there was typed code
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
            }
            // Print all warnings
            if (_Control.lexResults[programIndex].warnings.length > 0) {
                for (var i = 0; i < lexResults[programIndex].warnings.length; i++) {
                    // Check for EOP warning
                    if (lexResults[programIndex].warnings[i].warningType === "No EOP" /* NoEOP */) {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + WARNING + ": " + "No EOP" /* NoEOP */ + " [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                        // Insert an EOP into the tokens array
                        lexResults[programIndex].tokens.push(new JuiceC.Token("EOP" /* EOP */, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                    }
                    else {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + WARNING + ": Not really sure why I'm warning so oops?");
                    }
                }
            }
            // Print all errors
            for (var i = 0; i < lexResults[programIndex].errors.length; i++) {
                switch (lexResults[programIndex].errors[i].errorType) {
                    // Invalid Token check
                    case "Invalid Token" /* InvalidT */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Invalid Token" /* InvalidT */ + " [ " + lexResults[programIndex].errors[i].value
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }
                    // Missing end of comment
                    case "Missing End Comment" /* NoEndComment */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Missing End Comment" /* NoEndComment */ + " brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }
                    // Missing end of string quote
                    case "Missing End Quote in string literal" /* NoEndQuote */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Missing End Quote in string literal" /* NoEndQuote */ + " [ " + lexResults[programIndex].errors[i].value
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }
                    // Invalid token in string
                    case "Invalid Token in string literal" /* InvalidTInStr */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Invalid Token in string literal" /* InvalidTInStr */ + " [ " + lexResults[programIndex].errors[i].value
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only lowercase characters a - z are allowed");
                        break;
                    }
                    // Invalid token in comment
                    case "Invalid Token in Comment" /* InvalidTInComm */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Invalid Token in Comment" /* InvalidTInComm */ + " [ " + lexResults[programIndex].errors[i].value
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only characters and digits are allowed");
                        break;
                    }
                    // Invalid new line
                    case "Invalid New Line" /* InvalidNewLine */: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + "Invalid New Line" /* InvalidNewLine */ + " [ \\n ] found at ( " + lexResults[programIndex].errors[i].lineNum
                            + ":" + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments or strings");
                        break;
                    }
                    // Unknown error
                    default: {
                        _Control.putMessage(DEBUG + " - " + JuiceC.Lexer + " - " + ERROR + ": Unknown error found [ " + lexResults[programIndex].errors[i].value
                            + " ] at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }
                }
            }
            _Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " " + WARNING + "(S) and " + lexResults[programIndex].errors.length + " " + ERROR + "(S)");
        };
        // Helper function to scroll to the bottom of the output div
        Control.prototype.scrollToBottom = function () {
            _Control.outputElement.scrollTop = _Control.outputElement.scrollHeight;
        };
        return Control;
    }());
    JuiceC.Control = Control;
})(JuiceC || (JuiceC = {}));
