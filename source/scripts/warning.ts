///<reference path="globals.ts" />
/* 
    warning.ts  
*/

module JuiceC {

    export const enum WarningType {
        // Lex warnings
        NoEOP = "No EOP",
        // Semantic warnings
        UsedBeforeInit = "Variable Used Before Being Initialized",
        UninitVar = "Uninitialized Variable",
        UnusedVar = "Unused Variable"
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