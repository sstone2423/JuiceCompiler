///<reference path="globals.ts" />
/*
    codegen.ts

*/
var JuiceC;
(function (JuiceC) {
    // Static data format: tempVariable, variableName, scope, offset
    var StaticData = /** @class */ (function () {
        function StaticData() {
        }
        return StaticData;
    }());
    JuiceC.StaticData = StaticData;
    var CodeGen = /** @class */ (function () {
        function CodeGen(semanticResult) {
            this.ast = semanticResult.ast;
            this.log = [];
            this.scopeTree = semanticResult.scopeTree;
            // Initialize code to 00's
            for (var i = 0; i < 256; i++) {
                this.generatedCode[i] = "00";
            }
            this.error = false;
            // Start from the beginning
            this.codePtr = 0;
            // Start at 0 from end AKA 256
            this.heapPtr = 256;
            this.scopeNodes = [];
            this.staticDataMap = new Map();
            this.staticDataCount = 0;
            this.jumpMap = new Map();
            this.jumpCount = 0;
        }
        CodeGen.prototype.generateCode = function () {
        };
        return CodeGen;
    }());
    JuiceC.CodeGen = CodeGen;
})(JuiceC || (JuiceC = {}));
