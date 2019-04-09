///<reference path="globals.ts" />
/*
    error.ts

    Error class for the Lexer and Parser that contain the Error Type, Value that was given instead of the one that was expected,
    and the Line number and Column number of the error instance.
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
    // For Duplicate Variable and Undeclared Variable
    var ScopeError = /** @class */ (function (_super) {
        __extends(ScopeError, _super);
        function ScopeError(tokenType, value, lineNumber, colNumber, firstDeclareLine, firstDeclareCol) {
            var _this = _super.call(this, tokenType, value, lineNumber, colNumber) || this;
            _this.firstDeclareLine = firstDeclareLine;
            _this.firstDeclareCol = firstDeclareCol;
            return _this;
        }
        return ScopeError;
    }(Error));
    JuiceC.ScopeError = ScopeError;
    // For Type Mismatch
    var TypeError = /** @class */ (function (_super) {
        __extends(TypeError, _super);
        function TypeError(tokenType, value, lineNumber, colNumber, idType, targetType) {
            var _this = _super.call(this, tokenType, value, lineNumber, colNumber) || this;
            _this.targetType = targetType;
            _this.idType = idType;
            return _this;
        }
        return TypeError;
    }(Error));
    JuiceC.TypeError = TypeError;
})(JuiceC || (JuiceC = {}));
