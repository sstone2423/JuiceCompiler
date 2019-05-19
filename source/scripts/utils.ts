///<reference path="globals.ts" />
/* --------  
   Utils.ts

   Utility functions.
   -------- */

module JuiceC {
    export class Utils {
        /**
         * An easy-to understand implementation of the famous and common Rot13 obfuscator.
         * @param str 
         */
        static rot13(str): string {
            let retVal = "";
            for (const i in str) {
                const ch = str[i];
                let code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }

            return retVal;
        }
    }
}
