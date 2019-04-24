///<reference path="globals.ts" />
/* 
    warning.ts  
*/

module JuiceC {

    export const enum WarningType {
        // Lex warnings
        NO_EOP = "No EOP",
        // Semantic warnings
        USED_BEFORE_INIT = "Variable Used Before Being Initialized",
        UNINIT_VAR = "Uninitialized Variable",
        UNUSED_VAR = "Unused Variable"
    }

	export class Warning {
        warningType: string;
        value: any;
        lineNum: number;
        colNum: number;

        constructor (warningType: string, value: any, lineNum: number, colNum: number) {
            this.warningType = warningType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
    }

}