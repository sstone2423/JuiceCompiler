///<reference path="globals.ts" />
/*
    control.ts
        Methods and variables for use with the index.html . All changes and functionality of the HTML
        should be here.
*/

module JuiceC {
    
    export class Control {

        // Set the initial values for our globals
        public static init(): void {
            _Control = new Control();
            _Lexer = new Lexer();
            _Utils = new Utils();  
            tokenIndex = 0;
            currentToken = ' ';
            errorCount = 0;
        }

        // This is executed as a result of the user pressing the "compile" button between the two text areas, above
        public static btnCompile_click(): void {
            // Reset the compiler each time the compiler is clicked
            this.init();
            this.putMessage(INFO + "\tCompilation started");
            // Grab the tokens, warnings, errors, and statuses from the lexer
            lexResults = _Lexer.lex();
            console.log(lexResults);
            // Iterate through each program result
            for (let i = 0; i < lexResults.length; i++) {
                // Check if there were warnings
                if (lexResults[i].warnings.length != 0) {
                    lexWarning = true;
                } else {
                    lexWarning = false;
                }

                // Check if there were errors
                if (lexResults[i].errors.length != 0) {
                    this.beginLexLog(i);
                    this.putMessage(INFO + "\tCompilation stopped due to Lexer errors");
                    // Save the lexer error state
                    lexError = true;
                } 
                // If no tokens are found, output an error
                else if (lexResults[i].tokens.length == 0) {
                    this.putMessage(INFO + "\tCompilation failed due to tokens not being found. Where's the code?");
                } // If the user tried to compile without typing any code besides comments, throw error
                else if (!programDetected) {
                    this.putMessage(INFO + "\tCompilation failed due to no actual code. This isn't a text editor.");
                }
                // Otherwise continue to output the lex log
                else {
                    this.beginLexLog(i);
                    // Only parse if there were no errors. No need to waste time and resources
                    this.putMessage("Parsing [" + lexResults[i].tokens + "]");
                    _Parser.parse(lexResults[i].tokens);
                }
            }
        }

        // Helper function for duplicated code
        public static beginLexLog(programIndex: number): void {
            // Errors mean there was typed code
			programDetected = true;
            this.putMessage(INFO + "\tCompiling Program " + programCount);
            // Log/output the lexer analysis results
            this.lexerLog(lexResults, programIndex);
            // Increment the program count
            programCount++;
        }

        // Output a message to the HTML output log
        public static putMessage(msg): void {
            (<HTMLInputElement>document.getElementById("output")).value += msg + "\n";
        }

        // Logs the tokens, warnings, errors, and complete status of each program that was lexed
        public static lexerLog(lexResults, programIndex: number) {
            if ((<HTMLInputElement>document.getElementById("verboseCheck")).checked) {
                // Print all tokens
                for (let i = 0; i < lexResults[programIndex].tokens.length; i++) {
                    console.log("token " + i + ": " + lexResults[programIndex].tokens[i]);
                    this.putMessage(DEBUG + " - " + LEXER + " - " + lexResults[programIndex].tokens[i].type + " [ " + lexResults[programIndex].tokens[i].value 
                                    + " ] found at (" + lexResults[programIndex].tokens[i].lineNum + ":" + lexResults[programIndex].tokens[i].colNum + ")");
                }
                // Print all warnings
                if (lexWarning) {
                    console.log("entered lexerlog if lexWarning if statement");
                    for (let i = 0; i < lexResults[programIndex].warnings.length; i++) {
                        // Check for EOP warning
                        if (lexResults[programIndex].warnings[programIndex].type == JuiceC.WarningType.W_NO_EOP) {
                            this.putMessage(DEBUG + " - " + LEXER + " - WARNING: No EOP [ $ ] detected at end-of-file. Adding to end-of-file for you.");
                            // Insert an EOP into the tokens array
                            lexResults[programIndex].tokens.push(new JuiceC.Token(JuiceC.TokenType.T_EOP, "$", lexResults[programIndex].line, lexResults[programIndex].col));
                        }
                    }
                }
                // Print all errors
                for (let i = 0; i < lexResults[programIndex].errors.length; i++) {
                    console.log("lexresults" + i + ": " + lexResults[programIndex].errors[i].errorType);
                    // Invalid token check
                    if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_INVALID_T) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of comment
                    else if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_NO_END_COMMENT) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Missing ending comment brace (*/) for comment starting at (" 
                                        + lexResults[programIndex].errors[i].lineNum + " col " + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Missing end of string quote
                    else if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_NO_END_QUOTE) {
                        this.putMessage("LEXER -> | ERROR: Missing ending quote for string literal starting at (" 
                                        + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ")");
                    }
                    // Invalid token in string
                    else if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_INVALID_T_STRING) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in string literal [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only lowercase characters a - z are allowed");
                    }
                    // Invalid token in comment
                    else if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_INVALID_T_COMMENT) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Unrecognized Token in comment [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - Only characters and digits are allowed");
                    }
                    // Invalid new line
                    else if (lexResults[programIndex].errors[i].errorType == JuiceC.ErrorType.E_INVALID_NEW_LINE) {
                        this.putMessage(DEBUG + " - " + LEXER + " - ERROR: Invalid New Line used [ " + lexResults[programIndex].errors[i].value 
                                        + " ] found at (" + lexResults[programIndex].errors[i].lineNum + ":" + lexResults[programIndex].errors[i].colNum + ") - New lines are not allowed in comments");
                    }
                }
            }
            
			this.putMessage(INFO + "\tLexical Analysis complete with " + lexResults[programIndex].warnings.length + " WARNING(S) and " + lexResults[programIndex].errors.length + " ERROR(S)");
        }
        
    }
}