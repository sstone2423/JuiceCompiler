///<reference path="globals.ts" />
/* 
    parser.ts

    LL(1) Recursive Descent Parser. Leftmost Lookahead by 1.
    This parser takes in the tokens from a successful Lex and enforces the grammar restrictions on those tokens. As it approves
    each section of the program, it adds it to a Concrete Syntax Tree (CST) which will then be passed to Semantic Analysis.
*/

module JuiceC {

	export class Parser {

        currentTokenIndex: number;
        tokens: Array<Token>;
        errors: Array<Error>;
        valids: Array<string>;
        isComplete: boolean;
        cst: Tree;

        public init(tokens: Array<Token>): void {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.errors = [];
            this.valids = []
            this.isComplete = false;
            this.cst = new Tree();
        }

		// Parse the isCompleted lex programs
        public parse(tokens: Array<Token>) {
            this.init(tokens);

            if (this.parseProgram()) {
                this.isComplete = true;
            } 
            
            // Report the results.
            let results = {
                "errors": this.errors,
                "valids": this.valids,
                "cst": this.cst,
                "isComplete": this.isComplete,
            }
            return results;      
        }

        // First part of the grammar, Program
        public parseProgram(): boolean {
            // Recursively call the 2nd step, Block, with the Program production and the expected terminal
            if (this.parseBlock([Production.Program], true) && this.matchAndConsumeToken(TokenType.T_EOP, null, null, true)) {
                return true;
            // If block was not successful, return false
            } else {
                return false;
            }
            
        }

        // 2nd part of the grammar, Block
        public parseBlock(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_LBRACE, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchAndConsumeToken(TokenType.T_RBRACE, null, null, true)) {
                // Ascend the tree after a block is derived
                this.cst.ascendTree();
                return true;
            } else {
                console.log("parseBlock fail");
                this.errors.push(new Error(ErrorType.E_BLOCK_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
                return false;
            }
        }

        public parseStatementList(production: Array<Production>, expected: boolean): boolean {
            if (this.parseStatement([Production.StatementList], false) && this.parseStatementList([Production.StatementList], false)) {
                // Ascend the tree after a StatementList is derived
                this.cst.ascendTree();
                return true;
            }
            // Empty string is acceptable
            else {
                return true;
            }
        }

        public parseStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.parsePrintStatement([Production.StatementList, Production.Statement], false) || this.parseAssignmentStatement([Production.StatementList, Production.Statement], false) || 
                this.parseWhileStatement([Production.StatementList, Production.Statement], false) || this.parseVarDeclaration([Production.StatementList, Production.Statement], false) || 
                this.parseIfStatement([Production.StatementList, Production.Statement], false) || this.parseBlock([Production.StatementList, Production.Statement], false)) {
                    // Ascend the tree after Statement is derived
                    this.cst.ascendTree();
                    return true;
            }
            return false;
        }

