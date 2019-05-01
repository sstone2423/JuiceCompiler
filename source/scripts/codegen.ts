///<reference path="globals.ts" />
/* 
	codegen.ts

*/

module JuiceC {

    // Static data format: tempVariable, variableName, scope, offset
    export class StaticData {
        // temp: string -- Acts as the key to the staticDataMap
        var: string;
        scope: number;
        offset: number;
    }

	export class CodeGen {
        ast: Tree;
        scopeTree: Tree;
        log: Array<string>;
        generatedCode: Array<string>;
        error: boolean;
        codePtr: number;
        heapPtr: number;
        scopeNodes: Array<TreeNode>;
        // Static data format: tempVariable, variableName, scope, offset
        staticDataMap: Map<string, StaticData>;
        staticDataCount: number;
        // Jump format: tempVariable, distance
        jumpMap: Map<string, string>;
        jumpCount: number;

        constructor (semanticResult) {
            this.ast = semanticResult.ast;
            this.log = [];
            this.scopeTree = semanticResult.scopeTree;
            // Initialize code to 00's
            for (let i = 0; i < 256; i++) {
                this.generatedCode[i] = "00";
            }
            this.error = false;
            // Start from the beginning
            this.codePtr = 0;
            // Start at 0 from end AKA 256
            this.heapPtr = 256;
            this.scopeNodes = [];
            this.staticDataMap = new Map();
            this.staticDataCount = 0;
            this.jumpMap = new Map();
            this.jumpCount = 0;
        }

        public generateCode() {

        }
    }
}
