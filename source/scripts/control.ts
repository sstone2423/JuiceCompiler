///<reference path="globals.ts" />
/*
    control.ts
        Methods and variables for use with the index.html . All changes and functionality of the HTML
        should be here.
*/

module JuiceC {
    
    export class Control {

        programDetected: boolean = false;
        lexResults = [];
        lexWarning: boolean = false;
        lexError: boolean = false;
        parseResults =[];
        parseError: boolean = false;

        constructor() { }

        // Set the initial values for our globals
        public init(): void {
            _Control = new Control();
            _Lexer = new Lexer();
            _Parser = new Parser();
        }

        // Output a message to the HTML output log
        public putMessage(msg): void {
            (<HTMLInputElement>document.getElementById("output")).value += msg + "\n";
        }

        // Helper function for duplicated code
        public prepareLexLog(programIndex: number): void {
            // Errors mean there was typed code
			this.programDetected = true;
            this.putMessage(INFO + "\tCompiling Program " + (programIndex + 1));
            // Log/output the lexer analysis results
            this.lexerLog(this.lexResults, programIndex);
        }

        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        public lexerLog(lexResults, programIndex: number) {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                // Print all tokens
                for (let i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    console.log("token " + i + ": " + lexResults[programIndex].tokens[i]);
                    this.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value 
                                    + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (this.lexWarning) {
                    console.log("entered lexerlog if lexWarning if statement");
                    for (let i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[programIndex].type == WarningType.W_NO_EOP) {
                            this.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new Token(TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        }
                    }
                }
                // Print all errors
                for (let i = 0; i < lexResults[programIndex].errors.length; i++) {
                    console.log("lexresults" + i + ": " + lexResults[programIndex].errors[i].errorType);
                    // Invalid token check
                    if (lexResults[programIndex].errors[i].errorType == ErrorType.E_INVALID_T) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of comment
                    else if (lexResults[programIndex].errors[i].errorType == ErrorType.E_NO_END_COMMENT) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at (" 
                                        + lexResults[programIndex].errors[i].lineNum + " col " + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of string quote
                    else if (lexResults[programIndex].errors[i].errorType == ErrorType.E_NO_END_QUOTE) {
                        this.putMessage("LEXER -> | ERROR: Missing ending quote for string literal starting at (" 
                                        + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Invalid token in string
                    else if (lexResults[programIndex].errors[i].errorType == ErrorType.E_INVALID_T_STRING) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in string literal [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only lowercase characters a - z are allowed");
                    }
                    // Invalid token in comment
                    else if (lexResults[programIndex].errors[i].errorType == ErrorType.E_INVALID_T_COMMENT) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in comment [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only characters and digits are allowed");
                    }
                    // Invalid new line
                    else if (lexResults[programIndex].errors[i].errorType == ErrorType.E_INVALID_NEW_LINE) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Invalid New Line used [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - New lines are not allowed in comments");
                    }
                }
            }
            
			this.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        }

        public parserLog(parseResult): void {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                // Print all errors
                for (let i = 0; i < parseResult.errors.length; i++) {
                    
                }
            }
            
			this.putMessage(INFO + "\tParsing complete with " + parseResult.errors.length + " ERROR(S)");
        }

        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        public btnCompile_click(): void {
            // Reset the compiler each time the compiler is clicked
            this.init();
            this.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            this.lexResults = _Lexer.lex();
            console.log(this.lexResults);
            // Iterate through each program result
            for (let i = 0; i < this.lexResults.length; i++) {
                // Check if there were warnings
                if (this.lexResults[i].warnings.length != 0) {
                    this.lexWarning = true;
                } else {
                    this.lexWarning = false;
                }

                // Check if there were errors
                if (this.lexResults[i].errors.length != 0) {
                    this.prepareLexLog(i);
                    this.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    this.lexError = true;
                } 
                // If no tokens are found, output an error
                else if (this.lexResults[i].tokens.length == 0) {
                    this.putMessage(INFO + "\tCompilation failed due to tokens not being found. Where's the code?");
                } // If the user tried to compile without typing any code besides comments, throw error
                else if (!this.programDetected) {
                    this.putMessage(INFO + "\tCompilation failed due to no actual code. This isn't a text editor.");
                }
                // Otherwise continue to output the lex log
                else {
                    this.prepareLexLog(i);
                    // Only parse if there were no errors. No need to waste time and resources
                    this.putMessage(INFO + "\tParsing Program " + i);
                    let parseResult = _Parser.parse(this.lexResults[i].tokens);
                    if (parseResult.errors.length != 0) {
                        this.parserLog(parseResult);
                    }
                }
            }
        }

        
        
    }
}