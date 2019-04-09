/* --------  
   semantic.ts

   -------- */

   module JuiceC {

    export class Semantic {

        cst: Tree;
        ast: Tree;
        scopeTree: Tree;
        error: boolean;
        errors: Array<Error>;
        warnings: Array<Warning>;
        totalScopes: number;
        currentScope: number;
        log: Array<string>;
        symbol: Object = {}; // object to hold symbol data
        symbols: Array<Object>; // keeps array of symbols found
        

        constructor(cst: Tree) {
            this.cst = cst;
            this.ast = new Tree();
            this.error = false;
            this.errors = [];
            this.warnings = [];
            this.scopeTree = new Tree();
            this.totalScopes = 0;
            // Scopes always increase by 1, so currentScope will increase to 0 on the first block production
            this.currentScope = 0;
            this.log = [];
            this.symbols = [];
        }

        public analyze() {
            // Traverse the CST looking for the "good stuff"
            this.traverse(this.cst.root);
            // Traverse scope tree to generate warnings
            this.findWarnings(this.scopeTree.root);
            return {
                "ast": this.ast,
                "scopeTree": this.scopeTree,
                "errors": this.errors,
                "error": this.error,
                "warnings": this.warnings,
                "symbols": this.symbols,
                "log": this.log,
            }
        }

        // Recursive function that traverses the CST in up-to-down, left-most descent looking for the key parts of the language.
        // When found, construct and add them to the AST
        public traverse(node) {
            switch (node.value) {
                case Production.Block:
                // Scope tree: add a scope to the tree whenever we encounter a Block
                    // Increase the number of scopes that have been declared
                    // Increase the scope level as we are on a new one
                    let newScope = new ScopeHashMap(node.lineNum, node.colNum, this.currentScope);
                    this.scopeTree.addNode(newScope);
                    // Add the Block node and increase the scope by 1
                    this.ast.addNode(Production.Block);
                    this.currentScope++;
                    this.totalScopes++;
                    // Recursively traverse each child node
                    for (let i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }

                    // Ascend the AST once all traversals are finished. If the current node is null, we have reached the end of the tree
                    if (this.ast.curr != null) {
                        this.ast.ascendTree();
                    }

                    // Decrease the currentScope as we have completed this scope level
                    if (this.scopeTree.curr != null) {
                        this.scopeTree.ascendTree();
                        this.currentScope--;
                    }     
                    
                    break;

                case Production.VarDeclaration: 
                    // Add the VarDecl node
                    this.ast.addNode(Production.VarDeclaration);
                    // Get its children and add to AST
                    // Get the type
                    let token = node.children[0].children[0].value;
                    this.ast.addNode(token.value);
                    this.ast.ascendTree();
                    // Get the id
                    var id = node.children[1].children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(id);
                    this.ast.ascendTree();
                    this.ast.ascendTree();

                    // Add variable declaration to current scope
                    // Check if already declared in current scope
                    if (!this.scopeTree.curr.value.table.hasOwnProperty(id.value)){ 
                        this.scopeTree.curr.value.buckets[id.value] = new ScopeVariable(id.value);
                        this.scopeTree.curr.value.buckets[id.value].value = token;
                        // Add to symbol table
                        this.symbol["type"] = token.value;
                        this.symbol["key"] = id.value;
                        this.symbol["line"] = node.children[1].children[0].lineNumber;
                        this.symbol["col"] = node.children[1].children[0].colNumber;
                        this.symbol["scope"] = this.scopeTree.curr.value.id;
                        this.symbol["scopeLevel"] = this.scopeLevel;
                        this.symbols.push(this.symbol);
                        this.symbol = {};
                    }
                    // Throw error if variable already declared in scope
                    else {
                        this.error = true;
                        let err = new ScopeError(ErrorType.DUPLICATE_VARIABLE, id, node.children[1].children[0].lineNumber, node.children[1].children[0].colNumber, this.scopeTree.curr.value.table[id.value].value.lineNumber, this.scopeTree.curr.value.table[id.value].value.colNumber);
                        this.errors.push(err);
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
                    var id = node.children[0].children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].children[0].value);
                    // Check if id is in scope and get its type
                    var idType = this.checkScopes(node.children[0].children[0]);
                    this.ast.ascendTree();
                    // Find the expression and get the type returned by the expression
                    let expressionType = this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    // Check for type match
                    // handles case if traverse() returns a token
                    if (expressionType != null && expressionType.value != null) {
                        expressionType = expressionType.value;
                    }
                    this.checkTypeMatch(node.children[0].children[0].value, idType, expressionType, node.children[0].children[0].lineNumber, node.children[0].children[0].colNumber, node.children[2].lineNumber, node.children[2].colNumber);
                    // Update scope tree node object initialized flag. variable has been initialized.
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
                    var id = node.children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    // Check if variable declared in current or parent scopes
                    // If we find it in scope, return the type of the variable
                    let foundType = this.checkScopes(node.children[0]);
                    // Mark id as used
                    this.markAsUsed(node.children[0]);
                    // Look for used but uninitialized variables
                    this.checkUsedButUninit(node.children[0]);
                    // return the id's type
                    return foundType;
                    
                    break;

                case Production.IntExpr:
                    // figure out which intexpr this is
                    // more than just a digit
                    if (node.children.length > 1) {
                        this.ast.addNode(new Token(TokenType.ADDITION, "Addition", null, null));
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression. make sure return type is int
                        var exprType = this.traverse(node.children[2]);
                        // handles case if traverse() returns a token
                        if (exprType.value != null) {
                            exprType = exprType.value;
                        }

                        if (exprType != VariableType.Int) {
                            this.error = true;
                            this.errors.push(new TypeError(ErrorType.INCORRECT_INT_EXPR, node.children[2].value, node.children[2].lineNumber, node.children[2].colNumber, VariableType.Int, exprType));
                        }
                        this.ast.ascendTree();
                    }
                    // just a digit
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by intexpr
                    return VariableType.Int;

                case Production.BooleanExpr:
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if (node.children.length > 1) {
                        if (node.children[2].children[0].value.value == "==") {
                            this.ast.addNode(new Token(TokenType.EQUALS, "Equals", null, null));
                        }
                        else {
                            this.ast.addNode(new Token(TokenType.NOTEQUALS, "NotEquals", null, null));
                        }
                        // Get types returned by the two Expr children and make sure they're the same
                        var firstExprType = this.traverse(node.children[1]);
                        var secondExprType = this.traverse(node.children[3]);
                        // handles case if traverse() returns a token
                        if (firstExprType != null && firstExprType.value != null) {
                            firstExprType = firstExprType.value;
                        }
                        if (secondExprType != null && secondExprType.value != null) {
                            secondExprType = secondExprType.value;
                        }
                        if (firstExprType != secondExprType) {
                            this.error = true;
                            this.errors.push(new TypeError(ErrorType.INCORRECT_TYPE_COMPAR, node.children[1].value, node.children[1].lineNumber, node.children[1].colNumber, firstExprType, secondExprType));
                        }
                        this.ast.ascendTree();
                    }
                    // just a boolval
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by boolexpr
                    return VariableType.Boolean;

                case Production.StringExpr:

                    break;

                default:
                    // Traverse node's children
                    for (let i=0; i < node.children.length; i++) {
                        // If node is an Expression, return, so we can properly return the type of the expression
                        if (node.value == Production.Expr) {
                            return this.traverse(node.children[i]);
                        }
                        this.traverse(node.children[i]);
                    }
                    
                    break;
            }
        }
        
        public checkTypeMatch(id, idType, targetType, idLine, idCol, targetLine, targetCol) {
            if (targetType != null && idType != null) {
                if (idType.value != targetType) {
                    this.error = true;
                    let err = new TypeError(ErrorType.TYPE_MISMATCH, id, idLine, idCol, idType, targetType);
                    this.errors.push(err);
                } else {
                    this.log.push("VALID - Variable [ " + id.value + " ] of type " + idType.value + " matches its assignment type of " + targetType + " at line " + targetLine + " col " + targetCol);
                }
            }
        }

        public markAsInitialized(node) {
            // pointer to current position in scope tree
            let ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.table[node.value.value].initialized = true;
                this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been initialized.");
                
                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) { 
                        // Mark as initialized
                        ptr.value.table[node.value.value].initialized = true;
                        // report our gucciness to the log
                        this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been initialized.");
                        
                        return;
                    }
                }
            }
        }

        public markAsUsed(node) {
            // pointer to current position in scope tree
            let ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.table[node.value.value].used = true;
                this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been used.");
                
                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null){ 
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)){ 
                        // Mark as initialized
                        ptr.value.table[node.value.value].used = true;
                        this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been used.");
                        
                        return;
                    }
                }
            }
        }

        public checkUsedButUninit(node) {
            // pointer to current position in scope tree
            let ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                if (ptr.value.table[node.value.value].initialized == false) {
                    this.warnings.push(new ScopeWarning(WarningType.USED_BEFORE_INIT, node.value.value, node.value.lineNumber, node.value.colNumber, node.value));
                }
                
                return;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) {
                        if (ptr.value.table[node.value.value].initialized == false) {
                            this.warnings.push(new ScopeWarning(WarningType.USED_BEFORE_INIT, node.value.value, node.value.lineNumber, node.value.colNumber, node.value));
                        }
                        
                        return;
                    }
                }
            }
        }

        public checkScopes(node) {
            // pointer to current position in scope tree
            let ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.table.hasOwnProperty(node.value.value)) {
                this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been declared.");
                
                return ptr.value.table[node.value.value].value;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.table.hasOwnProperty(node.value.value)) {
                        this.log.push("VALID - Variable [ " + node.value.value + " ] on line " + node.lineNumber + " col " + node.colNumber + " has been declared.");
                        
                        return ptr.value.table[node.value.value].value;
                    }
                }
                // Didn't find id in scope, push error and return false
                this.error = true;
                let err = new ScopeError(ErrorType.UNDECLARED_VARIABLE, node.value, node.lineNumber, node.colNumber, null, null);
                this.errors.push(err);
            }
        }

        public findWarnings(node) {
            // Iterate through object 
            for (let key in node.value.buckets) {
                // Look for declared but uninitialized variables
                if (node.value.buckets[key].initialized == false) {
                    // variable is uninitialized
                    this.warnings.push(new ScopeWarning(WarningType.UNINIT_VAR, key, node.value.table[key].value.lineNumber, node.value.table[key].value.colNumber, node.value));
                    // if variable is uninitialized, but used, issue warning
                    if (node.value.table[key].used == true) {
                         this.warnings.push(new ScopeWarning(WarningType.USED_BEFORE_INIT, key, node.value.table[key].value.lineNumber, node.value.table[key].value.colNumber, node.value));
                    }
                }
                // Look for unused variables
                if (node.value.table[key].used == false && node.value.table[key].initialized == true) {
                    // variable is unused
                    this.warnings.push(new ScopeWarning(WarningType.UNUSED_VAR, key, node.value.table[key].value.lineNumber, node.value.table[key].value.colNumber, node.value));
                }
            }
            // Continue traversing in preorder fashion
            for (let i=0; i < node.children.length; i++) {
                this.findWarnings(node.children[i]);
            }
        }
    }
}
