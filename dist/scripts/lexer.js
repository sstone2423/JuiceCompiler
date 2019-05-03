///<reference path="globals.ts" />
/*
    lexer.ts

    Lexer checks the code given to ensure that all of the characters belong in the Language Grammar. If they belong, create tokens
    for each and pass them on to the Parser. If there were errors in the Lexer, stop compiling the current program and report the
    errors. The only warning currently is for a missing end of program $ character. The Lexer will add the character to the program
    and report the warning back to the user.
*/
var JuiceC;
(function (JuiceC) {
    var Lexer = /** @class */ (function () {
        function Lexer() {
            // Token array
            this.tokens = [];
            // Error array
            this.errors = [];
            // Warning array
            this.warnings = [];
            // Program counter
            this.lexAnalysisResult = {};
            this.resultsArray = [];
            // Pointers that indicate which characters are being matched
            this.startPtr = 0;
            this.endPtr = 1;
            // Initialize to first line and first column
            this.currentLineNum = 1;
            this.currentColNum = 0;
            // Initialize booleans to determine the status of the lex
            this.inComment = false;
            this.foundEOP = false;
            this.foundQuote = false;
            // Keep track of the quote and comment locations
            this.startQuoteCol = 0;
            this.startQuoteLine = 0;
            this.startCommentCol = 0;
            this.startCommentLine = 0;
        }
        Lexer.prototype.lex = function () {
            // Order of lex precedence is 1. Keyword, 2. ID, 3. Symbol, 4. Digit, 5. Character
            // Grab the "raw" source code.
            var sourceCode = document.getElementById("sourceCode").value;
            // Trim the leading and trailing spaces.
            sourceCode = sourceCode.trim();
            // Lex until we reach the end of the source code
            while (this.startPtr < sourceCode.length) {
                if (!this.inComment && !this.foundQuote) {
                    // Test for left brace
                    if (rLBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a LBRACE token
                        var token = new JuiceC.Token("LBrace" /* LBrace */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        this.startPtr = this.endPtr;
                        // Test for right brace
                    }
                    else if (rRBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a RBRACE token
                        var token = new JuiceC.Token("RBrace" /* RBrace */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        this.startPtr = this.endPtr;
                        // Test for left paren
                    }
                    else if (rLPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a LPAREN token
                        var token = new JuiceC.Token("LParen" /* LParen */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        this.startPtr = this.endPtr;
                        // Test for right paren
                    }
                    else if (rRPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a RPAREN token
                        var token = new JuiceC.Token("RParen" /* RParen */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        this.startPtr = this.endPtr;
                        // Test for quote
                    }
                    else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a QUOTE token
                        var token = new JuiceC.Token("Quote" /* Quote */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // If this is the first quote, set foundquote to true so that we can treat the next characters as a string
                        if (!this.foundQuote) {
                            this.foundQuote = true;
                            // Set the quote column and line
                            this.startQuoteCol = this.currentColNum;
                            this.startQuoteLine = this.currentLineNum;
                        }
                        this.startPtr = this.endPtr;
                        /*
                            Keywords Start here
                        */
                        // Test for true boolean value
                    }
                    else if (rBOOLVALTRUE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a BOOLVAL token
                        var token = new JuiceC.Token("BoolVal" /* BoolVal */, "true", this.currentLineNum, this.currentColNum - ("true").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("true".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for false boolean value
                    }
                    else if (rBOOLVALFALSE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a BOOLVAL token
                        var token = new JuiceC.Token("BoolVal" /* BoolVal */, "false", this.currentLineNum, this.currentColNum - ("false").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("false".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for while
                    }
                    else if (rWHILE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a WHILE token
                        var token = new JuiceC.Token("While" /* While */, "while", this.currentLineNum, this.currentColNum - ("while").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("while".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for if
                    }
                    else if (rIF.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a IF token
                        var token = new JuiceC.Token("If" /* If */, "if", this.currentLineNum, this.currentColNum - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - 1);
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for print
                    }
                    else if (rPRINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a PRINT token
                        var token = new JuiceC.Token("Print" /* Print */, "print", this.currentLineNum, this.currentColNum - ("print").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("print".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for int type
                    }
                    else if (rTYPEINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a TYPE token
                        var token = new JuiceC.Token("Type" /* Type */, "int", this.currentLineNum, this.currentColNum - ("int").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("int".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for boolean type
                    }
                    else if (rTYPEBOOL.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a TYPE token
                        var token = new JuiceC.Token("Type" /* Type */, "boolean", this.currentLineNum, this.currentColNum - ("boolean").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("boolean".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                        // Test for string type
                    }
                    else if (rTYPESTR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a TYPE token
                        var token = new JuiceC.Token("Type" /* Type */, "string", this.currentLineNum, this.currentColNum - ("string").length - 1);
                        // Remove the previous ID tokens that were added to the tokens array
                        this.tokens = this.tokens.slice(0, this.tokens.length - ("string".length - 1));
                        // Push new token to tokens array
                        this.tokens.push(token);
                    }
                    /*
                        End of keywords
                    */
                    // Test for digit
                    else if (rDIGIT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a DIGIT token
                        var token = new JuiceC.Token("Digit" /* Digit */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // Test for integer operator
                    }
                    else if (rINTOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a INTOP token
                        var token = new JuiceC.Token("IntOp" /* IntOp */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // Test for boolean operator equals
                    }
                    else if (rBOOLOPEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // If the previous token was ASSIGN, pop the token, and push the new BOOLOP token instead
                        if (this.tokens[this.tokens.length - 1].type == "Assign" /* Assign */) {
                            // Create a BOOLOP token
                            var token = new JuiceC.Token("BoolOp" /* BoolOp */, "==", this.currentLineNum, this.currentColNum - 1);
                            this.tokens.pop();
                            this.tokens.push(token);
                            // Otherwise, give the ASSIGN token
                        }
                        else {
                            var token = new JuiceC.Token("Assign" /* Assign */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                            this.tokens.push(token);
                        }
                        // Test for assignment
                    }
                    else if (rASSIGN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a ASSIGN token
                        var token = new JuiceC.Token("Assign" /* Assign */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // Test for ID
                    }
                    else if (rID.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a ID token
                        var token = new JuiceC.Token("Id" /* Id */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // Test for white space
                    }
                    else if (rWHITESPACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Ignore white space unless it is a new line
                        if (rNEWLINE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                            // Move to next line and reset colNum
                            this.currentLineNum++;
                            this.currentColNum = -1;
                        }
                        this.startPtr = this.endPtr;
                        // Test for EOP
                    }
                    else if (rEOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a EOP token
                        var token = new JuiceC.Token("EOP" /* EOP */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        this.tokens.push(token);
                        // Reset the pointer
                        this.startPtr = this.endPtr;
                        this.foundEOP = true;
                        // If still looking for a end quote, throw an error
                        if (this.foundQuote) {
                            this.errors.push(new JuiceC.Error("Missing End Quote in string literal" /* NoEndQuote */, sourceCode.charAt(this.endPtr - 1), this.startCommentLine, this.startCommentCol));
                        }
                        // Define an object to return values in
                        this.lexAnalysisResult = {
                            "inComment": this.inComment,
                            "foundQuote": this.foundQuote,
                            "foundEOP": this.foundEOP,
                            "tokens": this.tokens,
                            "errors": this.errors,
                            "warnings": this.warnings,
                            "line": this.currentLineNum,
                            "col": this.currentColNum
                        };
                        // Add to the results array in case theres multiple programs
                        this.resultsArray.push(this.lexAnalysisResult);
                        // Reset lexer values so that we can begin to lex the next program
                        this.currentColNum++;
                        this.tokens = [];
                        this.errors = [];
                        this.warnings = [];
                        this.inComment = false;
                        this.foundEOP = false;
                        this.foundQuote = false;
                    }
                    /*
                        Illegal Characters
                    */
                    else {
                        if (this.endPtr == sourceCode.length) {
                            // If code ends with a trailing start comment, throw error
                            if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
                                this.errors.push(new JuiceC.Error("Missing End Comment" /* NoEndComment */, "*/", this.startCommentLine, this.startCommentCol));
                                // Otherwise, any other character besides EOP is invalid
                            }
                            else {
                                this.errors.push(new JuiceC.Error("Invalid Token" /* InvalidT */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
                            }
                            break;
                        }
                        // Check to see if the next character creates a match for a Boolean NotEquals
                        if (rBOOLOPNOTEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
                            // Create a BOOLOP token
                            var token = new JuiceC.Token("BoolOp" /* BoolOp */, "!=", this.currentLineNum, this.currentColNum);
                            this.tokens.push(token);
                            this.endPtr++;
                        } // Check to see if the next character creates a match for a comment
                        else if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
                            this.inComment = true;
                            this.startCommentCol = this.currentColNum;
                            this.startCommentLine = this.currentLineNum;
                            // If no other matches, this character is invalid
                        }
                        else {
                            this.errors.push(new JuiceC.Error("Invalid Token" /* InvalidT */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
                        }
                    }
                    // If still in comment, only allow characters and the end comment
                }
                else if (this.inComment) {
                    // Check for the end comment
                    if (rCOMMENTEND.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
                        // Reset inComment boolean and increment the endPtr by 1. It will increment again at the end of the iteration
                        this.inComment = false;
                        this.endPtr++;
                        // EOP is invalid inside of a comment. Throw an invalid token error. The missing end comment error will be thrown at the end
                    }
                    else if (rEOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        this.errors.push(new JuiceC.Error("Invalid Token in Comment" /* InvalidTInComm */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
                    }
                    this.startPtr++;
                    // If not inComment, then a quote was found so only lowercase characters, comments, space character, and the end quote is allowed
                }
                else {
                    if (rCHAR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a EOP token
                        var token = new JuiceC.Token("Char" /* Char */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        this.tokens.push(token);
                        // Check for the end quote. If found, JuiceC is happy
                    }
                    else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Create a QUOTE token
                        var token = new JuiceC.Token("Quote" /* Quote */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // Reset the foundQuote boolean
                        this.foundQuote = false;
                        // Check to see if the next character creates a match for a comment
                    }
                    else if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
                        this.inComment = true;
                        this.startCommentCol = this.currentColNum;
                        this.startCommentLine = this.currentLineNum;
                        // Test for white space
                    }
                    else if (rWHITESPACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                        // Throw error if there is a new line in a string
                        if (rNEWLINE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                            this.errors.push(new JuiceC.Error("Invalid New Line" /* InvalidNewLine */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
                        }
                        var token = new JuiceC.Token("Char" /* Char */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                        // Push to tokens array
                        this.tokens.push(token);
                        // If its not a character, its an invalid token so throw an error
                    }
                    else {
                        this.errors.push(new JuiceC.Error("Invalid Token in string literal" /* InvalidTInStr */, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
                    }
                    this.startPtr++;
                }
                this.endPtr++;
                this.currentColNum++;
            }
            // If the EOP wasn't found, we still need to push the lex results of the program
            // Only push the program if it isn't empty
            if (!this.foundEOP && this.tokens.length > 0) {
                // Define an object to return values in
                this.lexAnalysisResult = {
                    "inComment": this.inComment,
                    "foundQuote": this.foundQuote,
                    "foundEOP": this.foundEOP,
                    "tokens": this.tokens,
                    "errors": this.errors,
                    "warnings": this.warnings,
                    "line": this.currentLineNum,
                    "col": this.currentColNum
                };
                // Add to the results array in case theres multiple programs
                this.resultsArray.push(this.lexAnalysisResult);
            }
            // If no errors were thrown during lex, check for more errors and warnings
            for (var i = 0; i < this.resultsArray.length; i++) {
                if (this.resultsArray[i].errors.length == 0) {
                    // If we've reached the end of the source code, but no end comment has been found, throw an error
                    if (this.resultsArray[i].inComment) {
                        this.resultsArray[i].errors.push(new JuiceC.Error("Missing End Comment" /* NoEndComment */, "*/", this.startCommentLine, this.startCommentCol));
                    } // If we've reached the end of the source code, but no end quote has been found, throw an error
                    else if (this.resultsArray[i].foundQuote) {
                        this.resultsArray[i].errors.push(new JuiceC.Error("Missing End Quote in string literal" /* NoEndQuote */, "\"", this.startQuoteLine, this.startQuoteCol));
                    } // If we've reached the end of the source and no EOP was detected, along with no errors, throw a warning
                    else if (!this.resultsArray[i].foundEOP) {
                        this.resultsArray[i].warnings.push(new JuiceC.Warning("No EOP" /* NoEOP */, "$", this.currentLineNum, this.currentColNum));
                    }
                }
            }
            return this.resultsArray;
        };
        return Lexer;
    }());
    JuiceC.Lexer = Lexer;
})(JuiceC || (JuiceC = {}));
