///<reference path="globals.ts" />
/*
    token.ts
*/
var JuiceC;
(function (JuiceC) {
    var TokenType;
    (function (TokenType) {
        // Lexer tokens
        TokenType["T_ID"] = "ID";
        TokenType["T_LBRACE"] = "LBRACE";
        TokenType["T_RBRACE"] = "RBRACE";
        TokenType["T_EOP"] = "EOP";
        TokenType["T_DIGIT"] = "DIGIT";
        TokenType["T_INTOP"] = "INTOP";
        TokenType["T_BOOLVAL"] = "BOOLVAL";
        TokenType["T_TYPE"] = "TYPE";
        TokenType["T_ASSIGN"] = "ASSIGN";
        TokenType["T_BOOLOP"] = "BOOLOP";
        TokenType["T_WHILE"] = "WHILE";
        TokenType["T_IF"] = "IF";
        TokenType["T_PRINT"] = "PRINT";
        TokenType["T_RPAREN"] = "RPAREN";
        TokenType["T_LPAREN"] = "LPAREN";
        TokenType["T_QUOTE"] = "QUOTE";
        TokenType["T_CHAR"] = "CHAR";
        TokenType["T_SPACE"] = "SPACE";
        TokenType["T_STRING"] = "STRING";
        TokenType["T_ADDITION"] = "ADDITION";
        TokenType["T_EQUALS"] = "EQUALS";
        TokenType["T_NOTEQUALS"] = "NOTEQUALS";
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
