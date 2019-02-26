///<reference path="globals.ts" />
/* 
	parser.ts  
*/

module JuiceC {

	export class Parser {

        currentTokenIndex: number;
        tokens: Array<Token>;
        errors: Array<Error>;
        parseResult = {
            "errors": [],
        };

        public init(tokens: Array<Token>): void {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.errors = [];
        }

		// Parse the completed lex programs
        public parse(tokens: Array<Token>) {
            this.init(tokens);
            this.parseProgram();
            // Grab the next token.
            //currentTokenIndex = this.getNextToken();
            
            // Report the results.
            return this.parseResult;      
        }

        // First part of the grammar, Program
        public parseProgram(): boolean {
            // Recursively call the 2nd step, Block, with the Program production and the expected terminal
            if (this.parseBlock([Production.Program], true)) {
                return true;
            // If block was not successful, return false
            } else {
                return false;
            }
            
        }

        // 2nd part of the grammar, Block
        public parseBlock(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_LBRACE, production, Production.Block, false) && this.parseStatementList(null, false) && this.consumeToken(TokenType.T_RBRACE, null, null, true)) {
                // ascend the tree after we've derived a block
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BLOCK_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseStatementList(production: Array<Production>, expected: boolean): boolean {
            if (this.parseStatement([Production.StatementList], false) && this.parseStatementList([Production.StatementList], false)) {
                // ascend the tree after we've derived a statemtlist
                //this.cst.ascendTree();
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
                    //this.cst.ascendTree();
                    return true;
            }
            return false;
        }

        public parsePrintStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_PRINT, production, Production.PrintStatement, false) && this.consumeToken(TokenType.T_LPAREN, null, null, true) &&
                this.parseExpr([Production.Expr], true) && this.consumeToken(TokenType.T_RPAREN, null, null, true)) {
                    // ascend the tree after we've derived a printstmt
                    //this.cst.ascendTree();
                    return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_PRINT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseAssignmentStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.parseId(production.concat([Production.AssignStatement]), false) && 
                this.consumeToken(TokenType.T_ASSIGN, null, null, true) && this.parseExpr([Production.Expr], true)) {
                    // ascend the tree after we've derived a assignstmt
                    //this.cst.ascendTree();
                    return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_ASSIGNMENT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseVarDeclaration(production: Array<Production>, expected: boolean): boolean {
            if (this.parseType(production.concat([Production.VarDeclaration]), false) && this.parseId(null, true)) {
                // ascend the tree after we've derived a vardecl
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_VAR_DECL_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseWhileStatement(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_WHILE, production, Production.WhileStatement, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // ascend the tree after we've derived a whilestmt
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_WHILE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseIfStatement(production: Array<Production>, expected: boolean): boolean {
            // we let parseBoolExpr derive appropriate rewrite rules by passing empty production array
            if (this.consumeToken(TokenType.T_IF, production, Production.IfStatement, false) && this.parseBoolExpr([], true) &&
                this.parseBlock(null, true)) {
                    // ascend the tree after we've derived an ifstatement
                    //this.cst.ascendTree();
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
                    // ascend the tree after we've derived an expr
                    //this.cst.ascendTree();
                    return true;
            } else {
                this.errors.push(new Error(ErrorType.E_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
                return false;
            }
        }

        public parseIntExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseDigit(production.concat([Production.IntExpr]), false)) {
                // ascend the tree after we've derived an intexpr
                if (this.parseIntOp(null, false) && this.parseExpr([Production.Expr], true)) {
                    //this.cst.ascendTree();
                    return true;
                } else {
                    //this.cst.ascendTree();
                    return true;
                }
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_INT_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseStringExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_QUOTE, production, Production.StringExpr, false) && this.parseCharList([Production.CharList], true) && this.consumeToken(TokenType.T_QUOTE, null, null, true)) {
                // ascend the tree after we've derived a stringexpr
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_STRING_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseBoolVal(production, false)) {
                // ascend the tree after we've derived a booleanexpr
                //this.cst.ascendTree();
                return true;
            } else if (this.consumeToken(TokenType.T_LPAREN, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
                       this.parseBoolOp(null, true) && this.parseExpr([Production.Expr], true) && this.consumeToken(TokenType.T_RPAREN, null, null, true)) {
                            // ascend the tree after we've derived a print statement
                            //this.cst.ascendTree();
                            return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_EXPR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolVal(production: Array<Production>, expected: boolean): boolean {
            // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
            if (this.consumeToken(TokenType.T_BOOLVAL, production.concat([Production.BooleanExpr]), Production.BoolVal, false)) {
                // ascend the tree after we've derived a boolval statement
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_VAL_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseId(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_ID, production, Production.Id, false)) {
                // ascend the tree after we've derived an id
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_ID_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseType(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_TYPE, production, Production.Type, false)) {
                // ascend the tree after we've derived a type
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_TYPE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseChar(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_CHAR, production, Production.Char, false)){ 
                // ascend tree after deriving char
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_CHAR_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseDigit(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_DIGIT, production, Production.Digit, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_DIGIT_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseIntOp(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_INTOP, production, Production.IntOp, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if(expected) {
                this.errors.push(new Error(ErrorType.E_INT_OP_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseBoolOp(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_BOOLOP, production, Production.BoolOp, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_BOOL_OP_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseSpace(production: Array<Production>, expected: boolean): boolean {
            if (this.consumeToken(TokenType.T_SPACE, production, Production.Space, false)) {
                // ascend the tree if found space
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new Error(ErrorType.E_SPACE_EXPECTED, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        }

        public parseCharList(production: Array<Production>, expected: boolean): boolean {
            // spaces are treated as chars for me
            if (this.parseChar(production, false) && this.parseCharList(production, false)) {
                // ascend the tree after we've derived a charlist
                //this.cst.ascendTree();
                return true;
            } else if (this.parseSpace(production, false) && this.parseCharList(production, false)) {
                // ascend the tree after we've derived a charlist
                //this.cst.ascendTree();
                return true;
            } else {
                // Empty string is accepted
                return true;
            }
        }

        public consumeToken(token: TokenType, start: Array<Production>, rewrite: Production, expected: boolean) {
            if(this.tokens[this.currentTokenIndex].type == token){
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (let i = 0; i < start.length; i++) {
                        //this.cst.addNTNode(start[i], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                        if (i != 0) {
                            Control.putMessage("VALID - Expecting [" + start[i - 1] + "], found [" + start[i] + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                        }
                    }
                    // Add final production that was rewritten.
                    //this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    Control.putMessage("VALID - Expecting [" + start[start.length-1] + "], found [" + rewrite + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    //this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    Control.putMessage("VALID - Expecting [" + rewrite + "], found [" + rewrite + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                }
                // Add terminal to log
                Control.putMessage("VALID - Expecting [" + token + "], found [" + this.tokens[this.currentTokenIndex].value + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);

                // Add token to tree
                //this.cst.addTNode(this.tokens[this.currentTokenIndex], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
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