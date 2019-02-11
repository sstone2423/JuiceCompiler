///<reference path="globals.ts" />
/* 
	lexer.ts  
*/

module JuiceC {

	export class Lexer {

		// Token array
		tokens = [];
		// Error array
		errors = [];
		// Warning array
		warnings = [];
		// Program counter
		programNum: number = 0;
		lexAnalysisResult = {};
		resultsArray = [];
		// Pointers that indicate which characters are being matched
		startPtr: number = 0;
		endPtr: number = 1;
		// Initialize to first line and first column
		currentLineNum: number = 1;
		currentColNum: number = 0;
		// Initialize booleans to determine the status of the lex
		isComplete: boolean = false;
		inComment: boolean = false;
		foundEOP: boolean = false;
		foundQuote: boolean = false;
		// Keep track of the quote and comment locations
		startQuoteCol: number = 0;
		startQuoteLine: number = 0;
		startCommentCol: number = 0;
		startCommentLine: number = 0;

		constructor() { }

		public lex() {
			// Order of lex precedence is 1. Keyword, 2. ID, 3. Symbol, 4. Digit, 5. Character
		    // Grab the "raw" source code.
			let sourceCode = (<HTMLInputElement>document.getElementById("sourceCode")).value;
		    // Trim the leading and trailing spaces.
			sourceCode = JuiceC.Utils.trim(sourceCode);
			// TODO: remove all spaces in the middle; remove line breaks too.
			// Lex until we reach the end of the source code
			while (this.startPtr < sourceCode.length) {
				console.log("startptr: " + this.startPtr);
				if (!this.inComment) {
					// Test for left brace
					if (rLBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a LBRACE token
						let token: Token = new Token(JuiceC.TokenType.T_LBRACE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
						this.startPtr = this.endPtr;
					// Test for right brace
					} else if (rRBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a RBRACE token
						let token: Token = new Token(JuiceC.TokenType.T_RBRACE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
						this.startPtr = this.endPtr;
					// Test for left paren
					} else if (rLPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a LPAREN token
						let token: Token = new Token(JuiceC.TokenType.T_LPAREN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
						this.startPtr = this.endPtr;
					// Test for right paren
					} else if (rRPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a RPAREN token
						let token: Token = new Token(JuiceC.TokenType.T_RPAREN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
						this.startPtr = this.endPtr;
					// Test for quote
					} else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a QUOTE token
						let token: Token = new Token(JuiceC.TokenType.T_QUOTE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
						// If this is the first quote, set foundquote to true so that we can treat the next characters as a string
						if (!this.foundQuote) {
							this.foundQuote = true;
							// Set the quote column and line
							this.startQuoteCol = this.currentColNum;
							this.startQuoteLine = this.currentLineNum;
						}
					/*
						Keywords Start here
					*/

					// Test for true boolean value
					} else if (rBOOLVALTRUE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a BOOLVAL token
						let token: Token = new Token(JuiceC.TokenType.T_BOOLVAL, "true", this.currentLineNum, 
													this.currentColNum - ("true").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("true".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for false boolean value
					} else if (rBOOLVALFALSE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a BOOLVAL token
						let token: Token = new Token(JuiceC.TokenType.T_BOOLVAL, "false", this.currentLineNum, 
													this.currentColNum - ("false").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("false".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for while
					} else if (rWHILE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a WHILE token
						let token: Token = new Token(JuiceC.TokenType.T_WHILE, "while", this.currentLineNum, 
													this.currentColNum - ("while").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("while".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for if
					} else if (rIF.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a IF token
						let token: Token = new Token(JuiceC.TokenType.T_IF, "if", this.currentLineNum, 
													this.currentColNum - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - 1);
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for print
					} else if (rPRINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a PRINT token
						let token: Token = new Token(JuiceC.TokenType.T_PRINT, "print", this.currentLineNum, 
													this.currentColNum - ("print").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("print".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for int type
					} else if (rTYPEINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a TYPE token
						let token: Token = new Token(JuiceC.TokenType.T_TYPE, "int", this.currentLineNum, 
													this.currentColNum - ("int").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("int".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for boolean type
					} else if (rTYPEBOOL.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a TYPE token
						let token: Token = new Token(JuiceC.TokenType.T_TYPE, "boolean", this.currentLineNum, 
													this.currentColNum - ("boolean").length - 1);
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("boolean".length - 1));
						// Push new token to tokens array
						this.tokens.push(token);
					// Test for string type
					} else if (rTYPESTR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a TYPE token
						let token: Token = new Token(JuiceC.TokenType.T_TYPE, "string", this.currentLineNum, 
													this.currentColNum - ("string").length - 1);
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
						let token: Token = new Token(JuiceC.TokenType.T_DIGIT, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
					// Test for integer operator
					} else if (rINTOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a INTOP token
						let token: Token = new Token(JuiceC.TokenType.T_INTOP, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
					// Test for boolean operator equals
					} else if (rBOOLOPEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// If the previous token was ASSIGN, pop the token, and push the new BOOLOP token instead
						if (this.tokens[this.tokens.length - 1].type == TokenType.T_ASSIGN) {
							// Create a BOOLOP token
							let token: Token = new Token(JuiceC.TokenType.T_BOOLOP, "==", this.currentLineNum, this.currentColNum - 1);
							this.tokens.pop();
							this.tokens.push(token);
						// Otherwise, give the ASSIGN token
						} else {
							let token: Token = new Token(JuiceC.TokenType.T_ASSIGN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
							this.tokens.push(token);
						}
					// Test for assignment
					} else if (rASSIGN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a ASSIGN token
						let token: Token = new Token(JuiceC.TokenType.T_ASSIGN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
					// Test for ID
					} else if (rID.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a ID token
						let token: Token = new Token(JuiceC.TokenType.T_ID, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						// Push to tokens array
						this.tokens.push(token);
					// Test for white space
					} else if (rWHITESPACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Ignore white space unless it is a new line
						if (rNEWLINE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
							// Move to next line and reset colNum
							this.currentLineNum++;
							this.currentColNum = -1;
						}
						this.startPtr = this.endPtr;
					// Test for EOP
					} else if (rEOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a EOP token
						let token: Token = new Token(JuiceC.TokenType.T_EOP, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
						this.tokens.push(token);
						// Reset the pointer
						this.startPtr = this.endPtr;
						this.foundEOP = true;
						// If still looking for a end quote, reset the boolean. The parser will find this error.
						if (this.foundQuote) {
							this.foundQuote = false;
						}

						// Define an object to return values in
						this.lexAnalysisResult = {
							"inComment": this.inComment,
							"foundQuote": this.foundQuote,
							"foundEOP": this.foundEOP,
							"tokens": this.tokens,
							"errors": this.errors,
							"warnings": this.warnings,
							"complete": this.isComplete,
							"line": this.currentLineNum,
							"col": this.currentColNum
						};

						// Add to the results array in case theres multiple programs
						this.resultsArray.push(this.lexAnalysisResult);
						
						// Reset lexer values so that we can begin to lex the next program
						this.endPtr++;
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
								this.errors.push(new Error(JuiceC.ErrorType.E_NO_END_COMMENT, "*/", this.startCommentLine, this.startCommentCol));
							// Otherwise, any other character besides EOP is invalid
							} else {
								this.errors.push(new Error(JuiceC.ErrorType.E_INVALID_T, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
							}
							break;
						}
						// Check to see if the next character creates a match for a Boolean NotEquals
						if (rBOOLOPNOTEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
							// Create a BOOLOP token
							let token: Token = new Token(JuiceC.TokenType.T_BOOLOP, "!=", this.currentLineNum, this.currentColNum);
							this.tokens.push(token);
						} // Check to see if the next character creates a match for a comment
						else if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
							this.inComment = true;
							this.startCommentCol = this.currentColNum;
							this.startCommentLine = this.currentLineNum;
						// If no other matches, this character is invalid
						} else {
							this.errors.push(new Error(JuiceC.ErrorType.E_INVALID_T, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
						}
					}
				// If still in comment, ignore all characters besides comment end
				} else {
					if (rCOMMENTEND.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
						// Reset inComment boolean and increment the endPtr by 1. It will increment again at the end of the iteration
						this.inComment = false;
						this.endPtr++;
					}
				}
				this.endPtr++;
				this.currentColNum++;
			}

			// If the EOP wasn't found, we still need to push the lex results of the program
			if (!this.foundEOP) {
				// The 2nd quote error will be thrown in the parser
				this.foundQuote = false;
				// Define an object to return values in
				this.lexAnalysisResult = {
					"inComment": this.inComment,
					"foundQuote": this.foundQuote,
					"foundEOP": this.foundEOP,
					"tokens": this.tokens,
					"errors": this.errors,
					"warnings": this.warnings,
					"complete": this.isComplete,
					"line": this.currentLineNum,
					"col": this.currentColNum
				};

				// Add to the results array in case theres multiple programs
				this.resultsArray.push(this.lexAnalysisResult);
			}
			
			// If no errors were thrown during lex, check for more errors and warnings
			for (let i = 0; i < this.resultsArray.length; i++) {
				if (this.resultsArray[i].errors.length == 0) {
					// If we've reached the end of the source code, but no end comment has been found, throw an error
					if (this.resultsArray[i].inComment) {
						this.resultsArray[i].errors.push(new Error(JuiceC.ErrorType.E_NO_END_COMMENT, "*/", this.startCommentLine, this.startCommentCol));
					} // If we've reached the end of the source code, but no end quote has been found, throw an error
					else if (this.resultsArray[i].foundQuote) {
						this.resultsArray[i].errors.push(new Error(JuiceC.ErrorType.E_NO_END_QUOTE, "\"", this.startQuoteLine, this.startQuoteCol));
					} // If we've reached the end of the source and no EOP was detected, along with no errors, throw a warning
					else if (!this.resultsArray[i].foundEOP) {
						this.resultsArray[i].warnings.push(new Warning(JuiceC.WarningType.W_NO_EOP, "$", this.currentLineNum, this.currentColNum));
					}
				}
			}
			

			// End of source code so swap the boolean
			this.isComplete = true;
			this.resultsArray[this.resultsArray.length - 1].isComplete = true;

			return this.resultsArray;
		}

	}
	
}
