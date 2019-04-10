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
        error: boolean;
        errors: number;
        log: Array<string>;
        isComplete: boolean;
        cst: Tree;

        public init(tokens: Array<Token>): void {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.error = false;
            this.errors = 0;
            this.isComplete = false;
            this.cst = new Tree();
            this.log = [];
        }

		// Parse the isCompleted lex programs
        public parse(tokens: Array<Token>) {
            this.init(tokens);

            if (this.parseProgram()) {
                this.isComplete = true;
            } 
            
            // Report the results.
            let results = {
                "error": this.error,
                "errors": this.errors,
                "log": this.log,
                "cst": this.cst,
                "isComplete": this.isComplete,
            }
            return results;      
        }

        // First part of the grammar, Program
        public parseProgram(): boolean {
            // Recursively call the 2nd step, Block, with the Program production and the expected terminal
            if (this.parseBlock([Production.Program], true) && this.matchAndConsumeToken(TokenType.EOP, null, null, true)) {
                return true;
            // If block was not successful, return false
            } else {
                return false;
            }
            
        }

        // 2nd part of the grammar, Block
        public parseBlock(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.LBRACE, production, Production.Block, false) && this.parseStatementList() && this.matchAndConsumeToken(TokenType.RBRACE, null, null, true)) {
                // Ascend the tree after a block is derived
                this.cst.ascendTree();
                return true;
            } else {
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.BLOCK_EXPECTED + " - found [ " + this.tokens[this.currentTokenIndex].type 
                        + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Block 
                        + " ::== { " + Production.StatementList + " }");
                    this.error = true;
                    this.errors++;
                }
                return false;
            }
        }

        public parseStatementList(): boolean {
            if (this.parseStatement() && this.parseStatementList()) {
                // Ascend the tree after a StatementList is derived
                this.cst.ascendTree();
                return true;
            }
            // Empty string is acceptable
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        }

        public parseStatement(): boolean {
            if (this.parsePrintStatement([Production.StatementList, Production.Statement]) || this.parseAssignmentStatement([Production.StatementList, Production.Statement]) || 
                this.parseWhileStatement([Production.StatementList, Production.Statement]) || this.parseVarDeclaration([Production.StatementList, Production.Statement]) || 
                this.parseIfStatement([Production.StatementList, Production.Statement]) || this.parseBlock([Production.StatementList, Production.Statement], false)) {
                    // Ascend the tree after Statement is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                return false;
            }
        }

        public parsePrintStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.PRINT, production, Production.PrintStatement, false) && this.matchAndConsumeToken(TokenType.LPAREN, null, null, true) &&
                this.parseExpr([Production.Expr]) && this.matchAndConsumeToken(TokenType.RPAREN, null, null, true)) {
                    // Ascend the tree after PrintStatement is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                return false;
            }
        }

        public parseAssignmentStatement(production: Array<Production>): boolean {
            if (this.parseId(production.concat([Production.AssignStatement]), false) && 
                this.matchAndConsumeToken(TokenType.ASSIGN, null, null, true) && this.parseExpr([Production.Expr])) {
                    // Ascend the tree after AssignmentStatement is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                return false;
            }
        }

        public parseVarDeclaration(production: Array<Production>): boolean {
            if (this.parseType(production.concat([Production.VarDeclaration])) && this.parseId(null, true)) {
                // Ascend the tree after VarDeclaration is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseWhileStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.WHILE, production, Production.WhileStatement, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after WhileStatement is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseIfStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.IF, production, Production.IfStatement, false) && this.parseBoolExpr([], true) &&
                this.parseBlock(null, true)) {
                    // Ascend the tree after IfStatement is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                return false;
            }
        }

        public parseExpr(production: Array<Production>): boolean {
            if (this.parseIntExpr(production) || this.parseStringExpr(production) || this.parseBoolExpr(production, false) || 
                this.parseId(production, false)) {
                    // Ascend the tree after Expression is derived
                    this.cst.ascendTree();
                    return true;
            } else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.EXPR_EXPECTED + " - found [ " + this.tokens[this.currentTokenIndex].type 
                    + ", " +  this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Expr 
                    + " ::== " + Production.IntExpr + " or " + Production.StringExpr + " or " + Production.BooleanExpr + " or " + Production.Id + " )");
                this.error = true;
                this.errors++;
                return false;
            }
        }

        public parseIntExpr(production: Array<Production>): boolean {
            if (this.parseDigit(production.concat([Production.IntExpr]))) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null) && this.parseExpr([Production.Expr])) {
                    this.cst.ascendTree();
                    return true;
                // Ascend if nothing is derived, because empty string is allowed
                } else {
                    this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.cst.ascendTree();
                    return true;
                }
            } else {
                return false;
            }
        }

        public parseStringExpr(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.QUOTE, production, Production.StringExpr, false) && this.parseCharList([Production.CharList]) && this.matchAndConsumeToken(TokenType.QUOTE, null, null, true)) {
                // Ascend the tree after StringExpr is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseBoolExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseBoolVal(production)) {
                // Ascend the tree after BooleanValue is derived
                this.cst.ascendTree();
                return true;
            } else if (this.matchAndConsumeToken(TokenType.LPAREN, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr]) &&
                       this.parseBoolOp(null) && this.parseExpr([Production.Expr]) && this.matchAndConsumeToken(TokenType.RPAREN, null, null, true)) {
                            this.cst.ascendTree();
                            return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.BOOL_EXPR_EXPECTED + " - found [ " + this.tokens[this.currentTokenIndex].type 
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Expr 
                    + " ::== ( " + Production.Expr + " " + Production.BoolOp + " " + Production.Expr + " )");
                this.error = true;
                this.errors++;
            }
            return false;
        }

        public parseBoolVal(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.BOOLVAL, production.concat([Production.BooleanExpr]), Production.BoolVal, false)) {
                // Ascend the tree after BoolVal is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseId(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.ID, production, Production.Id, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.ID_EXPECTED + " - found [ " + this.tokens[this.currentTokenIndex].type 
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Id 
                    + " ::== " + Production.Char);
                this.error = true;
                this.errors++;
            }
            return false;
        }

        public parseType(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.TYPE, production, Production.Type, false)) {
                // Ascend the tree after Type is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseChar(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.CHAR, production, Production.Char, false)){ 
                // Ascend tree after Char is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseDigit(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.DIGIT, production, Production.Digit, false)) {
                // Ascend tree after Digit is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseIntOp(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.INTOP, production, Production.IntOp, false)) {
                // Ascend tree after IntOp is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseBoolOp(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.BOOLOP, production, Production.BoolOp, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();
                return true;
            } else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.BOOL_OP_EXPECTED + " - found [ " + this.tokens[this.currentTokenIndex].type 
                + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Expr 
                    + " ::== == | !=");
                this.error = true;
                this.errors++;
                return false;
            }
        }

        public parseSpace(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.SPACE, production, Production.Space, false)) {
                // Ascend tree after Space is derived
                this.cst.ascendTree();
                return true;
            } else {
                return false;
            }
        }

        public parseCharList(production: Array<Production>): boolean {
            if (this.parseChar(production) && this.parseCharList(production)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            } else if (this.parseSpace(production) && this.parseCharList(production)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            } // Empty string is accepted
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
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
                            this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + start[i - 1] + " ], found [ " + start[i] + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                        }
                    }
                    // Add final production that was rewritten.
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + start[start.length - 1] + " ], found [ " + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + rewrite + " ], found [ " + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                }
                // Add terminal to log
                this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + token + " ], found [ " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                // Add token to tree
                this.cst.addTNode(this.tokens[this.currentTokenIndex], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                // consume token
                this.currentTokenIndex++;
                return true;
            } else {
                // If token was expected and was not present, throw an error
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.TOKEN_EXPECTED + " [ " + Production.Expr + " ] - found [ " + this.tokens[this.currentTokenIndex].type 
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.error = true;
                    this.errors++;
                }
            }
            
            return false;
        }
		
    }

}