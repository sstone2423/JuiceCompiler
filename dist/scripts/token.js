///<reference path="globals.ts" />
/**
 * token.ts
 *
 * Represents the Token object created in the Lexer. These tokens are defined from the grammar
 * and contain information about the TokenType, value, line number, and column number
 *  */
var JuiceC;
(function (JuiceC) {
    var Token = /** @class */ (function () {
        function Token(tokenType, value, lineNum, colNum) {
            this.type = tokenType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
        return Token;
    }());
    JuiceC.Token = Token;
})(JuiceC || (JuiceC = {}));
