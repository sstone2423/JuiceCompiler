///<reference path="globals.ts" />
/* 
    scope.ts
*/

module JuiceC {

    export class ScopeVariable {
        // Keys are the variable name
        key: string;
        // Values are the information about the variable
        values: VariableInfo;

        constructor (varName: string) {
            this.key = varName;
        }

    }

    export class VariableInfo {
        lineNum: number;
        colNum: number;
        value: any;
        used: boolean;
        initialized: boolean;

        constructor (lineNum: number, colNum: number, value: any) {
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.value = value;
            this.used = false;
            this.initialized = false;
        }
    }

    export enum VariableType {
        Boolean = "boolean",
        Int = "int",
        String = "string"
    }

	export class ScopeHashMap {
        // Buckets hold each key:value pair
        buckets: Array<ScopeVariable>;
        lineNum: number;
        colNum: number;
        id: number;
        constructor (lineNum: number, colNum: number, id: number) {
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.id = id;
            this.buckets = [];
        }
    }

}