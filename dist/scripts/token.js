///<reference path="globals.ts" />
/*
    token.ts
*/
var JuiceC;
(function (JuiceC) {
    var TokenType;
    (function (TokenType) {
        TokenType["TID"] = "TID";
        TokenType["TLBRACE"] = "TLBRACE";
        TokenType["TRBRACE"] = "TRBRACE";
        TokenType["TEOP"] = "TEOP";
        TokenType["TDIGIT"] = "TDIGIT";
        TokenType["TINTOP"] = "TINTOP";
        TokenType["TBOOLVAL"] = "TBOOLVAL";
        TokenType["TTYPE"] = "TTYPE";
        TokenType["TASSIGN"] = "TASSIGN";
        TokenType["TBOOLOP"] = "TBOOLOP";
        TokenType["TWHILE"] = "TWHILE";
        TokenType["TIF"] = "TIF";
        TokenType["TPRINT"] = "TPRINT";
        TokenType["TRPAREN"] = "TRPAREN";
        TokenType["TLPAREN"] = "TLPAREN";
        TokenType["TQUOTE"] = "TQUOTE";
        TokenType["TCHAR"] = "TCHAR";
        TokenType["TSPACE"] = "TSPACE";
        TokenType["TSTRING"] = "STRING";
        TokenType["TADDITION"] = "ADDITION";
        TokenType["TEQUALS"] = "EQUALS";
        TokenType["TNOTEQUALS"] = "NOTEQUALS";
    })(TokenType = JuiceC.TokenType || (JuiceC.TokenType = {}));
    var Token = /** @class */ (function () {
        function Token(tokenType, value, lineNumber, colNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
        return Token;
    }());
    JuiceC.Token = Token;
})(JuiceC || (JuiceC = {}));
