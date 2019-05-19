///<reference path="globals.ts" />
/**
 * semantic.ts
 * 
 * The Semantic Analyzer takes in the CST from a successful Parse, 
 * then scope and type checks the tokens to enforce the grammar as
 * the context-sensitive level. A successful result will return a 
 * scope tree, symbol table, and AST.
 */

module JuiceC {
    export interface SemanticResult {
        ast: Tree;
        scopeTree: Tree;
        errors: number;
        warnings: number;
        symbols: Array<any>;
        log: Array<string>;
    }

    export interface Symbol {
        type: string;
        key: string;
        line: number;
        col: number;
        scope: number;
    }

    export class Semantic {
        cst: Tree;
        ast: Tree;
        scopeTree: Tree;
        errors: number;
        warnings: number;
        totalScopes: number;
        currentScope: number;
        log: Array<string>;
        symbols: Array<Symbol>;

        constructor(cst: Tree) {
            this.cst = cst;
            this.ast = new Tree();
            this.errors = 0;
            this.warnings = 0;
            this.scopeTree = new Tree();
            this.totalScopes = 0;
            this.currentScope = 0;
            this.log = [];
            this.symbols = [];
        }

        /**
         * Traverses the CST type and scope checking, checks the scopeTree
         *  for warnings, and returns the results to control
         */
        analyze(): SemanticResult {
            // Traverse the CST looking for the "good stuff"
            this.traverse(this.cst.root);
            // Traverse scope tree to generate warnings
            this.findWarnings(this.scopeTree.root);
            const result: SemanticResult = {
                "ast": this.ast,
                "scopeTree": this.scopeTree,
                "errors": this.errors,
                "warnings": this.warnings,
                "symbols": this.symbols,
                "log": this.log
            };

            return result;
        }

        /**
         * Recursive function that traverses the CST in top-to-down,
         * left-most descent looking for the key parts of the language.
         * When found, construct and add them to the AST
         * @param node is the current tree node being evaluated
         */
        traverse(node) {
            let idType;
            let id;
            switch (node.value) {
                case Production.Block:
                    // Scope tree: add a scope to the tree whenever we encounter a Block
                    // Increase the number of scopes that have been declared
                    // Increase the scope level as we are on a new one
                    const newScope: ScopeHashMap = new ScopeHashMap(
                        node.lineNum, node.colNum, this.currentScope);
                    this.scopeTree.addNode(newScope);
                    // Add the Block node and increase the scope by 1
                    this.ast.addNode(Production.Block);
                    this.currentScope++;
                    this.totalScopes++;
                    // Recursively traverse each child node
                    for (let i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }

                    // Ascend the AST once all traversals are finished. If the current 
                    // node is null, we have reached the end of the tree
                    if (this.ast.curr != null) {
                        this.ast.ascendTree();
                    }
                    // Decrease the currentScope as we have completed this scope level
                    if (this.scopeTree.curr != null) {
                        this.scopeTree.ascendTree();
                        this.currentScope--;
                    }

                    break;

                case Production.VarDecl:
                    // Add the VarDecl node
                    this.ast.addNode(Production.VarDecl);
                    // Get its children and add to AST
                    // Get the type
                    const token: Token = node.children[0].children[0].value;
                    this.ast.addNode(token.value);
                    this.ast.ascendTree();
                    // Get the id
                    id = node.children[1].children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(id);
                    this.ast.ascendTree();
                    this.ast.ascendTree();

                    // Add variable declaration to current scope
                    // Check if already declared in current scope
                    if (!this.scopeTree.curr.value.buckets.hasOwnProperty(id.value)) {
                        this.scopeTree.curr.value.buckets[id.value] = new ScopeVariable(id.value, token);
                        const symbol: Symbol = {
                            "type": token.value,
                            "key": id.value,
                            "line": node.children[1].children[0].lineNum,
                            "col": node.children[1].children[0].colNum,
                            "scope": this.scopeTree.curr.value.id,
                        };
                        // Add to symbol table
                        this.symbols.push(symbol);
                    }
                    // Throw error if variable already declared in scope
                    else {
                        this.errors++;
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + ERROR
                            + ": Duplicate Variable - [ " + node.children[1].children[0].value.value
                            + " ] was declared at ( " + node.children[1].lineNum + " : "
                            + node.children[1].children[0].colNum + " ), but the variable was "
                            + "already declared within the same scope starting at ( "
                            + this.scopeTree.curr.value.lineNum + " : "
                            + this.scopeTree.curr.value.colNum + " )");
                    }

                    break;

                case Production.PrintStatement:
                    // Add the PrintStatement node
                    this.ast.addNode(Production.PrintStatement);
                    // Find the expression by traversing the child at index 2 AKA the good stuff
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();

                    break;

                case Production.AssignStatement:
                    // Add the AssignStatement node
                    this.ast.addNode(Production.AssignStatement);
                    // Get the id
                    id = node.children[0].children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].children[0].value);
                    // Check if id is in scope and get its type
                    idType = this.checkScopes(node.children[0].children[0]);
                    this.ast.ascendTree();
                    // Find the expression and get the type returned by the expression
                    let expressionType = this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    // Check for type match
                    if (expressionType != null && expressionType.value != null) {
                        expressionType = expressionType.value;
                    }
                    this.checkTypeMatch(node.children[0].children[0].value, idType,
                        expressionType, node.children[2].lineNum, node.children[2].colNum);
                    // Update scope tree node object initialized flag. variable 
                    // has been initialized.
                    this.markAsInitialized(node.children[0].children[0]);

