///<reference path="globals.ts" />
/* 
    error.ts  
*/

module JuiceC {

    export const enum ErrorType {

        E_NO_END_QUOTE = "NO END QUOTE",
        E_NO_END_COMMENT = "NO END COMMENT",
        E_INVALID_T = "INVALID TOKEN",
    
    }

	export class Error {

        errorType: string;
        value: any;
        lineNum: number;
        colNum: number;

        constructor (errorType: string, value: any, lineNum: number, colNum: number) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
    }

}