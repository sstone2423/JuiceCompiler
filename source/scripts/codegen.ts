///<reference path="globals.ts" />
/* 
	codegen.ts

*/

module JuiceC {

    // Static data format: tempLocation, variableName, scope, offset, location
    export class StaticData {
        // tempLocation: string -- Acts as the key to the staticDataMap
        var: string;
        type: string;
        scope: number;
        offset: number;
        loc: string;
    }

    const MAX_BYTE_SIZE: number = 256;
    const TERMINATOR: string = "00"; // pun intended
    const ZERO_ONE: string = "01";
    const ZERO_TWO: string = "02";
    const ZERO_A: string = "0A";
    const FE: string = "FE";
    const T: string = "T";
    const J: string = "J";
    const TRUE_LOCATION: string = (245).toString(16).toUpperCase();
    const FALSE_LOCATION: string = (250).toString(16).toUpperCase()

	export class CodeGen {
        // From Semantic Result
        ast: Tree;
        scopeTree: Tree;
        // Populates from the scope tree
        scopeNodes: Array<TreeNode>;
        log: Array<string>;

        // Holds the generatedCode
        generatedCode: Array<string>;
        error: boolean;
        errors: number;
        // Points to the beginning of the stack and increments as new code is added
        codePtr: number;
        // Points to the beginning of the heap (at the end of the generatedCode array)
        heapPtr: number;
        
        // Static data format: tempVariable, var, scope, offset
        staticDataMap: Map<string, StaticData>;
        // Number of staticData entries
        staticDataCount: number;
        // Keeps track of the staticData area
        staticPtr: number;
        // Jump format: tempVariable, distance
        jumpMap: Map<string, string>;
        // Number of jump entries
        jumpCount: number;
        // Keeps track of the current scope
        scopePtr: number;
        // Keeps track of the heap entries
        heapMap: Map<string, any>;
        
        constructor (semanticResult) {
            this.ast = semanticResult.ast;
            this.log = [];
            this.scopeTree = semanticResult.scopeTree;
            this.scopePtr = -1;
            this.generatedCode = []
            // Initialize code to 00's
            for (let i = 0; i < MAX_BYTE_SIZE; i++) {
                this.generatedCode[i] = TERMINATOR;
            }
            this.error = false;
            this.errors = 0;
            // Start from the beginning
            this.codePtr = 0;
            // Start at 0 from end AKA 256
            this.heapPtr = MAX_BYTE_SIZE;
            this.scopeNodes = [];
            this.staticDataMap = new Map();
            this.staticDataCount = 0;
            this.staticDataCount = 0;
            this.jumpMap = new Map();
            this.jumpCount = 0;
            this.staticPtr = 0;
            this.heapMap = new Map();
            // Load accumulator with 0
            this.loadAccWithConst(TERMINATOR);
            // Add true and false strings to the heap
            this.generatedCode[254] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[253] = "s".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[252] = "l".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[251] = "a".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[250] = "f".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[248] = "e".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[247] = "u".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[246] = "r".charCodeAt(0).toString(16).toUpperCase();
            this.generatedCode[245] = "t".charCodeAt(0).toString(16).toUpperCase();
            // Update the heapPtr
            this.heapPtr = 245;
        }

        // Generates opcodes by recursively traversing the AST
        public generateCode(): boolean {
            // Retrieve the scope nodes from the SemanticResult scopeTree
            this.scopeNodes = this.scopeTree.traverseTree();
            this.traverseAST(this.ast.root);
            if (this.error) {
                return false;
            }
            this.createStaticArea();
            // Backpatch the static and jump variables on the op codes
            this.backPatch();
            return true;
        }

