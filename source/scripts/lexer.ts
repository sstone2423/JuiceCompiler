///<reference path="globals.ts" />
/**
 * 	lexer.ts
 * 
 * 	The Lexer checks the code given to ensure that all of the characters belong in the 
 *  Language Grammar. If they belong, create tokens for each and pass them on to the 
 *  Parser. If there were errors in the Lexer, stop compiling the current program and 
 *  report the errors. The only warning currently is for a missing end of program $ 
 *  character. The Lexer will add the character to the program and report the warning 
 *  back to the user.
 */

module JuiceC {
	// Regex
	const rLBRACE: RegExp = new RegExp('{$'); // Left Brace
	const rRBRACE: RegExp = new RegExp('}$'); // Right brace
	const rPRINT: RegExp = new RegExp('print$'); // Print
	const rLPAREN: RegExp = new RegExp('\\($'); // Left Paren
	const rRPAREN: RegExp = new RegExp('\\)$'); // Right paren
	const rASSIGN: RegExp = new RegExp('\=$'); // Assignment operator
	const rWHILE: RegExp = new RegExp('while$'); // While
	const rIF: RegExp = new RegExp('if$'); // If
	const rQUOTE: RegExp = new RegExp('"$'); // Quote
	const rTYPEINT: RegExp = new RegExp('int$'); // Integer type
	const rTYPEBOOL: RegExp = new RegExp('boolean$'); // Boolean type
	const rTYPESTR: RegExp = new RegExp('string$'); // String type
	const rCHAR: RegExp = new RegExp('[a-z]$'); // Character
	const rSPACE: RegExp = new RegExp(' $'); // Space
	const rDIGIT: RegExp = new RegExp('[0-9]$'); // Digit
	const rEOP: RegExp = new RegExp('\\$$'); // EOP
	const rID: RegExp = new RegExp('[a-z]$'); // ID
	const rBOOLOPEQUALS: RegExp = new RegExp('\=\=$'); // Boolean operator equals
	const rBOOLOPNOTEQUALS: RegExp = new RegExp('\\!\=$'); // Boolean operator not equals
	const rBOOLVALTRUE: RegExp = new RegExp('true$'); // Boolean true value
	const rBOOLVALFALSE: RegExp = new RegExp('false$'); // Boolean false value
	const rINTOP: RegExp = new RegExp('\\+$'); // Integer operation
	const rWHITESPACE: RegExp = new RegExp(' $|\t$|\n$|\r$'); // Whitespace
	const rNEWLINE: RegExp = new RegExp('\n$'); // New line
	const rCOMMENTSTART: RegExp = new RegExp('/\\*$'); // Start of comment
	const rCOMMENTEND: RegExp = new RegExp('\\*/$'); // End of comment

	export interface LexResult {
		inComment: boolean;
		foundQuote: boolean;
		foundEOP: boolean;
		tokens: Array<Token>;
		errors: Array<Error>;
		warnings: Array<Warning>;
		line: number;
		col: number;
	}

	export class Lexer {
		// Token array
		tokens: Array<Token> = [];
		// Error array
		errors: Array<Error> = [];
		// Warning array
		warnings: Array<Warning> = [];
		// Program counter
		lexAnalysisResult: LexResult;
		resultsArray: Array<LexResult> = [];
		// Pointers that indicate which characters are being matched
		startPtr = 0;
		endPtr = 1;
		// Initialize to first line and first column
		currentLineNum = 1;
		currentColNum = 0;
		// Initialize booleans to determine the status of the lex
		inComment = false;
		foundEOP = false;
		foundQuote = false;
		// Keep track of the quote and comment locations
		startQuoteCol = 0;
		startQuoteLine = 0;
		startCommentCol = 0;
		startCommentLine = 0;

