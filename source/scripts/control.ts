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
        _Semantic;

        constructor() { }

        // Set the initial values for our globals
        public static init(): void {
            _Control = new Control();
            _Lexer = new Lexer();
            _Parser = new Parser();
            _Control._Semantic = new Semantic();
			_Control.cstVisual = {
				chart: {
					container: "#tree-cst"
				},
				nodeStructure: {}
            };
            (<HTMLInputElement>document.getElementById("output")).value = "";
            (<HTMLInputElement>document.getElementById("CSTtext")).value = "";
        }

        // Output a message to the HTML output log
        public putMessage(msg): void {
            (<HTMLInputElement>document.getElementById("output")).value += msg + "\n";
        }

        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        public btnCompile_click(): void {
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
            _Control.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            _Control.lexResults = _Lexer.lex();
            console.log(_Control.lexResults);
            // Iterate through each program result
            for (let i = 0; i < _Control.lexResults.length; i++) {
                // Check if there were warnings
                if (_Control.lexResults[i].warnings.length != 0) {
                    _Control.lexWarning = true;
                } else {
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
                    let parseResult = _Parser.parse(_Control.lexResults[i].tokens);
                    _Control.parserLog(parseResult, i);

                    // Semantic analysis only if there were no parser errors
                    if (parseResult.error) {
                        _Semantic.analyze(parseResult.cst);
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
                        if (lexResults[programIndex].warnings[i].warningType == WarningType.W_NO_EOP) {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new Token(TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        } else {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - WARNING: Not really sure why I'm warning so oops?");
                        }
                    }
                }
                // Print all errors
                for (let i = 0; i < lexResults[programIndex].errors.length; i++) {
                    switch (lexResults[programIndex].errors[i].errorType) {
                        // Invalid Token check
                        case ErrorType.E_INVALID_T: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.E_INVALID_T + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Missing end of comment
                        case ErrorType.E_NO_END_COMMENT: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Missing end of string quote
                        case ErrorType.E_NO_END_QUOTE: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.E_NO_END_QUOTE + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " )");
                            break;
                        }

                        // Invalid token in string
                        case ErrorType.E_INVALID_T_STRING: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.E_INVALID_T_STRING + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only lowercase characters a - z are allowed");
                            break;
                        }

                        // Invalid token in comment
                        case ErrorType.E_INVALID_T: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.E_INVALID_T_COMMENT + " [ " + lexResults[programIndex].errors[i].value 
                                    + " ] found at ( " + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + " ) - Only characters and digits are allowed");
                            break;
                        }

                        // Invalid new line
                        case ErrorType.E_INVALID_NEW_LINE: {
                            _Control.putMessage(DEBUG + " - " + LEXER + " - ERROR: " + ErrorType.E_INVALID_NEW_LINE + " [ " + lexResults[programIndex].errors[i].value 
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
        }

        public parserLog(parseResult, programIndex: number): void {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                for (let i = 0; i < parseResult.log.length; i++) {
                    _Control.putMessage(parseResult[i]);
                }
            }

            // If there were no errors while parsing, display the CST
            if (parseResult.error) {
                let cst = parseResult.cst.traverseTreeCST(_Control.treantCST, programIndex);
                for (let i = 0; i < cst.tree.length; i++) {
                    (<HTMLInputElement>document.getElementById("CSTtext")).value += cst.tree[i] + "\n";
                }
                (<HTMLInputElement>document.getElementById("output")).scrollTop = (<HTMLInputElement>document.getElementById("output")).scrollHeight;
                // Display CST visually with Treant.js
                Treant(cst.treant);
            } else {
                _Control.putMessage(INFO + "\tCST failed to generate due to parsing errors");
            }
            
			_Control.putMessage(INFO + "\tParsing complete with " + parseResult.errors.length + " ERROR(S)");
        }
        
    }
}