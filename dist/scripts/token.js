///<reference path="globals.ts" />
/*
    token.ts
*/
var JuiceC;
(function (JuiceC) {
    var TokenType;
    (function (TokenType) {
        // Lexer tokens
        TokenType["T_ID"] = "Id";
        TokenType["T_LBRACE"] = "LBrace";
        TokenType["T_RBRACE"] = "RBrace";
        TokenType["T_EOP"] = "EOP";
        TokenType["T_DIGIT"] = "Digit";
        TokenType["T_INTOP"] = "IntOp";
        TokenType["T_BOOLVAL"] = "BoolVal";
        TokenType["T_TYPE"] = "Type";
        TokenType["T_ASSIGN"] = "Assign";
        TokenType["T_BOOLOP"] = "BoolOp";
        TokenType["T_WHILE"] = "While";
        TokenType["T_IF"] = "If";
        TokenType["T_PRINT"] = "Print";
        TokenType["T_RPAREN"] = "RParen";
        TokenType["T_LPAREN"] = "LParen";
        TokenType["T_QUOTE"] = "Quote";
        TokenType["T_CHAR"] = "Char";
        TokenType["T_SPACE"] = "Space";
        TokenType["T_STRING"] = "String";
        TokenType["T_ADDITION"] = "Addition";
        TokenType["T_EQUALS"] = "Equals";
        TokenType["T_NOTEQUALS"] = "NotEquals";
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
