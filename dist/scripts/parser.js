///<reference path="globals.ts" />
/*
    parser.ts
*/
var JuiceC;
(function (JuiceC) {
    var Parser = /** @class */ (function () {
        function Parser() {
        }
        // Parse the completed lex programs
        Parser.prototype.parse = function (tokens) {
            // Grab the next token.
            currentToken = this.getNextToken();
            // A valid parse derives the G(oal) production, so begin there.
            this.parseG();
            // Report the results.
            //this.putMessage("Parsing found " + errorCount + " error(s).");        
        };
        // A G(oal) production can only be an E(xpression), so parse the E production.
        Parser.prototype.parseG = function () {
            this.parseE();
        };
        // Expression production
        Parser.prototype.parseE = function () {
            // All E productions begin with a digit, so make sure that we have one.
            this.checkToken("digit");
            // Look ahead 1 char (which is now in currentToken because checkToken 
            // consumes another one) and see which E production to follow.
            if (currentToken != EOF) {
                // We're not done, we expect to have an op.
                this.checkToken("op");
                this.parseE();
            }
            else {
                // There is nothing else in the token stream, 
                // and that's cool since E --> digit is valid.
                //this.putMessage("EOF reached");
            }
        };
        Parser.prototype.checkToken = function (expectedKind) {
            // Validate that we have the expected token kind and get the next token.
            switch (expectedKind) {
                case "digit": //this.putMessage("Expecting a digit");
                    if (currentToken == "0" || currentToken == "1" || currentToken == "2" ||
                        currentToken == "3" || currentToken == "4" || currentToken == "5" ||
                        currentToken == "6" || currentToken == "7" || currentToken == "8" ||
                        currentToken == "9") {
                        //this.putMessage("Got a digit!");
                    }
                    else {
                        errorCount++;
                        //this.putMessage("NOT a digit.  Error at position " + tokenIndex + ".");
                    }
                    break;
                case "op": //this.putMessage("Expecting an operator");
                    if (currentToken == "+" || currentToken == "-") {
                        //this.putMessage("Got an operator!");
                    }
                    else {
                        errorCount++;
                        //this.putMessage("NOT an operator.  Error at position " + tokenIndex + ".");
                    }
                    break;
                default: //this.putMessage("Parse Error: Invalid Token Type at position " + tokenIndex + ".");
                    break;
            }
            // Consume another token, having just checked this one, because that 
            // will allow the code to see what's coming next... a sort of "look-ahead".
            currentToken = this.getNextToken();
        };
        Parser.prototype.getNextToken = function () {
            var thisToken = EOF; // Let's assume that we're at the EOF.
            //if (tokenIndex < tokens.length) {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            //thisToken = tokens[tokenIndex];
            //this.putMessage("Current token:" + thisToken);
            //tokenIndex++;
            //}
            return thisToken;
        };
        return Parser;
    }());
    JuiceC.Parser = Parser;
})(JuiceC || (JuiceC = {}));
