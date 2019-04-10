///<reference path="globals.ts" />
/*
    control.ts
        Methods and variables for use with the index.html . All changes and functionality of the HTML
        should be here.
*/

module JuiceC {
    
    // Javascript to Typescript library magic
    declare var Treant: any;
    
    export class Control {

        programDetected: boolean = false;
        lexResults = [];
        lexWarning: boolean = false;
        lexError: boolean = false;
        parseResults =[];
        parseError: boolean = false;
        cstVisual;
        treantCST;
        astVisual;
        treantAST;
        _Semantic;

        constructor() { }

        // Set the initial values for our globals
        public static init(): void {
            _Control = new Control();
            _Lexer = new Lexer();
            _Parser = new Parser();
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
            (<HTMLInputElement>document.getElementById("output")).value = "";
            (<HTMLInputElement>document.getElementById("CSTtext")).value = "";
            // Clear symbol table
			let table = (<HTMLTableElement>document.getElementById("symbolTable"));
			// Leave header in place
			let rowCount = table.rows.length;
			for (let i = rowCount - 1; i > 1; i--) {
				table.deleteRow(i);
			}
        }

        // Output a message to the HTML output log
        public putMessage(msg): void {
            (<HTMLInputElement>document.getElementById("output")).value += msg + "\n";
        }

        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        public static btnCompile_click(): void {
            // Reset the compiler each time the compiler is clicked
            Control.init();
            _Control.treantCST = {
				chart: {
					container: "#tree-cst"
				},
				
				nodeStructure: {
					text: { name: "Root" },
					children: [
					]
				}
            };
            _Control.treantAST = {
				chart: {
					container: "#tree-ast"
				},
				
				nodeStructure: {
					text: { name: "Root" },
					children: [
					]
				}
            };
            _Control.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            _Control.lexResults = _Lexer.lex();
            // Iterate through each program result
            for (let programIndex = 0; programIndex < _Control.lexResults.length; programIndex++) {
                // Check if there were warnings
                if (_Control.lexResults[programIndex].warnings.length != 0) {
                    _Control.lexWarning = true;
                } else {
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
                    let parseResult = _Parser.parse(_Control.lexResults[programIndex].tokens);
                    _Control.parserLog(parseResult, programIndex);

                    // Semantic analysis only if there were no parser errors
                    if (!parseResult.error) {
                        let _Semantic = new Semantic(parseResult.cst);
                        _Control.putMessage(INFO + "\tStarting Semantic Analysis of Program " + (programIndex + 1));
                        let semanticResult = _Semantic.analyze();

                        if (!semanticResult.error) {
                            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                                for (let j = 0; j < semanticResult.log.length; j++) {
                                    _Control.putMessage(semanticResult.log[j]);
                                }
                            
                                let ast = semanticResult.ast.traverseTreeAST(_Control.treantAST, (programIndex + 1));
                                for (let k = 0; k < ast.tree.length; k++) {
                                    (<HTMLInputElement>document.getElementById("ASTtext")).value += ast.tree[k] + "\n";
                                }
                                (<HTMLInputElement>document.getElementById("output")).scrollTop = (<HTMLInputElement>document.getElementById("output")).scrollHeight;
                                // Display AST visually with Treant.js
                                Treant(ast.treant);
                                // Display symbols in Symbol Table
                                let symbols = semanticResult.symbols;
                                for (let l = 0; l < symbols.length; l++) {
                                    let table = (<HTMLTableElement>document.getElementById("symbolTable"));
                                    let row = table.insertRow(-1);
                                    let program = row.insertCell(0);
                                    program.innerHTML = (programIndex + 1).toString();
                                    let key = row.insertCell(1);
                                    key.innerHTML = symbols[l].key;
                                    let type = row.insertCell(2);
                                    type.innerHTML = symbols[l].type;
                                    let scope = row.insertCell(3);
                                    scope.innerHTML = symbols[l].scope;
                                    let lineNum = row.insertCell(4);
                                    lineNum.innerHTML = symbols[l].line;
                                    let colNum = row.insertCell(5);
                                    colNum.innerHTML = symbols[l].col;
                                }
                                // Fill out scope tree
                                let scopeTreeArr = _Semantic.printScopeTree(semanticResult.scopeTree.root);
                                let scopeInput = (<HTMLInputElement>document.getElementById("taScope"));
                                scopeInput.value += "Program " + (programIndex + 1) + "\n";
                                // Display scope tree in scope tree field
                                for (let m = 0; m < scopeTreeArr.length; m++) {
                                    scopeInput.value += scopeTreeArr[m] + "\n";
                                }
                            }
                        } else {
                            _Control.putMessage(INFO + "\tAST failed to generate due to semantic analysis errors");
                        }
                        if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                            // Print warnings
                            if (semanticResult.warnings.length > 0) {
                                for (let j = 0; j < semanticResult.warnings.length; j++) {
                                    switch (semanticResult.warnings[j].warningType) {
                                        // Uninitialized Variable
                                        case WarningType.UNINIT_VAR: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Variable [ " + semanticResult.warnings[j].value 
                                                + " ] was declared at ( " + semanticResult.warnings[j].lineNum + " : " + semanticResult.warnings[j].colNum 
                                                + " ), but never initialized");
                                            break;
                                        }

                                        // Unused Variable
                                        case WarningType.UNUSED_VAR: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + WARNING + ": Variable [ " + semanticResult.warnings[j].value 
                                                + " ] was declared at ( " + semanticResult.warnings[j].lineNum + " : " + semanticResult.warnings[j].colNum 
                                                + " ), but never used");
                                            break;
                                        }

                                        // Used before initialized Variable
                                        case WarningType.USED_BEFORE_INIT: {
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
                                for (let j = 0; j < semanticResult.errors.length; j++) {
                                    switch (semanticResult.errors[j].errorType) {
                                        // Duplicate Variable in scope
                                        case ErrorType.DUPLICATE_VARIABLE: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Duplicate Variable - [ " + semanticResult.errors[j].value.value 
                                                + " ] was declared at ( " + semanticResult.errors[j].lineNum + ":" + semanticResult.errors[j].colNum 
                                                + " ), but the variable was already declared within the same scope at ( " + semanticResult.errors[j].firstDeclareLine 
                                                + " : " + semanticResult.errors[j].firstDeclareCol + " )");
                                            break;
                                        }

                                        // Type mismatch
                                        case ErrorType.TYPE_MISMATCH: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Type Mismatch - Variable [ " + semanticResult.errors[j].value.value 
                                                + " ] of type [ " + semanticResult.errors[j].targetType + " ] was assigned to type [ " + semanticResult.errors[j].idType.value 
                                                + " ] at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum + " )");
                                            break;
                                        }

                                        // Undeclared variable being assigned
                                        case ErrorType.UNDECLARED_VARIABLE: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Undeclared Variable - [ " + semanticResult.errors[j].value.value 
                                                + " ] was assigned at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum 
                                                + " ), but was not declared beforehand");
                                            break;
                                        }

                                        // Incorrect Int expression
                                        case ErrorType.INCORRECT_INT_EXPR: {
                                            _Control.putMessage(DEBUG + " - " + SEMANTIC + " - " + ERROR + ": Incorrect Int Expression - [ " + semanticResult.errors[j].value 
                                                + " ] of type [ " + semanticResult.errors[j].targetType + " ] was assigned to type [ " + semanticResult.errors[j].idType 
                                                + " ] at ( " + semanticResult.errors[j].lineNum + " : " + semanticResult.errors[j].colNum + " )");
                                            break;
                                        }

                                        // Incorrect type comparison
                                        case ErrorType.INCORRECT_TYPE_COMPAR: {
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
        }

        // Swaps programDetected boolean to true, outputs the program that is being compiled, and begins the lexerLog
        public prepareLexLog(programIndex: number): void {
            // Errors mean there was typed code
			_Control.programDetected = true;
            _Control.putMessage(INFO + "\tCompiling Program " + (programIndex + 1));
            // Log/output the lexer analysis results
            _Control.lexerLog(_Control.lexResults, programIndex);
        }

        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        public lexerLog(lexResults, programIndex: number) {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                // Print all tokens
                for (let i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    _Control.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value 
                                    + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (_Control.lexWarning) {
                    for (let i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[i].warningType == WarningType.NO_EOP) {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new Token(TokenType.EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        } else {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: Not really sure why I'm warning so oops?");
                        }
                    }
                }
                // Print all errors
                for (let i = 0; i < lexResults[programIndex].errors.length; i++) {
                    switch (lexResults[programIndex].errors[i].errorType) {
                        // Invalid Token check
                        case ErrorType.INVALID_T: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.INVALID_T + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Missing end of comment
                        case ErrorType.NO_END_COMMENT: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Missing end of string quote
                        case ErrorType.NO_END_QUOTE: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.NO_END_QUOTE + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Invalid token in string
                        case ErrorType.INVALID_T_STRING: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.INVALID_T_STRING + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only lowercase characters a - z are allowed");
                            break;
                        }

                        // Invalid token in comment
                        case ErrorType.INVALID_T: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.INVALID_T_COMMENT + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only characters and digits are allowed");
                            break;
                        }

                        // Invalid new line
                        case ErrorType.INVALID_NEW_LINE: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.INVALID_NEW_LINE + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments");
                            break;
                        }

                        // Unknown error
                        default: {
                            _Control.putMessage(DEBUG + " - " + Lexer + " - ERROR: Unknown error found [ " + lexResults[programIndex].errors[i].value 
                                        + " ] at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }
                    }
                }
            }
            
			_Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        }

        public parserLog(parseResult, programIndex: number): void {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                for (let i = 0; i < parseResult.log.length; i++) {
                    _Control.putMessage(parseResult.log[i]);
                }
            }

            // If there were no errors while parsing, display the CST
            if (!parseResult.error) {
                let cst = parseResult.cst.traverseTreeCST(_Control.treantCST, (programIndex + 1));
                for (let i = 0; i < cst.tree.length; i++) {
                    (<HTMLInputElement>document.getElementById("CSTtext")).value += cst.tree[i] + "\n";
                }
                (<HTMLInputElement>document.getElementById("output")).scrollTop = (<HTMLInputElement>document.getElementById("output")).scrollHeight;
                // Display CST visually with Treant.js
                Treant(cst.treant);
            } else {
                _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
            }
            
			_Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors + " ERROR(S)");
        }
        
    }
}