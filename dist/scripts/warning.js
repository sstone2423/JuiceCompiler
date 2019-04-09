///<reference path="globals.ts" />
/*
    warning.ts
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var ScopeWarning = /** @class */ (function (_super) {
        __extends(ScopeWarning, _super);
        function ScopeWarning(tokenType, value, lineNum, colNum, node) {
            var _this = _super.call(this, tokenType, value, lineNum, colNum) || this;
            _this.scopeLine = node.lineNum;
            _this.scopeCol = node.colNum;
            _this.scopeId = node.id;
            return _this;
        }
        return ScopeWarning;
    }(Warning));
    JuiceC.ScopeWarning = ScopeWarning;
})(JuiceC || (JuiceC = {}));
