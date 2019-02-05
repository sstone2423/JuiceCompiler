///<reference path="globals.ts" />
/*
    warning.ts
*/
var JuiceC;
(function (JuiceC) {
    var WarningType;
    (function (WarningType) {
        WarningType["W_NO_EOP"] = "NO EOP";
    })(WarningType = JuiceC.WarningType || (JuiceC.WarningType = {}));
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