		/**
		 * Order of lex precedence is 1. Keyword, 2. ID, 3. Symbol, 4. Digit, 5. Character
		 */
		lex(): Array<LexResult> {
		    // Grab the "raw" source code.
			let sourceCode: string = (<HTMLInputElement>document.getElementById("sourceCode")).value;
		    // Trim the leading and trailing spaces.
			sourceCode = sourceCode.trim();
			// Lex until we reach the end of the source code
			while (this.startPtr < sourceCode.length) {
				if (!this.inComment && !this.foundQuote) {
					// Test for left brace
					if (rLBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a LBRACE token
						this.tokens.push(new Token(TokenType.LBrace, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						this.startPtr = this.endPtr;
					// Test for right brace
					} else if (rRBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a RBRACE token
						this.tokens.push(new Token(TokenType.RBrace, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						this.startPtr = this.endPtr;
					// Test for left paren
					} else if (rLPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a LPAREN token
						this.tokens.push(new Token(
							TokenType.LParen, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						this.startPtr = this.endPtr;
					// Test for right paren
					} else if (rRPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a RPAREN token
						this.tokens.push(new Token(TokenType.RParen, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						this.startPtr = this.endPtr;
					// Test for quote
					} else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a QUOTE token
						this.tokens.push(new Token(TokenType.Quote, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						// If this is the first quote, set foundquote to true so that we can treat
						// the next characters as a string
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
					} else if (rBOOLVALTRUE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("true".length - 1));
						// Create a BOOLVAL token
						this.tokens.push(new Token(
							TokenType.BoolVal, "true", this.currentLineNum, this.currentColNum - ("true").length - 1));
					// Test for false boolean value
					} else if (rBOOLVALFALSE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("false".length - 1));
						// Create a BOOLVAL token
						this.tokens.push(new Token(TokenType.BoolVal, "false", this.currentLineNum,
							this.currentColNum - ("false").length - 1));
					// Test for while
					} else if (rWHILE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("while".length - 1));
						// Create a WHILE token
						this.tokens.push(new Token(
							TokenType.While, "while", this.currentLineNum, this.currentColNum - ("while").length - 1));
					// Test for if
					} else if (rIF.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - 1);
						// Create a IF token
						this.tokens.push(new Token(
							TokenType.If, "if", this.currentLineNum, this.currentColNum - 1));
					// Test for print
					} else if (rPRINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("print".length - 1));
						// Create a PRINT token
						this.tokens.push(new Token(
							TokenType.Print, "print", this.currentLineNum, this.currentColNum - ("print").length - 1));
					// Test for int type
					} else if (rTYPEINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("int".length - 1));
						// Create a TYPE token
						this.tokens.push(new Token(
							TokenType.Type, "int", this.currentLineNum, this.currentColNum - ("int").length - 1));
					// Test for boolean type
					} else if (rTYPEBOOL.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("boolean".length - 1));
						// Create a TYPE token
						this.tokens.push(new Token(TokenType.Type, "boolean", this.currentLineNum,
							this.currentColNum - ("boolean").length - 1));
					// Test for string type
					} else if (rTYPESTR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Remove the previous ID tokens that were added to the tokens array
						this.tokens = this.tokens.slice(0, this.tokens.length - ("string".length - 1));
						// Create a TYPE token
						this.tokens.push(new Token(
							TokenType.Type, "string", this.currentLineNum, this.currentColNum - ("string").length - 1));
					}

					/*
						End of keywords
					*/

					// Test for digit
					else if (rDIGIT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a DIGIT token
						this.tokens.push(new Token(
							TokenType.Digit, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					// Test for integer operator
					} else if (rINTOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a INTOP token
						this.tokens.push(new Token(
							TokenType.IntOp, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					// Test for boolean operator equals
					} else if (rBOOLOPEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// If the previous token was ASSIGN, pop the token, and push the new BOOLOP token instead
						if (this.tokens[this.tokens.length - 1].type == TokenType.Assign) {
							this.tokens.pop();
							// Create a BOOLOP token
							this.tokens.push(new Token(
								TokenType.BoolOp, "==", this.currentLineNum, this.currentColNum - 1));
						// Otherwise, give the ASSIGN token
						} else {
							this.tokens.push(new Token(TokenType.Assign, sourceCode.charAt(this.endPtr - 1),
								this.currentLineNum, this.currentColNum));
						}
					// Test for assignment
					} else if (rASSIGN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a ASSIGN token
						this.tokens.push(new Token(TokenType.Assign, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					// Test for ID
					} else if (rID.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a ID token
						this.tokens.push(new Token(
							TokenType.Id, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
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
						this.tokens.push(new Token(
							TokenType.EOP, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum));
						// Reset the pointer
						this.startPtr = this.endPtr;
						this.foundEOP = true;
						// If still looking for a end quote, throw an error
						if (this.foundQuote) {
							this.errors.push(new Error(
								ErrorType.NoEndQuote, sourceCode.charAt(this.endPtr - 1),
								this.startCommentLine, this.startCommentCol));
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
								this.errors.push(new Error(
									ErrorType.NoEndComment, "*/", this.startCommentLine, this.startCommentCol));
							// Otherwise, any other character besides EOP is invalid
							} else {
								this.errors.push(new Error(
									ErrorType.InvalidT, sourceCode.charAt(this.endPtr - 1),
									this.currentLineNum, this.currentColNum));
							}
							break;
						}
						// Check to see if the next character creates a match for a Boolean NotEquals
						if (rBOOLOPNOTEQUALS.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
							// Create a BOOLOP token
							this.tokens.push(new Token(
								TokenType.BoolOp, "!=", this.currentLineNum, this.currentColNum));
							this.endPtr++;
						} // Check to see if the next character creates a match for a comment
						else if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
							this.inComment = true;
							this.startCommentCol = this.currentColNum;
							this.startCommentLine = this.currentLineNum;
						// If no other matches, this character is invalid
						} else {
							this.errors.push(new Error(
								ErrorType.InvalidT, sourceCode.charAt(this.endPtr - 1),
								this.currentLineNum, this.currentColNum));
						}
					}
				// If still in comment, only allow characters and the end comment
				} else if (this.inComment) {
					// Check for the end comment
					if (rCOMMENTEND.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
						// Reset inComment boolean and increment the endPtr by 1. It will 
						// increment again at the end of the iteration
						this.inComment = false;
						this.endPtr++;
					// EOP is invalid inside of a comment. Throw an invalid token error.
					//  The missing end comment error will be thrown at the end
					} else if (rEOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						this.errors.push(new Error(
							ErrorType.InvalidTInComm, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					}
					this.startPtr++;
				// If not inComment, then a quote was found so only lowercase characters,
				// comments, space character, and the end quote is allowed
				} else {
					if (rCHAR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a EOP token
						this.tokens.push(new Token(
							TokenType.Char, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					// Check for the end quote. If found, JuiceC is happy
					} else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Create a QUOTE token
						this.tokens.push(new Token(
							TokenType.Quote, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
						// Reset the foundQuote boolean
						this.foundQuote = false;
					// Check to see if the next character creates a match for a comment
					} else if (rCOMMENTSTART.test(sourceCode.substring(this.startPtr, this.endPtr + 1))) {
						this.inComment = true;
						this.startCommentCol = this.currentColNum;
						this.startCommentLine = this.currentLineNum;
					// Test for white space
					} else if (rWHITESPACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
						// Throw error if there is a new line in a string
						if (rNEWLINE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
							this.errors.push(new Error(ErrorType.InvalidNewLine, sourceCode.charAt(this.endPtr - 1),
								this.currentLineNum, this.currentColNum));
						}
						this.tokens.push(new Token(TokenType.Char, sourceCode.charAt(this.endPtr - 1),
							this.currentLineNum, this.currentColNum));
					// If its not a character, its an invalid token so throw an error
					} else {
						this.errors.push(new Error(ErrorType.InvalidTInStr, sourceCode.charAt(this.endPtr - 1),
						 	this.currentLineNum, this.currentColNum));
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
			for (let i = 0; i < this.resultsArray.length; i++) {
				if (this.resultsArray[i].errors.length == 0) {
					// If we've reached the end of the source code, but no end comment 
					// has been found, throw an error
					if (this.resultsArray[i].inComment) {
						this.resultsArray[i].errors.push(new Error(ErrorType.NoEndComment,
							"*/", this.startCommentLine, this.startCommentCol));
					} // If we've reached the end of the source code, but no end quote
					//  has been found, throw an error
					else if (this.resultsArray[i].foundQuote) {
						this.resultsArray[i].errors.push(new Error(ErrorType.NoEndQuote, "\"",
							this.startQuoteLine, this.startQuoteCol));
					} // If we've reached the end of the source and no EOP was detected,
					//  along with no errors, throw a warning
					else if (!this.resultsArray[i].foundEOP) {
						this.resultsArray[i].warnings.push(new Warning(WarningType.NoEOP, "$",
							this.currentLineNum, this.currentColNum));
					}
				}
			}

			return this.resultsArray;
		}
	}
}
