/* --------  
   semantic.ts

   -------- */

   module JuiceC {

    export class Semantic {

        cst: Tree;
        ast: Tree;
        scopeTree: Tree;
        error: boolean;

        constructor(cst: Tree) {
           this.cst = cst;
           this.ast = new Tree();
           this.error = false;
        }

        public analyze(cst: Tree) {
            this.cst = cst;
            this.ast = new Tree();
            // Traverse the CST looking for the "good stuff"
            this.traverse(cst.root);
        }

        // Recursive function that traverses the CST in up-to-down, left-most descent looking for the key parts of the language.
        // When found, construct and add them to the AST
        public traverse(node: TreeNode) {
            switch (node.value) {
                case Production.Block:  
                    // Add the Block node and increase the scope by 1
                    this.ast.addNode(Production.Block);
                    // Recursively traverse each child node
                    for (let i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }

                    // Ascend the AST once all traversals are finished. If the current node is null, we have reached the end of the tree
                    if (this.ast.curr != null) {
                        this.ast.ascendTree();
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
                    this.ast.addNode(id);
                    this.ast.ascendTree();
                    this.ast.ascendTree();

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
                    this.ast.addNode(node.children[0].children[0].value);
                    this.ast.ascendTree();
                    // Find the expression and get the type returned by the expression
                    let expressionType = this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    // Check for type match
                    // handles case if traverse() returns a token
                    if (expressionType != null && expressionType.value != null) {
                        expressionType = expressionType.value;
                    }
                    
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
                    //let foundType = this.checkScopes(node.children[0]);
                    // Mark id as used
                    //this.markAsUsed(node.children[0]);
                    // Look for used but uninitialized variables
                    //this.checkUsedUninit(node.children[0]);
                    // return the id's type
                    //return foundType;
                    
                    break;

                case Production.IntExpr:
                    // figure out which intexpr this is
                    // more than just a digit
                    if (node.children.length > 1) {
                        this.ast.addNode(new Token(TokenType.T_ADDITION, "Addition", null, null));
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression. make sure return type is int
                        var exprType = this.traverse(node.children[2]);
                        // handles case if traverse() returns a token
                        if (exprType.value != null) {
                            exprType = exprType.value;
                        }
                        this.ast.ascendTree();
                    }
                    // just a digit
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by intexpr
                    return "int";

                case Production.BooleanExpr:
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if (node.children.length > 1) {
                        if (node.children[2].children[0].value.value == "==") {
                            this.ast.addNode(new Token(TokenType.T_EQUALS, "Equals", null, null));
                        }
                        else {
                            this.ast.addNode(new Token(TokenType.T_NOTEQUALS, "NotEquals", null, null));
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
                            //this.errors.push(new TypeError(ErrorType.IncorrectTypeComparison, node.children[1].value, node.children[1].lineNumber, node.children[1].colNumber, firstExprType, secondExprType));
                        }
                        this.ast.ascendTree();
                    }
                    // just a boolval
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }

                    // return the type returned by boolexpr
                    return "boolean";

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
    }
}
