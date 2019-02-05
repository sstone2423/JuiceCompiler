///<reference path="globals.ts" />
/*
    lexer.ts
*/
var JuiceC;
(function (JuiceC) {
    var Lexer = /** @class */ (function () {
        function Lexer() {
            // Token array
            this.tokens = [];
            // Error array
            this.errors = [];
            // Warning array
            this.warnings = [];
            // Pointers that indicate which characters are being matched
            this.startPtr = 0;
            this.endPtr = 1;
            // Initialize to first line and first column
            this.currentLineNum = 1;
            this.currentColNum = 0;
        }
        Lexer.prototype.lex = function () {
            // Grab the "raw" source code.
            var sourceCode = document.getElementById("sourceCode").value;
            // Trim the leading and trailing spaces.
            sourceCode = JuiceC.Utils.trim(sourceCode);
            // TODO: remove all spaces in the middle; remove line breaks too.
            return sourceCode;
        };
        return Lexer;
    }());
    JuiceC.Lexer = Lexer;
})(JuiceC || (JuiceC = {}));
