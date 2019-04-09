///<reference path="globals.ts" />
/* 
    warning.ts  
*/

module JuiceC {

    export const enum WarningType {

        NO_EOP = "No EOP",
    
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