                    break;

                case Production.WhileStatement:
                    this.ast.addNode(Production.WhileStatement);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();

                    break;

                case Production.IfStatement:
                    this.ast.addNode(Production.IfStatement);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();

                    break;

                case Production.Id:
                    // Get the id and also assign its scope
                    id = node.children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    // Check if variable declared in current or parent scopes
                    // If we find it in scope, return the type of the variable
                    const foundType = this.checkScopes(node.children[0]);
                    // Mark id as used
                    this.markAsUsed(node.children[0]);
                    // Look for used but uninitialized variables
                    this.checkUsedButUninit(node.children[0]);

                    return foundType;

                case Production.IntExpr:
                    // Check if it is not a digit
                    if (node.children.length > 1) {
                        this.ast.addNode(new Token(TokenType.Addition, "Addition", null, null));
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();

                        // Ensure return type is int
                        var exprType = this.traverse(node.children[2]);
                        if (exprType.value != null) {
                            exprType = exprType.value;
                        }
                        if (exprType != VariableType.Int) {
                            this.errors++;
                            this.log.push(DEBUG + " - " + SEMANTIC + " - " + ERROR
                                + ": Incorrect Int Expression - [ " + node.value
                                + " ] of type [ " + node.targetType + " ] was assigned to type [ "
                                + node.idType + " ] at ( " + node.lineNum + " : " + node.colNum
                                + " )");
                        }
                        this.ast.ascendTree();
                    }
                    // If it is a digit
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by intexpr
                    return VariableType.Int;

                case Production.BooleanExpr:
                    // Check if it is not a boolval
                    if (node.children.length > 1) {
                        if (node.children[2].children[0].value.value == "==") {
                            this.ast.addNode(new Token(TokenType.Equals, "Equals", null, null));
                        }
                        else {
                            this.ast.addNode(new Token(
                                TokenType.NotEquals, "NotEquals", null, null));
                        }

                        // Get types returned by the two Expr children and make
                        // sure they're the same
                        var firstExprType = this.traverse(node.children[1]);
                        var secondExprType = this.traverse(node.children[3]);
                        if (firstExprType != null && firstExprType.value != null) {
                            firstExprType = firstExprType.value;
                        }
                        if (secondExprType != null && secondExprType.value != null) {
                            secondExprType = secondExprType.value;
                        }
                        if (firstExprType != secondExprType) {
                            this.errors++;
                            this.log.push(DEBUG + " - " + SEMANTIC + " - " + ERROR
                                + ": Incorrect Type Comparison - [ " + node.value
                                + " ] of type [ " + node.targetType
                                + " ] was compared to type [ " + node.idType
                                + " ] at ( " + node.lineNum + " : " + node.colNum + " )");
                        }
                        this.ast.ascendTree();
                    }
                    // If it is a boolval
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by boolexpr
                    return VariableType.Boolean;

                case Production.StringExpr:
                    // Generate the string until end of the charlist
                    // Surround string in quotes
                    const stringBuilder: Array<string> = ["\""];
                    let currCharList = node.children[1];
                    let lastCharList = false;
                    // Check for empty string
                    if (node.children.length == 2) {
                        lastCharList = true;
                    }
                    while (!lastCharList) {
                        stringBuilder.push(currCharList.children[0].children[0].value.value);
                        if (currCharList.children.length == 1) {
                            lastCharList = true;
                            continue;
                        }
                        currCharList = currCharList.children[1];
                    }
                    stringBuilder.push("\"");
                    const concatString: string = stringBuilder.join("");
                    this.ast.addNode(new Token(TokenType.String, concatString, null, null));
                    this.ast.ascendTree();

                    return VariableType.String;

                default:
                    // Traverse node's children
                    for (let i=0; i < node.children.length; i++) {
                        // If node is an Expression, return, so we can properly
                        // return the type of the expression
                        if (node.value == Production.Expr) {
                            return this.traverse(node.children[i]);
                        }
                        this.traverse(node.children[i]);
                    }

