///<reference path="globals.ts" />
/**
 *  warning.ts
 * 
 *  Warning class that contains the Warning Type and the Line 
 *  number and Column number of the warning instance. 
 *  Warning Type string constants are located here as well
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
