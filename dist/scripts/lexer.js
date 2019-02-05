///<reference path="globals.ts" />
/*
    lexer.ts
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
            this.programs = [];
            // Pointers that indicate which characters are being matched
            this.startPtr = 0;
            this.endPtr = 1;
            // Initialize to first line and first column
            this.currentLineNum = 1;
            this.currentColNum = 0;
            // Initialize booleans to determine the status of the lex
            this.isComplete = false;
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
            sourceCode = JuiceC.Utils.trim(sourceCode);
            // TODO: remove all spaces in the middle; remove line breaks too.
            // Lex until we reach the end of the source code
            while (this.startPtr <= sourceCode.length) {
                // Test for left brace
                if (rLBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a LBRACE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TLBRACE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for right brace
                }
                else if (rRBRACE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a RBRACE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TRBRACE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for left paren
                }
                else if (rLPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a LPAREN token
                    var token = new JuiceC.Token(JuiceC.TokenType.TLPAREN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for right paren
                }
                else if (rRPAREN.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a RPAREN token
                    var token = new JuiceC.Token(JuiceC.TokenType.TRPAREN, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for quote
                }
                else if (rQUOTE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a QUOTE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TQUOTE, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
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
                }
                else if (rBOOLVALTRUE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a BOOLVAL token
                    var token = new JuiceC.Token(JuiceC.TokenType.TBOOLVAL, "true", this.currentLineNum, this.currentColNum - ("true").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("true".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for false boolean value
                }
                else if (rBOOLVALFALSE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a BOOLVAL token
                    var token = new JuiceC.Token(JuiceC.TokenType.TBOOLVAL, "false", this.currentLineNum, this.currentColNum - ("false").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("false".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for while
                }
                else if (rWHILE.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a WHILE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TWHILE, "while", this.currentLineNum, this.currentColNum - ("while").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("while".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for if
                }
                else if (rIF.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a IF token
                    var token = new JuiceC.Token(JuiceC.TokenType.TIF, "if", this.currentLineNum, this.currentColNum - ("if").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("if".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for print
                }
                else if (rPRINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a PRINT token
                    var token = new JuiceC.Token(JuiceC.TokenType.TPRINT, "print", this.currentLineNum, this.currentColNum - ("print").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("print".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for int type
                }
                else if (rTYPEINT.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a TYPE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TTYPE, "int", this.currentLineNum, this.currentColNum - ("int").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("int".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for boolean type
                }
                else if (rTYPEBOOL.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a TYPE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TTYPE, "boolean", this.currentLineNum, this.currentColNum - ("boolean").length - 1);
                    // Remove the previous ID tokens that were added to the tokens array
                    this.tokens = this.tokens.slice(0, this.tokens.length - ("boolean".length - 1));
                    // Push new token to tokens array
                    this.tokens.push(token);
                    // Test for string type
                }
                else if (rTYPESTR.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a TYPE token
                    var token = new JuiceC.Token(JuiceC.TokenType.TTYPE, "string", this.currentLineNum, this.currentColNum - ("string").length - 1);
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
                    var token = new JuiceC.Token(JuiceC.TokenType.TDIGIT, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for integer operator
                }
                else if (rINTOP.test(sourceCode.substring(this.startPtr, this.endPtr))) {
                    // Create a INTOP token
                    var token = new JuiceC.Token(JuiceC.TokenType.TINTOP, sourceCode.charAt(this.endPtr - 1), this.currentLineNum, this.currentColNum);
                    // Push to tokens array
                    this.tokens.push(token);
                    // Test for boolean equals
                }
            }
            return sourceCode;
        };
        return Lexer;
    }());
    JuiceC.Lexer = Lexer;
})(JuiceC || (JuiceC = {}));
