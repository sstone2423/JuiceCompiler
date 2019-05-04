///<reference path="globals.ts" />
/* --------  
   Utils.ts

   Utility functions.
   -------- */

module JuiceC {

    export class Utils {

        // An easy-to understand implementation of the famous and common Rot13 obfuscator.
        public static rot13(str): string { // You can do this in three lines with a complex regular experssion, but I'd have
            let retVal: string = "";       // trouble explaining it in the future.  There's a lot to be said for obvious code.
            for (let i in str) {
                let ch = str[i];
                let code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {            
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

    }
}
