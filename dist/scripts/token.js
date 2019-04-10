///<reference path="globals.ts" />
/*
    token.ts
*/
var JuiceC;
(function (JuiceC) {
    var TokenType;
    (function (TokenType) {
        // Lexer tokens
        TokenType["ID"] = "Id";
        TokenType["LBRACE"] = "LBrace";
        TokenType["RBRACE"] = "RBrace";
        TokenType["EOP"] = "EOP";
        TokenType["DIGIT"] = "Digit";
        TokenType["INTOP"] = "IntOp";
        TokenType["BOOLVAL"] = "BoolVal";
        TokenType["TYPE"] = "Type";
        TokenType["ASSIGN"] = "Assign";
        TokenType["BOOLOP"] = "BoolOp";
        TokenType["WHILE"] = "While";
        TokenType["IF"] = "If";
        TokenType["PRINT"] = "Print";
        TokenType["RPAREN"] = "RParen";
        TokenType["LPAREN"] = "LParen";
        TokenType["QUOTE"] = "Quote";
        TokenType["CHAR"] = "Char";
        TokenType["SPACE"] = "Space";
        TokenType["STRING"] = "String";
        TokenType["ADDITION"] = "Addition";
        TokenType["EQUALS"] = "Equals";
        TokenType["NOTEQUALS"] = "NotEquals";
    })(TokenType = JuiceC.TokenType || (JuiceC.TokenType = {}));
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