        public parsePrintStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_PRINT, production, Production.PrintStatement, false) && this.matchAndConsumeToken(TokenType.T_LPAREN, null, null, true) &&
                this.parseExpr([Production.Expr], true) && this.matchAndConsumeToken(TokenType.T_RPAREN, null, null, true)) {
                    // Ascend the tree after PrintStatement is derived
                    this.cst.ascendTree();
                    return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_PRINT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseAssignmentStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.parseId(production.concat([Production.AssignStatement]), false) && 
                this.matchAndConsumeToken(TokenType.T_ASSIGN, null, null, true) && this.parseExpr([Production.Expr], true)) {
                    // Ascend the tree after AssignmentStatement is derived
                    this.cst.ascendTree();
                    return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_ASSIGNMENT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseVarDeclaration(production: Array<Production>, expected: boolean): boolean {
            if (this.parseType(production.concat([Production.VarDeclaration]), false) && this.parseId(null, true)) {
                // Ascend the tree after VarDeclaration is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_VAR_DECL_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseWhileStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_WHILE, production, Production.WhileStatement, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after WhileStatement is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_WHILE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseIfStatement(production: Array<Production>, expected: boolean): boolean {
            // we let parseBoolExpr derive appropriate rewrite rules by passing empty production array
            if (this.matchAndConsumeToken(TokenType.T_IF, production, Production.IfStatement, false) && this.parseBoolExpr([], true) &&
                this.parseBlock(null, true)) {
                    // Ascend the tree after IfStatement is derived
                    this.cst.ascendTree();
                    return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_IF_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBoolExpr(production, false) || 
                this.parseId(production, false)){
                    // Ascend the tree after Expression is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                this.errors.push(new Error(ErrorType.E_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
                return false;
            }
        }

        public parseIntExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseDigit(production.concat([Production.IntExpr]), false)) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null, false) && this.parseExpr([Production.Expr], true)) {
                    this.cst.ascendTree();
                    return true;
                // Ascend if nothing is derived, because empty string is allowed
                } else {
                    this.cst.ascendTree();
                    return true;
                }
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_INT_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseStringExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_QUOTE, production, Production.StringExpr, false) && this.parseCharList([Production.CharList], true) && this.matchAndConsumeToken(TokenType.T_QUOTE, null, null, true)) {
                // Ascend the tree after StringExpr is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_STRING_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseBoolVal(production, false)) {
                // Ascend the tree after BooleanValue is derived
                this.cst.ascendTree();
                return true;
            } else if (this.matchAndConsumeToken(TokenType.T_LPAREN, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
                       this.parseBoolOp(null, true) && this.parseExpr([Production.Expr], true) && this.matchAndConsumeToken(TokenType.T_RPAREN, null, null, true)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolVal(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_BOOLVAL, production.concat([Production.BooleanExpr]), Production.BoolVal, false)) {
                // Ascend the tree after BoolVal is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_VAL_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseId(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_ID, production, Production.Id, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_ID_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseType(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_TYPE, production, Production.Type, false)) {
                // Ascend the tree after Type is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_TYPE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseChar(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_CHAR, production, Production.Char, false)){ 
                // Ascend tree after Char is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_CHAR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseDigit(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_DIGIT, production, Production.Digit, false)) {
                // Ascend tree after Digit is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_DIGIT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseIntOp(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_INTOP, production, Production.IntOp, false)) {
                // Ascend tree after IntOp is derived
                this.cst.ascendTree();
                return true;
            }
            if(expected) {
                this.errors.push(new Error(ErrorType.E_INT_OP_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolOp(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_BOOLOP, production, Production.BoolOp, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_OP_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseSpace(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.T_SPACE, production, Production.Space, false)) {
                // Ascend tree after Space is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_SPACE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseCharList(production: Array<Production>, expected: boolean): boolean {
            if (this.parseChar(production, false) && this.parseCharList(production, false)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            } else if (this.parseSpace(production, false) && this.parseCharList(production, false)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            } // Empty string is accepted
            else {
                return true;
            }
        }

        public matchAndConsumeToken(token: TokenType, start: Array<Production>, rewrite: Production, expected: boolean) {
            if (this.tokens[this.currentTokenIndex].type == token) {
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (let i = 0; i < start.length; i++) {
                        this.cst.addNTNode(start[i], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                        if (i != 0) {
                            this.valids.push("VALID - Expecting [ " + start[i - 1] + " ], found [ " + start[i] + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                        }
                    }
                    // Add final production that was rewritten.
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.valids.push("VALID - Expecting [ " + start[start.length - 1] + " ], found [ " + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.valids.push("VALID - Expecting [ " + rewrite + " ], found [ " + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                }
                // Add terminal to log
                this.valids.push("VALID - Expecting [ " + token + " ], found [ " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                // Add token to tree
                this.cst.addTNode(this.tokens[this.currentTokenIndex], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                // consume token
                this.currentTokenIndex++;
                return true;
            }
            // If token was expected and was not present, throw an error
            if (expected) {
                this.errors.push(new Error(ErrorType.E_TOKEN_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }
		
    }

}