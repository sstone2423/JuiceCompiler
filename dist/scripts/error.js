///<reference path="globals.ts" />
/*
    error.ts
*/
var JuiceC;
(function (JuiceC) {
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
