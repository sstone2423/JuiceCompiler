///<reference path="globals.ts" />
/* 
    warning.ts  
*/

module JuiceC {

    export const enum WarningType {
        NO_EOP = "No EOP",
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

    export class ScopeWarning extends Warning {
        scopeLine: number;
        scopeCol: number;
        scopeId: number;
        constructor(tokenType: WarningType, value: String, lineNum: number, colNum: number, node: ScopeHashMap){
            super(tokenType, value, lineNum, colNum);
            this.scopeLine = node.lineNum;
            this.scopeCol = node.colNum;
            this.scopeId = node.id;
        }
    }

}