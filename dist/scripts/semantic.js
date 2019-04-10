/* --------
   semantic.ts

   -------- */
var JuiceC;
(function (JuiceC) {
    var Semantic = /** @class */ (function () {
        function Semantic(cst) {
            this.cst = cst;
            this.ast = new JuiceC.Tree();
            this.error = false;
            this.errors = [];
            this.warnings = [];
            this.scopeTree = new JuiceC.Tree();
            this.totalScopes = 0;
            // Scopes always increase by 1, so currentScope will increase to 0 on the first block production
            this.currentScope = 0;
            this.log = [];
            this.symbols = [];
        }
        Semantic.prototype.analyze = function () {
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
                "log": this.log
            };
        };
        // Recursive function that traverses the CST in up-to-down, left-most descent looking for the key parts of the language.
        // When found, construct and add them to the AST
        Semantic.prototype.traverse = function (node) {
            switch (node.value) {
                case JuiceC.Production.Block:
                    // Scope tree: add a scope to the tree whenever we encounter a Block
                    // Increase the number of scopes that have been declared
                    // Increase the scope level as we are on a new one
                    var newScope = new JuiceC.ScopeHashMap(node.lineNum, node.colNum, this.currentScope);
                    this.scopeTree.addNode(newScope);
                    // Add the Block node and increase the scope by 1
                    this.ast.addNode(JuiceC.Production.Block);
                    this.currentScope++;
                    this.totalScopes++;
                    // Recursively traverse each child node
                    for (var i = 0; i < node.children.length; i++) {
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
                case JuiceC.Production.VarDeclaration:
                    // Add the VarDecl node
                    this.ast.addNode(JuiceC.Production.VarDeclaration);
                    // Get its children and add to AST
                    // Get the type
                    var token = node.children[0].children[0].value;
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
                    if (!this.scopeTree.curr.value.buckets.hasOwnProperty(id.value)) {
                        this.scopeTree.curr.value.buckets[id.value] = new JuiceC.ScopeVariable(id.value);
                        this.scopeTree.curr.value.buckets[id.value].value = token;
                        var symbol = {
                            "type": token.value,
                            "key": id.value,
                            "line": node.children[1].children[0].lineNum,
                            "col": node.children[1].children[0].colNum,
                            "scope": this.scopeTree.curr.value.id
                        };
                        // Add to symbol table
                        this.symbols.push(symbol);
                    }
                    // Throw error if variable already declared in scope
                    else {
                        this.error = true;
                        var err = new JuiceC.ScopeError("Duplicate Variable" /* DUPLICATE_VARIABLE */, id, node.children[1].children[0].lineNum, node.children[1].children[0].colNum, this.scopeTree.curr.value.buckets[id.value].value.lineNum, this.scopeTree.curr.value.buckets[id.value].value.colNum);
                        this.errors.push(err);
                    }
                    break;
                case JuiceC.Production.PrintStatement:
                    // Add the PrintStatement node
                    this.ast.addNode(JuiceC.Production.PrintStatement);
                    // Find the expression by traversing the child at index 2 AKA the good stuff
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case JuiceC.Production.AssignStatement:
                    // Add the AssignStatement node
                    this.ast.addNode(JuiceC.Production.AssignStatement);
                    // Get the id
                    var id = node.children[0].children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].children[0].value);
                    // Check if id is in scope and get its type
                    var idType = this.checkScopes(node.children[0].children[0]);
                    this.ast.ascendTree();
                    // Find the expression and get the type returned by the expression
                    var expressionType = this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    // Check for type match
                    if (expressionType != null && expressionType.value != null) {
                        expressionType = expressionType.value;
                    }
                    this.checkTypeMatch(node.children[0].children[0].value, idType, expressionType, node.children[0].children[0].lineNum, node.children[0].children[0].colNum, node.children[2].lineNum, node.children[2].colNum);
                    // Update scope tree node object initialized flag. variable has been initialized.
                    this.markAsInitialized(node.children[0].children[0]);
                    break;
                case JuiceC.Production.WhileStatement:
                    this.ast.addNode(JuiceC.Production.WhileStatement);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case JuiceC.Production.IfStatement:
                    this.ast.addNode(JuiceC.Production.IfStatement);
                    this.traverse(node.children[1]);
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case JuiceC.Production.Id:
                    // Get the id and also assign its scope
                    var id = node.children[0].value;
                    // Set the scope on the id
                    id.scopeId = this.scopeTree.curr.value.id;
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    // Check if variable declared in current or parent scopes
                    // If we find it in scope, return the type of the variable
                    var foundType = this.checkScopes(node.children[0]);
                    // Mark id as used
                    this.markAsUsed(node.children[0]);
                    // Look for used but uninitialized variables
                    this.checkUsedButUninit(node.children[0]);
                    return foundType;
                case JuiceC.Production.IntExpr:
                    // Check if it is not a digit
                    if (node.children.length > 1) {
                        this.ast.addNode(new JuiceC.Token(JuiceC.TokenType.ADDITION, "Addition", null, null));
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // Ensure return type is int
                        var exprType = this.traverse(node.children[2]);
                        if (exprType.value != null) {
                            exprType = exprType.value;
                        }
                        if (exprType != JuiceC.VariableType.Int) {
                            this.error = true;
                            this.errors.push(new JuiceC.TypeError("Incorrect Integer Expression" /* INCORRECT_INT_EXPR */, node.children[2].value, node.children[2].lineNum, node.children[2].colNum, JuiceC.VariableType.Int, exprType));
                        }
                        this.ast.ascendTree();
                    }
                    // If it is a digit
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    // return the type returned by intexpr
                    return JuiceC.VariableType.Int;
                case JuiceC.Production.BooleanExpr:
                    // Check if it is not a boolval
                    if (node.children.length > 1) {
                        if (node.children[2].children[0].value.value == "==") {
                            this.ast.addNode(new JuiceC.Token(JuiceC.TokenType.EQUALS, "Equals", null, null));
                        }
                        else {
                            this.ast.addNode(new JuiceC.Token(JuiceC.TokenType.NOTEQUALS, "NotEquals", null, null));
                        }
                        // Get types returned by the two Expr children and make sure they're the same
                        var firstExprType = this.traverse(node.children[1]);
                        var secondExprType = this.traverse(node.children[3]);
                        if (firstExprType != null && firstExprType.value != null) {
                            firstExprType = firstExprType.value;
                        }
                        if (secondExprType != null && secondExprType.value != null) {
                            secondExprType = secondExprType.value;
                        }
                        if (firstExprType != secondExprType) {
                            this.error = true;
                            this.errors.push(new JuiceC.TypeError("Incorrect Type Comparison" /* INCORRECT_TYPE_COMPAR */, node.children[1].value, node.children[1].lineNum, node.children[1].colNum, firstExprType, secondExprType));
                        }
                        this.ast.ascendTree();
                    }
                    // If it is a boolval
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    // return the type returned by boolexpr
                    return JuiceC.VariableType.Boolean;
                case JuiceC.Production.StringExpr:
                    // Generate the string until end of the charlist
                    // Surround string in quotes
                    var stringBuilder = ["\""];
                    var currCharList = node.children[1];
                    var lastCharList = false;
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
                    var resString = stringBuilder.join("");
                    this.ast.addNode(new JuiceC.Token(JuiceC.TokenType.STRING, resString, null, null));
                    this.ast.ascendTree();
                    return JuiceC.VariableType.String;
                default:
                    // Traverse node's children
                    for (var i = 0; i < node.children.length; i++) {
                        // If node is an Expression, return, so we can properly return the type of the expression
                        if (node.value == JuiceC.Production.Expr) {
                            return this.traverse(node.children[i]);
                        }
                        this.traverse(node.children[i]);
                    }
                    break;
            }
        };
        Semantic.prototype.checkTypeMatch = function (id, idType, targetType, idLine, idCol, targetLine, targetCol) {
            if (targetType != null && idType != null) {
                if (idType.value != targetType) {
                    this.error = true;
                    var err = new JuiceC.TypeError("Type Mismatch" /* TYPE_MISMATCH */, id, idLine, idCol, idType, targetType);
                    this.errors.push(err);
                }
                else {
                    this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ " + id.value + " ] of type " + idType.value + " matches its assignment type of " + targetType + " at ( " + targetLine + " : " + targetCol + " )");
                }
            }
        };
        Semantic.prototype.markAsInitialized = function (node) {
            // Pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.buckets[node.value.value].initialized = true;
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ " + node.value.value + " ] has been initialized at ( " + node.lineNum + " : " + node.colNum + " )");
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
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ " + node.value.value + " ] has been initialized at ( " + node.lineNum + " : " + node.colNum + " )");
                        return;
                    }
                }
            }
        };
        Semantic.prototype.markAsUsed = function (node) {
            // Pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                // Mark as initialized
                ptr.value.buckets[node.value.value].used = true;
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ " + node.value.value + " ] has been used at ( " + node.lineNum + " : " + node.colNum + " )");
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
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " - Variable [ " + node.value.value + " ] has been used at ( " + node.lineNum + " : " + node.colNum + " )");
                        return;
                    }
                }
            }
        };
        Semantic.prototype.checkUsedButUninit = function (node) {
            // Pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                if (ptr.value.buckets[node.value.value].initialized == false) {
                    this.warnings.push(new JuiceC.ScopeWarning("Variable Used Before Being Initialized" /* USED_BEFORE_INIT */, node.value.value, node.value.lineNum, node.value.colNum, node.value));
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
                            this.warnings.push(new JuiceC.ScopeWarning("Variable Used Before Being Initialized" /* USED_BEFORE_INIT */, node.value.value, node.value.lineNum, node.value.colNum, node.value));
                        }
                        return;
                    }
                }
            }
        };
        Semantic.prototype.checkScopes = function (node) {
            // Pointer to current position in scope tree
            var ptr = this.scopeTree.curr;
            // Check current scope
            if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " " + SCOPE + " - Variable [ " + node.value.value + " ] has been declared at ( " + node.lineNum + " : " + node.colNum + " )");
                return ptr.value.buckets[node.value.value].value;
            }
            // Check parent scopes
            else {
                while (ptr.parent != null) {
                    ptr = ptr.parent;
                    // Check if id in scope
                    if (ptr.value.buckets.hasOwnProperty(node.value.value)) {
                        this.log.push(DEBUG + " - " + SEMANTIC + " - " + VALID + " " + SCOPE + " - Variable [ " + node.value.value + " ] has been declared at ( " + node.lineNum + " : " + node.colNum + " )");
                        return ptr.value.buckets[node.value.value].value;
                    }
                }
                // Didn't find id in scope, push error and return false
                this.error = true;
                var err = new JuiceC.ScopeError("Undeclared Variable" /* UNDECLARED_VARIABLE */, node.value, node.lineNum, node.colNum, null, null);
                this.errors.push(err);
            }
        };
        Semantic.prototype.findWarnings = function (node) {
            // Iterate through object 
            for (var key in node.value.buckets) {
                // Look for declared but uninitialized variables
                if (node.value.buckets[key].initialized == false) {
                    this.warnings.push(new JuiceC.ScopeWarning("Uninitialized Variable" /* UNINIT_VAR */, key, node.value.buckets[key].value.lineNum, node.value.buckets[key].value.colNum, node.value));
                    if (node.value.buckets[key].used == true) {
                        this.warnings.push(new JuiceC.ScopeWarning("Variable Used Before Being Initialized" /* USED_BEFORE_INIT */, key, node.value.buckets[key].value.lineNum, node.value.buckets[key].value.colNum, node.value));
                    }
                }
                // Look for unused variables
                if (node.value.buckets[key].used == false && node.value.buckets[key].initialized == true) {
                    this.warnings.push(new JuiceC.ScopeWarning("Unused Variable" /* UNUSED_VAR */, key, node.value.buckets[key].value.lineNum, node.value.buckets[key].value.colNum, node.value));
                }
            }
            // Continue traversing in preorder fashion
            for (var i = 0; i < node.children.length; i++) {
                this.findWarnings(node.children[i]);
            }
        };
        // Traverses the scope tree and returns a string representation
        Semantic.prototype.printScopeTree = function (node) {
            var tree = [];
            var level = 0;
            if (node != null) {
                this.printScopeTreeHelper(node, level, tree, "");
            }
            return tree;
        };
        Semantic.prototype.printScopeTreeHelper = function (node, level, tree, dash) {
            var varsString = "";
            for (var key in node.value.buckets) {
                varsString += node.value.buckets[key].value.value + " " + key + ", ";
            }
            tree.push(dash + "- Scope " + node.value.id + " : " + varsString);
            for (var i = 0; i < node.children.length; i++) {
                this.printScopeTreeHelper(node.children[i], level + 1, tree, dash + "-");
            }
        };
        return Semantic;
    }());
    JuiceC.Semantic = Semantic;
})(JuiceC || (JuiceC = {}));
