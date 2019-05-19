///<reference path="globals.ts" />
/**
 * scope.ts
 * 
 * Defines the Scope Tree's Hashmap Nodes
 */

module JuiceC {
    export class ScopeVariable {
        // Keys are the variable name
        key: string;
        // Values are the information about the variable
        token: Token;
        used: boolean;
        initialized: boolean;

        constructor (varName: string, token: Token) {
            this.key = varName;
            this.token = token;
            this.used = false;
            this.initialized = false;
        }
    }

    export const enum VariableType {
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
