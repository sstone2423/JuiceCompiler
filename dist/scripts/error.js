///<reference path="globals.ts" />
/*
    error.ts
*/
var JuiceC;
(function (JuiceC) {
    var ErrorType;
    (function (ErrorType) {
        ErrorType["E_NO_END_QUOTE"] = "NO END QUOTE";
        ErrorType["E_NO_END_COMMENT"] = "NO END COMMENT";
        ErrorType["E_INVALID_T"] = "INVALID TOKEN";
    })(ErrorType = JuiceC.ErrorType || (JuiceC.ErrorType = {}));
    var Error = /** @class */ (function () {
        function Error(errorType, value, lineNum, colNum) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
        return Error;
    }());
    JuiceC.Error = Error;
})(JuiceC || (JuiceC = {}));
