///<reference path="globals.ts" />
/* --------
   Utils.ts

   Utility functions.
   -------- */
var JuiceC;
(function (JuiceC) {
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        /**
         * An easy-to understand implementation of the famous and common Rot13 obfuscator.
         * @param str
         */
        Utils.rot13 = function (str) {
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };
        return Utils;
    }());
    JuiceC.Utils = Utils;
})(JuiceC || (JuiceC = {}));
