///<reference path="globals.ts" />
/**
 *  control.ts
 * 
 *  Methods and variables for use with the index.html . All changes and functionality of the HTML
 *  should be here.
 */

module JuiceC {
    // Javascript to Typescript library magic
    declare var Treant: any;
    declare var ClipboardJS: any;
    
    export class Control {

        lexResults: Array<LexResult> = [];
        cstVisual;
        treantCST;
        astVisual;
        treantAST;
        outputElement: HTMLInputElement;
        CSTtextElement: HTMLInputElement;
        ASTtextElement: HTMLInputElement;
        codeGenElement: HTMLInputElement;
        scopeTreeElement: HTMLInputElement;
        clipboard;

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
            _Control.outputElement = (<HTMLInputElement>document.getElementById("output"));
            _Control.CSTtextElement = (<HTMLInputElement>document.getElementById("CSTtext"));
            _Control.ASTtextElement = (<HTMLInputElement>document.getElementById("ASTtext"));
            _Control.codeGenElement = (<HTMLInputElement>document.getElementById("codeGen"));
            _Control.scopeTreeElement = (<HTMLInputElement>document.getElementById("scopeTree"));
            _Control.outputElement.value = "";
            _Control.CSTtextElement.value = "";
            _Control.ASTtextElement.value = "";
            _Control.codeGenElement.value = "";
            _Control.scopeTreeElement.value = "";
            // Clear symbol table
			let table: HTMLTableElement = (<HTMLTableElement>document.getElementById("symbolTable"));
			// Leave header in place
			let rowCount: number = table.rows.length;
			for (let i = rowCount - 1; i > 1; i--) {
				table.deleteRow(i);
            }
            _Control.clipboard = new ClipboardJS('#copyClipboard');
        }

        // Output a message to the HTML output log
        public putMessage(msg: string): void {
            _Control.outputElement.value += msg + "\n";
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
            if ((<HTMLInputElement>document.getElementById("sourceCode")).value.length == 0) {
                _Control.putMessage(INFO + "\tCompilation stopped. No source code provided");
            } else {
                _Control.lexResults = _Lexer.lex();
                // Iterate through each program result
                for (let programIndex = 0; programIndex < _Control.lexResults.length; programIndex++) {
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

                        let parseResult: ParseResult = _Parser.parse(_Control.lexResults[programIndex].tokens);
                        if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                            parseResult.log.forEach(entry => {
                                _Control.putMessage(entry);
                            });
                        } else {
                            parseResult.log.forEach(entry => {
                                if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                    _Control.putMessage(entry);
                                }
                            });
                        }
            
                        // If there were no errors while parsing, display the CST
                        if (!parseResult.error) {
                            let cst = parseResult.cst.traverseTreeCST(_Control.treantCST, (programIndex + 1));
                            for (let i = 0; i < cst.tree.length; i++) {
                                _Control.CSTtextElement.value += cst.tree[i] + "\n";
                            }
                            _Control.scrollToBottom();
                            // Display CST visually with Treant.js
                            Treant(cst.treant);
                        } else {
                            _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
                        }
                        _Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors + " ERROR(S)");

