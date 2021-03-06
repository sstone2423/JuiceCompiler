///<reference path="globals.ts" />
/**
 * scope.ts
 *
 * Defines the Scope Tree's Hashmap Nodes
 */
var JuiceC;
(function (JuiceC) {
    var ScopeVariable = /** @class */ (function () {
        function ScopeVariable(varName, token) {
            this.key = varName;
            this.token = token;
            this.used = false;
            this.initialized = false;
        }
        return ScopeVariable;
    }());
    JuiceC.ScopeVariable = ScopeVariable;
    var ScopeHashMap = /** @class */ (function () {
        function ScopeHashMap(lineNum, colNum, id) {
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.id = id;
            this.buckets = [];
        }
        return ScopeHashMap;
    }());
    JuiceC.ScopeHashMap = ScopeHashMap;
})(JuiceC || (JuiceC = {}));