        /**
         * Helper to generateCode, performs recursive traversing and code generation
         * @param astNode AST node from semanticResult
         */
        private traverseAST(astNode: TreeNode) {
            if (this.error) {
                return;
            }

            // Determine what kind of production the node is
            switch (astNode.value) {
                // Traverse to the next scope node so we can look at that scope
                case Production.Block:
                    // Increment the scope
                    this.scopePtr++;
                    // Recursively traverse the node's children
                    for (let i = 0; i < astNode.children.length; i++) {
                        this.traverseAST(astNode.children[i]);
                    }
                    break;

                case Production.PrintStatement:
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for [ " + Production.PrintStatement + " ] in Scope " + this.scopeNodes[this.scopePtr].value.id);
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for printing a(n) " + astNode.children[0].value.type);
                    // Determine type of child
                    switch (astNode.children[0].value.type) {
                        case TokenType.Digit:
                            // Load y register with constant of value digit as string
                            this.loadYWithConst(ZERO + astNode.children[0].value.value);
                            this.loadXWithConst(ZERO_ONE);
                            break;

                        case TokenType.String:
                            // Put string in heap and get the pointer
                            let stringPtr: string = this.allocateStringInHeap(astNode.children[0].value.value);
                            this.loadYWithConst(stringPtr);
                            this.loadXWithConst(ZERO_TWO);
                            break;

                        case TokenType.BoolVal:
                            if (astNode.children[0].value.value == TRUE) {
                                this.loadYWithConst(TRUE_LOCATION);
                            }
                            else if(astNode.children[0].value.value == FALSE){
                                this.loadYWithConst(FALSE_LOCATION);
                            }
                            this.loadXWithConst(ZERO_TWO);
                            break;

                        case TokenType.Id:
                            let tempVar = astNode.children[0].value.value;
                            let scope = astNode.children[0].value.scopeId;
                            var tempAddress: string = this.findVariableInStaticMap(tempVar, scope);
                            this.loadYFromMem(tempAddress);
                            if (this.staticDataMap.get(tempAddress)["type"] == VariableType.String || 
                                this.staticDataMap.get(tempAddress)["type"] == VariableType.Boolean) {
                                this.loadXWithConst(ZERO_TWO);
                            }
                            else{
                                this.loadXWithConst(ZERO_ONE);
                            }
                            break;

                        case TokenType.Equals:
                            var address: string = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            // If equal, branch and print true
                            this.branchNBytes(ZERO_A);
                            this.loadYWithConst(TRUE_LOCATION);
                            // Set x register to address, compare same address to x register to set z to zero
                            this.loadXFromMem(Instruction.SysCall);
                            this.compareMemToX(FE);
                            // Compares that address and x register, branches if unequal
                            this.branchNBytes(ZERO_TWO);
                            this.loadYWithConst(FALSE_LOCATION);
                            this.loadXWithConst(ZERO_TWO);
                            break;

                        case TokenType.NotEquals:
                            var address: string = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            // If equal, branch, print true
                            this.branchNBytes(ZERO_A);
                            // If not equal, don't branch, print false
                            this.loadYWithConst(FALSE_LOCATION);
                            // Set x register to address, compare same address to x register to set z to zero
                            this.loadXFromMem(Instruction.SysCall);
                            // Compares address and x register, branches if unequal
                            this.compareMemToX(FE);
                            this.branchNBytes(ZERO_TWO);
                            // Load y with true
                            this.loadYWithConst(TRUE_LOCATION);
                            this.loadXWithConst(ZERO_TWO);
                            break;

                        case TokenType.Addition:
                            var tempAddress: string = this.generateAddition(astNode.children[0]);
                            this.loadYFromMem(tempAddress);
                            // Set x register to 1
                            this.loadXWithConst(ZERO_ONE);
                            break;

                        default:
                            this.addError();
                            Error.logUnknownError(CODEGEN, this.log);                    
                    }
                    this.writeCode(Instruction.SysCall);
                    break;

                case Production.VarDeclaration:
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for [ " + Production.VarDeclaration + " ] in Scope " + this.scopeNodes[this.scopePtr].value.id);
                    // Set a new staticData entry
                    var temp = T + this.staticDataCount;
                    this.staticDataMap.set(temp, {
                        "var": astNode.children[1].value.value,
                        "type": astNode.children[0].value,
                        "scope": astNode.children[1].value.scopeId,
                        "offset": this.staticDataCount,
                        "loc": ""
                    });
                    this.storeAccInMemWithTempLoc(temp);
                    // Increment the static count
                    this.staticDataCount++;
                    break;

                case Production.AssignStatement:
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for [ " + Production.AssignStatement + " ] in Scope " + this.scopeNodes[this.scopePtr].value.id);
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for assigning a " + astNode.children[1].value.type + " to a(n) " + astNode.children[0].value.type);
                    // Determine assignment type
                    switch (astNode.children[1].value.type) {
                        case TokenType.Digit:
                            // Load digit as constant into accumulator
                            this.loadAccWithConst(ZERO + astNode.children[1].value.value);
                            break;

                        case TokenType.String:
                            // Put string in heap and get ptr to it
                            let stringPtr: string = this.allocateStringInHeap(astNode.children[1].value.value);
                            // Load into accumulator as constant
                            this.loadAccWithConst(stringPtr);
                            break;

                        case TokenType.BoolVal:
                            if (astNode.children[1].value.value == TRUE) {
                                this.loadAccWithConst(TRUE_LOCATION);
                            } else if (astNode.children[1].value.value == FALSE) {
                                this.loadAccWithConst(FALSE_LOCATION);
                            }
                            break;

                        case TokenType.Id:
                            // Look up variable in static table, load its temp address into accumulator
                            let tempVar = astNode.children[1].value.value;
                            let scope = astNode.children[1].value.scopeId;
                            var address: string = this.findVariableInStaticMap(tempVar, scope);
                            this.LoadAccFromMem(address);
                            break;

                        case TokenType.Addition:
                            // Result will go into the accumulator
                            this.generateAddition(astNode.children[1]);
                            break;

                        case TokenType.Equals:
                            // Get the address being comparing to the x register
                            var address: string = this.generateEquals(astNode.children[1]);
                            this.compareMemToX(address);
                            // If vals are equal, should get 1 in z flag
                            this.loadAccWithConst(FALSE_LOCATION);
                            // Branch if vals are unequal
                            this.branchNBytes(ZERO_TWO);
                            this.loadAccWithConst(TRUE_LOCATION);
                            break;

                        case TokenType.NotEquals:
                            // Get the address being comparing to the x register
                            var address: string = this.generateEquals(astNode.children[1]);
                            this.compareMemToX(address);
                            this.loadAccWithConst(TERMINATOR);
                            // Branch if not equal
                            this.branchNBytes(ZERO_TWO);
                            // If equal, load acc with 1
                            this.loadAccWithConst(ZERO_ONE);
                            this.loadXWithConst(TERMINATOR);
                            var temp: string = TERMINATOR;
                            this.storeAccInMemWithTempLoc(temp);
                            this.compareMemToX(temp);
                            this.loadAccWithConst(FALSE_LOCATION);
                            // Branch if vals are equal
                            this.branchNBytes(ZERO_TWO);
                            this.loadAccWithConst(TRUE_LOCATION);
                            break;

                        default:
                            this.addError();
                            Error.logUnknownError(CODEGEN, this.log);
                    }
                    // Find the temp address of tempVar
                    let tempVar = astNode.children[0].value.value;
                    let scope = astNode.children[0].value.scopeId;
                    var tempAddress = this.findVariableInStaticMap(tempVar, scope);
                    this.storeAccInMemWithTempLoc(tempAddress);
                    break;

                case Production.WhileStatement:
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for [ " + Production.WhileStatement + " ] in Scope " + this.scopeNodes[this.scopePtr].value.id);
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for a while condition on a(n) " + astNode.children[0].value.type);
                    let whileStartPtr = this.codePtr;
                    var address: string;
                    // Evaluate left-hand side boolean result first
                    switch (astNode.children[0].value.type) {
                        // If left-hand side is a boolean value, set zero flag to 1 if true, set zero flag to 0 if false
                        case TokenType.BoolVal:
                            if (astNode.children[0].value.value == TRUE) {
                                this.loadXFromMem(TRUE_LOCATION);
                            } else {
                                this.loadXFromMem(FALSE_LOCATION);
                            }
                            this.compareMemToX(TRUE_LOCATION);
                            break;

                        case TokenType.Equals:
                            // Get the address being comparing to the x register
                            address = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            // If vals are equal, z flag will be 1
                            break;
                            
                        case TokenType.NotEquals:
                            // Get the address being comparing to the x register
                            address = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            this.loadAccWithConst(TERMINATOR);
                            // Branch if not equal
                            this.branchNBytes(ZERO_TWO);
                            this.loadAccWithConst(ZERO_ONE);
                            this.loadXWithConst(TERMINATOR);
                            var temp = TERMINATOR;
                            this.storeAccInMemWithTempLoc(temp);
                            this.compareMemToX(temp);
                            // If vals are equal, z flag will be 1
                            break;
                        
                        default:
                            this.addError();
                            Error.logUnknownError(CODEGEN, this.log);
                    }
                    // Z flag has now been assigned. set acc to 1
                    this.loadAccWithConst(ZERO_ONE);
                    this.branchNBytes(ZERO_TWO);
                    // If z flag is 1, then set accumulator to zero
                    this.loadAccWithConst(TERMINATOR);
                    this.loadXWithConst(TERMINATOR);
                    var temp = TERMINATOR;
                    this.storeAccInMemWithTempLoc(temp);
                    this.compareMemToX(temp);
                    // jump
                    // need to make entry in jump table
                    let endWhileJump = J + this.jumpCount;
                    this.jumpCount++;
                    var startOfBranchPtr = this.codePtr;
                    this.branchNBytes(endWhileJump);
                    // evaluate the RHS, which is just recursing to generate proper codes
                    this.traverseAST(astNode.children[1]);
                    // generate end of while loop codes, which is the unconditional jump to top of loop
                    this.loadAccWithConst(TERMINATOR);
                    let uncond = TERMINATOR;
                    this.storeAccInMemWithTempLoc(uncond);
                    this.loadXWithConst(ZERO_ONE);
                    // compare x reg and uncond to always branch
                    this.compareMemToX(uncond);
                    let whileJump = J + this.jumpCount;
                    this.jumpCount++;
                    this.branchNBytes(whileJump);
                    // figure out how much to jump based on current codePtr and where the op codes for the while loop start
                    // (size-current) + start. OS will take care of modulus
                    var jumpValue = ((this.generatedCode.length - (this.codePtr)) + whileStartPtr).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        jumpValue = ZERO + jumpValue;
                    }
                    this.jumpMap.set(whileJump,jumpValue);
                    // insert jump value for end of while loop
                    // we have to account for d0 and xx so hence +2
                    jumpValue = (this.codePtr - (startOfBranchPtr + 2)).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        jumpValue = ZERO + jumpValue;
                    }
                    this.jumpMap.set(endWhileJump, jumpValue);
                    break;

