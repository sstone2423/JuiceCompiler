///<reference path="globals.ts" />
/*
    token.ts
*/
var JuiceC;
(function (JuiceC) {
    var TokenType;
    (function (TokenType) {
        TokenType["T_ID"] = "TID";
        TokenType["T_LBRACE"] = "TLBRACE";
        TokenType["T_RBRACE"] = "TRBRACE";
        TokenType["T_EOP"] = "TEOP";
        TokenType["T_DIGIT"] = "TDIGIT";
        TokenType["T_INTOP"] = "TINTOP";
        TokenType["T_BOOLVAL"] = "TBOOLVAL";
        TokenType["T_TYPE"] = "TTYPE";
        TokenType["T_ASSIGN"] = "TASSIGN";
        TokenType["T_BOOLOP"] = "TBOOLOP";
        TokenType["T_WHILE"] = "TWHILE";
        TokenType["T_IF"] = "TIF";
        TokenType["T_PRINT"] = "TPRINT";
        TokenType["T_RPAREN"] = "TRPAREN";
        TokenType["T_LPAREN"] = "TLPAREN";
        TokenType["T_QUOTE"] = "TQUOTE";
        TokenType["T_CHAR"] = "TCHAR";
        TokenType["T_SPACE"] = "TSPACE";
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