                    break;
            }
        }

        /**
         * Checks to see if the id type matches its target type and logs the location of id target
         * @param id the variable name
         * @param idType the type of the id being assigned to
         * @param targetType the type that is being assigned to id
         * @param targetLine the line of the target
         * @param targetCol column of the target
         */
        checkTypeMatch(id, idType, targetType, targetLine, targetCol): void {
            if (targetType != null && idType != null) {
                if (idType != targetType) {
                    this.errors++;
                    this.log.push(DEBUG + " - " + SEMANTIC + " - " + ERROR
                        + ": Type Mismatch - Variable [ " + id.value + " ] of type [ "
                        + idType + " ] was assigned to type [ " + targetType
                        + " ] at ( " + targetLine + " : " + targetCol + " )");
                } else {
                    this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID
                        + " - Variable [ " + id.value + " ] of type " + idType
                        + " matches its assignment type of " + targetType
                        + " at ( " + targetLine + " : " + targetCol + " )");
                }
            }
        }

        /**
         * Marks an id as initialized in current or parent scope
         * @param node the node whose value we're marking as initialized
         */
        markAsInitialized(node): void {
            // Pointer to current position in scope tree
            let ptr: TreeNode = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.buckets[node.value.value].initialized = true;
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ "
                    + node.value.value + " ] has been initialized at ( " + node.lineNum
                    + " : " + node.colNum + " )");

                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                        // Mark as initialized
                        ptr.value.buckets[node.value.value].initialized = true;
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID
                            + " - Variable [ " + node.value.value
                            + " ] has been initialized at ( " + node.lineNum
                            + " : " + node.colNum + " )");

                        return;
                    }
                }
            }
        }

        /**
         * Marks an id as used in current or parent scope
         * @param node the node whose value we're marking as initialized
         */
        markAsUsed(node): void {
            // Pointer to current position in scope tree
            let ptr: TreeNode = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.buckets[node.value.value].used = true;
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ "
                    + node.value.value + " ] has been used at ( " + node.lineNum + " : "
                    + node.colNum + " )");

                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                        // Mark as initialized
                        ptr.value.buckets[node.value.value].used = true;
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID
                            + " - Variable [ " + node.value.value + " ] has been used at ( "
                            + node.lineNum + " : " + node.colNum + " )");

                        return;
                    }
                }
            }
        }

        /**
         * Checks to see if a variable is used before being initialized
         * @param node
         */
        checkUsedButUninit(node): void {
            // Pointer to current position in scope tree
            let ptr: TreeNode = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                if (ptr.value.buckets[node.value.value].initialized == false) {
                    this.warnings++;
                    this.log.push(DEBUG + " - " + SEMANTIC + " - " + WARNING
                        + " - Variable [ " + node.value.value + " ] was used at ( "
                        + node.lineNum + " : " + node.colNum + " ), before being initialized");
                }

                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                        if (ptr.value.buckets[node.value.value].initialized == false) {
                            this.warnings++;
                            this.log.push(DEBUG + " - " + SEMANTIC + " - " + WARNING
                                + " - Variable [ " + node.value.value + " ] was used at ( "
                                + node.lineNum + " : " + node.colNum
                                + " ), before being initialized");
                        }

                        return;
                    }
                }
            }
        }

        /**
         * Checks to see if id is declared in current or parent scope
         * @param node the node being checked
         * @return the scope object if any
         */
        checkScopes(node) {
            // Pointer to current position in scope tree
            let ptr: TreeNode = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " "
                    + SCOPE + " - Variable [ " + node.value.value
                    + " ] has been declared at ( " + node.lineNum + " : " + node.colNum + " )");

                return ptr.value.buckets[node.value.value].token.value;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID
                            + " " + SCOPE + " - Variable [ " + node.value.value
                            + " ] has been declared at ( " + node.lineNum + " : "
                            + node.colNum + " )");

                        return ptr.value.buckets[node.value.value].token.value;
                    }
                }
                // Didn't find id in scope, push error
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + ERROR
                    + ": Undeclared Variable - [ " + node.value.value
                    + " ] was assigned at ( " + node.lineNum + " : " + node.colNum
                    + " ), but was not declared beforehand");
                this.errors++;
            }
        }

        /**
         * Traverses the scope tree in preorder fashion to find warnings to generate
         * @param node the node in tree we're starting at
         */
        findWarnings(node): void {
            // Iterate through object 
            for (const key in node.value.buckets) {
                // Look for declared but uninitialized variables
                if (node.value.buckets[key].initialized == false) {
                    this.warnings++;
                    this.log.push(DEBUG + " - " + SEMANTIC + " - " + WARNING
                        + " - Variable [ " + key + " ] has been declared at ( "
                        + node.value.lineNum + " : " + node.value.colNum
                        + " ), but was never initialized");
                    if (node.value.buckets[key].used == true) {
                        this.warnings++;
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + WARNING
                            + " - Variable [ " + key + " ] was used at ( "
                            + node.value.lineNum + " : " + node.value.colNum
                            + " ), before being initialized");
                    }
                }
                // Look for unused variables
                if (node.value.buckets[key].used == false &&
                    node.value.buckets[key].initialized == true) {
                        this.warnings++;
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + WARNING
                            + " - Variable [ " + key + " ] was declared at ( "
                            + node.value.lineNum + " : " + node.value.colNum
                            + " ), but was never used");
                }
            }
            // Continue traversing in preorder fashion
            for (let i = 0; i < node.children.length; i++) {
                this.findWarnings(node.children[i]);
            }
        }
    }
}