                case Production.IfStatement:
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for [ " + Production.IfStatement + " ] in Scope " + this.scopeNodes[this.scopePtr].value.id);
                    this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for an if condition on a(n) " + astNode.children[0].value.type);
                    // look at its left and right children
                    switch (astNode.children[0].value.type) {
                        // If left-hand side is a boolean value, set zero flag to 1 if true, set zero flag to 0 if false
                        case TokenType.BoolVal:
                            if (astNode.children[0].value.value == TRUE) {
                                this.loadXFromMem(TRUE_LOCATION);
                            } else {
                                this.loadXFromMem(FALSE_LOCATION);
                            }
                            this.compareMemToX(TRUE_LOCATION);
                            break;

                        // If left-hand side is a boolean expression equality 
                        case TokenType.Equals:
                            // Get back the address that is being compared with the x register
                            var address: string = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            break;

                        case TokenType.NotEquals:
                            // Get back the address that is being compared with the x register
                            var address = this.generateEquals(astNode.children[0]);
                            this.compareMemToX(address);
                            this.loadAccWithConst(TERMINATOR);
                            // Branch if not equal
                            this.branchNBytes(ZERO_TWO);
                            // If equal, load acc with 1
                            this.loadAccWithConst(ZERO_ONE);
                            this.loadXWithConst(TERMINATOR);
                            var temp = TERMINATOR;
                            this.storeAccInMemWithTempLoc(temp);
                            this.compareMemToX(temp);
                            break;
                    }
                    var jumpTemp = J + this.jumpCount;
                    var startOfBranchPtr = this.codePtr;
                    this.branchNBytes(jumpTemp);
                    // Increment the jump id
                    this.jumpCount++;
                    this.traverseAST(astNode.children[1]);
                    // Determine jump bytes: + 2 for offset because we use 2 op codes to store branch
                    var jumpValue = (this.codePtr - (startOfBranchPtr + 2)).toString(16).toUpperCase();
                    if (jumpValue.length < 2) {
                        jumpValue = ZERO + jumpValue;
                    }
                    this.jumpMap.set(jumpTemp, jumpValue);
                    break;
            }
        }

        /** 
         * Sets the op code in the code array as code is passed in
         * @param code is the specificied opcode
         * */ 
        private writeCode(code: string): void {
            this.generatedCode[this.codePtr++] = code;
            this.log.push(DEBUG + " - " + CODEGEN + " - Generating " + code + " at index " + this.codePtr);
            // If code pointer is overflowing into the heap, throw an error
            if (this.codePtr >= this.heapPtr) {
                this.addError();
                this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.ExceedStackLimit + ". The Stack has reached the heap inducing Stack overflow")
            }
        }

        /**
         * Generates opcodes for an Equals expression
         * @param equalsNode takes in the equals node
         */
        private generateEquals(equalsNode): string {
            this.log.push(DEBUG + " - " + CODEGEN + " - Generating Op Codes for a " + Production.BooleanExpr + " comparing a(n) " + equalsNode.children[0].value.type + " to a(n) " + equalsNode.children[1].value.type);
            // LHS: load what is in left-hand side into x register
            switch (equalsNode.children[0].value.type) {
                case TokenType.Digit:
                    // Load digit as constant into x register
                    this.loadXWithConst(ZERO + equalsNode.children[0].value.value);
                    break;

                case TokenType.String:
                    // Add stringPtr in heap to x register as constant
                    let stringPtr: string = this.allocateStringInHeap(equalsNode.children[0].value.value);
                    this.loadXWithConst(stringPtr);
                    break;

                case TokenType.BoolVal:
                    // Put ptr of boolean val to x register as constant
                    if (equalsNode.children[0].value.value == TRUE) {
                        this.loadXWithConst(TRUE_LOCATION);
                    } else if (equalsNode.children[0].value.value == FALSE) {
                        this.loadXWithConst(FALSE_LOCATION);
                    }
                    break;

                case TokenType.Id:
                    // Look up variable in static table, get its temp address, and load it into x register
                    var variable = equalsNode.children[0].value.value;
                    var scope = equalsNode.children[0].value.scopeId;
                    var tempAddress: string = this.findVariableInStaticMap(variable, scope);
                    this.loadXFromMem(tempAddress);
                    break;

                case TokenType.Addition:
                    // Load result of addition in acc (which was stored in static storage) to x register
                    var memAddress: string = this.generateAddition(equalsNode.children[0]);
                    this.loadXFromMem(memAddress);
                    break;

                case TokenType.Equals:
                    // TODO: Nested Booleans
                    // for now, throw error showing nonsupport
                    this.addError();
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.NestedBoolean + ". Nested booleans are not supported at this time")
                    break;

                case TokenType.NotEquals:
                    // TODO: Nested Booleans
                    // for now, throw error showing nonsupport
                    this.addError();
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.NestedBoolean + ". Nested booleans are not supported at this time")
                    break;
            }
            // RHS: compare to address of what right-hand side is. actually, just return mem address of right-hand side
            switch (equalsNode.children[1].value.type) {
                case TokenType.Digit:
                    this.loadAccWithConst(ZERO + equalsNode.children[1].value.value);
                    var temp = TERMINATOR;
                    this.storeAccInMemWithTempLoc(temp);
                    return temp;

                case TokenType.String:
                    // Perform comparison of x register to this temp address
                    let stringPtr = this.allocateStringInHeap(equalsNode.children[1].value.value);
                    this.loadAccWithConst(stringPtr);
                    var temp = TERMINATOR;
                    this.storeAccInMemWithTempLoc(temp);
                    return temp;

                case TokenType.BoolVal:
                    if (equalsNode.children[1].value.value == TRUE) {
                        this.loadAccWithConst(TRUE_LOCATION);
                        var temp = TERMINATOR;
                        this.storeAccInMemWithTempLoc(temp);
                        return temp;
                    } else if (equalsNode.children[1].value.value == FALSE) {
                        this.loadAccWithConst(FALSE_LOCATION);
                        var temp = TERMINATOR;
                        this.storeAccInMemWithTempLoc(temp);
                        return temp;
                    }
                    break;

                case TokenType.Id:
                    // Compare x register to address of id
                    var variable = equalsNode.children[1].value.value;
                    var scope = equalsNode.children[1].value.scopeId;
                    var temp: string = this.findVariableInStaticMap(variable, scope);
                    return temp;

                case TokenType.Addition:
                    // Return result of addition in accumulator (which was stored in static storage)
                    var memAddress: string = this.generateAddition(equalsNode.children[1]);
                    return memAddress;

                case TokenType.Equals:
                    // TODO: Nested booleans
                    this.addError();
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.NestedBoolean + ". Nested booleans are not supported at this time");

                    break;

                case TokenType.NotEquals:
                    // TODO: Nested booleans
                    this.addError();
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.NestedBoolean + ". Nested booleans are not supported at this time");
                    break;
            }
        }

        /**
         * Generates op codes for an addition node
         * We evaluate from right-left
         * @param node the addition node
         */
        private generateAddition(additionNode: TreeNode): string {
            // RHS: load whatever it is into some new address in static memory
            var temp: string = TERMINATOR;
            switch (additionNode.children[1].value.type) {
                case TokenType.Digit:
                    this.loadAccWithConst(ZERO + additionNode.children[1].value.value);
                    this.storeAccInMemWithTempLoc(temp);
                    break;

                case TokenType.Id:
                    var variable = additionNode.children[1].value.value;
                    var scope = additionNode.children[1].value.scopeId;
                    var address = this.findVariableInStaticMap(variable, scope);
                    this.LoadAccFromMem(address);
                    this.storeAccInMemWithTempLoc(temp);
                    break;

                case TokenType.Addition:
                    // Generate addition opcodes, which will generate a result in the accumulator. Use that 
                    // result and add it to left-hand side of current (current is loaded into accumulator)
                    var memAddressResult: string = this.generateAddition(additionNode.children[1]);
                    temp = memAddressResult;
                    break;
            }
            // LHS: can only be a digit
            switch(additionNode.children[0].value.type){
                case TokenType.Digit:
                    this.loadAccWithConst(ZERO + additionNode.children[0].value.value);
                    break;
            }
            this.writeCode(Instruction.AddWithCarry);
            this.writeCode(temp);
            this.writeCode(TERMINATOR);
            temp = TERMINATOR;
            this.storeAccInMemWithTempLoc(temp);
            return temp;
        }

        /**
         * Creates area after code in generatedCode as static area
         * Insert 00 break between code and static area
         * If static area collides with heap, throw error
         */
        private createStaticArea(): void {
            this.staticPtr = this.codePtr + 1;
            // Determine how many variables need to be stored
            let numberOfVariables = this.staticDataMap.size;
            // Check if the static area overflows into heap
            if (this.staticPtr + numberOfVariables >= this.heapPtr) {
                this.addError();
                this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + ": " + ErrorType.ExceedStaticLimit
                            + ". The Static area overflowed into the heap")
                return;
            }
            // Start assigning memory addresses for variables in statics table
            let itr = this.staticDataMap.keys();
            for (let i = 0; i < this.staticDataMap.size; i++) {
                let temp = itr.next();
                let newAddr = this.staticPtr.toString(16).toUpperCase();
                if (newAddr.length < 2) {
                    newAddr = ZERO + newAddr;
                }
                this.staticDataMap.get(temp.value)["loc"] = newAddr;
                this.staticPtr++;
            }
        }

        /**
         * Iterates through the generated code replacing temporary jump and static variables with references to variables
         */
        private backPatch(): void {
            // When coming across placeholders for variables, lookup in map, replace with its location
            for (let i = 0; i < this.generatedCode.length; i++) {
                if (this.generatedCode[i].charAt(0) == T) {
                    let temp = this.generatedCode[i];
                    let memAddr = this.staticDataMap.get(temp)["loc"];
                    this.generatedCode[i] = memAddr;
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + BACKPATCH + " Static Variable Placeholder " 
                                + temp + " at Address: " + i.toString(16).toUpperCase() + " with Memory Address: " + memAddr);
                }
                // found a placeholder for jump
                if (this.generatedCode[i].charAt(0) == J) {
                    let temp = this.generatedCode[i];
                    let jumpAmount = this.jumpMap.get(temp);
                    this.generatedCode[i] = jumpAmount;
                    this.log.push(DEBUG + " - " + CODEGEN + " - " + BACKPATCH + " Jump Variable Placeholder " 
                                + temp + " at Address: " + i.toString(16).toUpperCase() + " forward " + jumpAmount + " address(es)");
                }
            }
        }
        
        /**
         * Given a variable and scope, looks for it in the static map
         * @param variable the variable name
         * @param scope the scope the variable is in
         */
        private findVariableInStaticMap(variable: string, scope: number): string {
            let currScope = this.scopeNodes[this.scopePtr];
            let itr = this.staticDataMap.entries();
            while (true) {
                for (let i = 0; i < this.staticDataMap.size; i++) {
                    let staticObject = itr.next();
                    if (staticObject.value[1]["var"] == variable && staticObject.value[1]["scope"] == scope) {
                        // Return the variable's temp address
                        return staticObject.value[0].toString();
                    }
                }
                itr = this.staticDataMap.entries();
                // If scope is not found, ascend the tree continually looking
                currScope = currScope.parent;
                scope = currScope.value.id;
            }
        }

        /**
         * Given a string, put it in the heap and return a pointer to beginning of string
         * Make sure heap ptr doesn't collide with op ptr
         * @param string the string to store
         * @return hex string of pointer
         */
        private allocateStringInHeap(allocString: string): string {
            // Trim off quotes
            let trimmedString: string = allocString.substring(1, allocString.length-1);
            // If string already exists in heap, return its address
            if (this.heapMap.has(trimmedString)) {
                return this.heapMap.get(trimmedString)["ptr"];
            }
            let len = trimmedString.length;
            // Subtract length + 1 from heapPtr, +1 because strings are 00 terminated
            this.heapPtr = this.heapPtr - (len + 1);
            let stringPtr = this.heapPtr;
            // Put in characters converted to hex strings into heap
            for (let i = this.heapPtr; i < this.heapPtr + len; i++) {
                this.generatedCode[i] = trimmedString.charCodeAt(i - this.heapPtr).toString(16).toUpperCase();
            }
            // Store in heap map
            this.heapMap.set(trimmedString, {
                "ptr": stringPtr.toString(16).toUpperCase()
            });
            // Check for heap overflow
            if (this.codePtr >= this.heapPtr) {
                this.addError();
                this.log.push(DEBUG + " - " + CODEGEN + " - " + ERROR + " - " + ErrorType.ExceedHeapLimit + ". The Heap has reached the stack inducing Heap Overflow");
            }
            // Return pointer to beginning of string
            return stringPtr.toString(16).toUpperCase();
        }

        /**
         * LDY - Load the Y register with a constant 
         * @param value the constant being stored
         */
        private loadYWithConst(value: string): void {
            this.writeCode(Instruction.LoadYWithConst);
            this.writeCode(value);
        }

        /**
         * LDY - Load the Y register from memory 
         * @param address the memory address being loaded
         */
        private loadYFromMem(address: string): void {
            this.writeCode(Instruction.LoadYFromMem);
            this.writeCode(address);
            this.writeCode(TERMINATOR);
        }

        /**
         * LDA - Load the accumulator with a constant
         * @param value the constant being stored
         */
        private loadAccWithConst(value: string): void {
            this.writeCode(Instruction.LoadAccWithConst);
            this.writeCode(value);
        }

        /**
         * LDA - Load the accumulator from memory
         * @param address the memory address being loaded
         */
        private LoadAccFromMem(address: string): void {
            this.writeCode(Instruction.LoadAccFromMem);
            this.writeCode(address);
            this.writeCode(TERMINATOR);
        }

        /**
         * STA - Store the accumulator in memory 
         * @param tempAddress temporary address in memory
         */
        private storeAccInMemWithTempLoc(tempAddress: string): void {
            this.writeCode(Instruction.StoreAccInMem);
            this.writeCode(tempAddress);
            this.writeCode(TERMINATOR);
        }

        /**
         * CPX - Compare a byte in memory to the X register. Sets the Z (zero) flag if equal 
         * @param address the memory address being compared
         */
        private compareMemToX(address: string): void {
            this.writeCode(Instruction.CompareMemToX);
            this.writeCode(address);    
            this.writeCode(TERMINATOR);
        }

        /**
         * LDX - Load the X register with a constant 
         * @param value the constant being stored
         */
        private loadXWithConst(value: string): void {
            this.writeCode(Instruction.LoadXWithConst);
            this.writeCode(value);
        }

        /**
         * LDX - Load the X register from memory 
         * @param address the memory address being loaded
         */
        private loadXFromMem(address: string): void {
            this.writeCode(Instruction.LoadXFromMem);
            this.writeCode(address);
            this.writeCode(TERMINATOR);
        }

        /**
         * BNE - Branch n bytes if z flag = 0 
         * @param bytes number of bytes
         */
        private branchNBytes(bytes: string): void {
            this.writeCode(Instruction.BranchNBytes);
            this.writeCode(bytes);
        }

        // Helper function for switching error boolean to true and incrementing the number of errors
        private addError(): void {
            this.error = true;
            this.errors++;
        }
    }
}