                        // Semantic analysis only if there were no parser errors
                        if (!parseResult.error) {
                            let _Semantic: Semantic = new Semantic(parseResult.cst);
                            _Control.putMessage(INFO + "\tStarting Semantic Analysis of Program " + (programIndex + 1));
                            let semanticResult = _Semantic.analyze();

                            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                                semanticResult.log.forEach(entry => {
                                    _Control.putMessage(entry);
                                });
                            } else {
                                semanticResult.log.forEach(entry => {
                                    if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                        _Control.putMessage(entry);
                                    }
                                });
                            }
                            if (semanticResult.errors === 0) {
                                if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                                    let ast = semanticResult.ast.traverseTreeAST(_Control.treantAST, (programIndex + 1));
                                    for (let k = 0; k < ast.tree.length; k++) {
                                        _Control.ASTtextElement.value += ast.tree[k] + "\n";
                                    }
                                    _Control.scrollToBottom()
                                    // Display AST visually with Treant.js
                                    Treant(ast.treant);
                                    // Display symbols in Symbol Table
                                    let symbols = semanticResult.symbols;
                                    for (let l = 0; l < symbols.length; l++) {
                                        let table: HTMLTableElement = (<HTMLTableElement>document.getElementById("symbolTable"));
                                        let row: HTMLTableRowElement = table.insertRow(-1);
                                        let program: HTMLTableCellElement = row.insertCell(0);
                                        program.innerHTML = (programIndex + 1).toString();
                                        let key: HTMLTableCellElement = row.insertCell(1);
                                        key.innerHTML = symbols[l].key;
                                        let type: HTMLTableCellElement = row.insertCell(2);
                                        type.innerHTML = symbols[l].type;
                                        let scope: HTMLTableCellElement = row.insertCell(3);
                                        scope.innerHTML = symbols[l].scope;
                                        let lineNum: HTMLTableCellElement = row.insertCell(4);
                                        lineNum.innerHTML = symbols[l].line;
                                        let colNum: HTMLTableCellElement = row.insertCell(5);
                                        colNum.innerHTML = symbols[l].col;
                                    }
    
                                    let scopeTree = semanticResult.ast.traverseTreeAST(_Control.treantAST, (programIndex + 1));
                                    _Control.scopeTreeElement.value += "Program " + (programIndex + 1) + "\n";
                                    // Display scope tree in scope tree field
                                    for (let m = 0; m < scopeTree.tree.length; m++) {
                                        _Control.scopeTreeElement.value += scopeTree.tree[m] + "\n";
                                    }
                                }

                                _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors 
                                    + " ERROR(S) and " + semanticResult.warnings + " WARNING(S)");
                                _CodeGen = new CodeGen(semanticResult);
                                _Control.putMessage(INFO + "\tStarting Code Generation of Program " + (programIndex + 1));
                                // If code gen is successful, add the code to the Code output
                                if (_CodeGen.generateCode()) {
                                    _CodeGen.generatedCode.forEach(code => {
                                        _Control.codeGenElement.value += code + " ";
                                    });
                                }
                                if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                                    _CodeGen.log.forEach(entry => {
                                        _Control.putMessage(entry);
                                    });
                                } else {
                                    _CodeGen.log.forEach(entry => {
                                        if (entry.includes(ERROR) || entry.includes(WARNING)) {
                                            _Control.putMessage(entry);
                                        }
                                    });
                                }
                                _Control.putMessage(INFO + "\tCode Generation complete with " + _CodeGen.errors + " ERROR(S)");
                                _Control.scrollToBottom();
                            } else {
                                _Control.putMessage(INFO + "\tAST failed to generate due to semantic analysis errors");
                                _Control.putMessage(INFO + "\tSemantic Analysis complete with " + semanticResult.errors 
                                    + " ERROR(S) and " + semanticResult.warnings + " WARNING(S)");
                            }
                        }
                    }
                }
            }
        }

        // Outputs the program that is being compiled, and begins the lexerLog
        public prepareLexLog(programIndex: number): void {
            // Errors mean there was typed code
            _Control.putMessage(INFO + "\tCompiling Program " + (programIndex + 1));
            // Log/output the lexer analysis results
            _Control.lexerLog(_Control.lexResults, programIndex);
        }

        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        public lexerLog(lexResults: Array<any>, programIndex: number): void {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                // Print all tokens
                for (let i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    _Control.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type 
                        + " [ " + lexResults[programIndex].tokens[i].value + " ] found at (" 
                        + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
            }
            // Print all warnings
            if (_Control.lexResults[programIndex].warnings.length > 0) {
                for (let i = 0; i < lexResults[programIndex].warnings.length; i++) {
                    // Check for EOP warning
                    if (lexResults[programIndex].warnings[i].warningType === WarningType.NoEOP) {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + WARNING + ": " + WarningType.NoEOP 
                            + " [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                        // Insert an EOP into the tokens array
                        lexResults[programIndex].tokens.push(
                            new Token(TokenType.EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col)
                        );
                    } else {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + WARNING + ": Not really sure why I'm warning so oops?");
                    }
                }
            }
            // Print all errors
            for (let i = 0; i < lexResults[programIndex].errors.length; i++) {
                switch (lexResults[programIndex].errors[i].errorType) {
                    // Invalid Token check
                    case ErrorType.InvalidT: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.InvalidT 
                            + " [ " + lexResults[programIndex].errors[i].value + " ] found at ( " 
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }

                    // Missing end of comment
                    case ErrorType.NoEndComment: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.NoEndComment 
                            + " brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value 
                            + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" 
                            + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }

                    // Missing end of string quote
                    case ErrorType.NoEndQuote: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.NoEndQuote + " [ " 
                            + lexResults[programIndex].errors[i].value + " ] found at ( " 
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }

                    // Invalid token in string
                    case ErrorType.InvalidTInStr: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.InvalidTInStr 
                            + " [ " + lexResults[programIndex].errors[i].value + " ] found at ( " 
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum 
                            + " ) - Only lowercase characters a - z are allowed");
                        break;
                    }

                    // Invalid token in comment
                    case ErrorType.InvalidTInComm: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.InvalidTInComm 
                            + " [ " + lexResults[programIndex].errors[i].value + " ] found at ( " 
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum 
                            + " ) - Only characters and digits are allowed");
                        break;
                    }

                    // Invalid new line
                    case ErrorType.InvalidNewLine: {
                        _Control.putMessage(DEBUG + " - " + LEXER + " - " + ERROR + ": " + ErrorType.InvalidNewLine 
                            + " [ \\n ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" 
                            + lexResults[programIndex].errors[i].colNum + " ) - New lines are not allowed in comments or strings");
                        break;
                    }

                    // Unknown error
                    default: {
                        _Control.putMessage(DEBUG + " - " + Lexer + " - " + ERROR + ": Unknown error found [ " 
                            + lexResults[programIndex].errors[i].value + " ] at ( " 
                            + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                        break;
                    }
                }
            }
            _Control.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length 
                + " " + WARNING + "(S) and " + lexResults[programIndex].errors.length + " " + ERROR + "(S)");
        }

        // Helper function to scroll to the bottom of the output div
        public scrollToBottom(): void {
            _Control.outputElement.scrollTop = _Control.outputElement.scrollHeight;
        }
    }
}