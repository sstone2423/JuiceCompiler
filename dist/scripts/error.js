///<reference path="globals.ts" />
/*
    error.ts

    Error class for the Lexer and Parser that contain the Error Type, Value that was given instead of the one that was expected,
    and the Line number and Column number of the error instance.
*/
var JuiceC;
(function (JuiceC) {
    var Error = /** @class */ (function () {
        function Error(errorType, value, lineNum, colNum, expectedToken) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.expectedToken = expectedToken;
        }
        return Error;
    }());
    JuiceC.Error = Error;
})(JuiceC || (JuiceC = {}));
