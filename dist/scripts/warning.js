///<reference path="globals.ts" />
/**
 *  warning.ts
 *
 *  Warning class that contains the Warning Type and the Line
 *  number and Column number of the warning instance.
 *  Warning Type string constants are located here as well
 */
var JuiceC;
(function (JuiceC) {
    var Warning = /** @class */ (function () {
        function Warning(warningType, value, lineNum, colNum) {
            this.warningType = warningType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
        return Warning;
    }());
    JuiceC.Warning = Warning;
})(JuiceC || (JuiceC = {}));
