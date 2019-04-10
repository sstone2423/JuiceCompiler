///<reference path="globals.ts" />
/*
    parser.ts

    LL(1) Recursive Descent Parser. Leftmost Lookahead by 1.
    This parser takes in the tokens from a successful Lex and enforces the grammar restrictions on those tokens. As it approves
    each section of the program, it adds it to a Concrete Syntax Tree (CST) which will then be passed to Semantic Analysis.
*/
var JuiceC;
(function (JuiceC) {
    var Parser = /** @class */ (function () {
        function Parser() {
        }
        Parser.prototype.init = function (tokens) {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.error = false;
            this.errors = 0;
            this.isComplete = false;
            this.cst = new JuiceC.Tree();
            this.log = [];
        };
        // Parse the isCompleted lex programs
        Parser.prototype.parse = function (tokens) {
            this.init(tokens);
            if (this.parseProgram()) {
                this.isComplete = true;
            }
            // Report the results.
            var results = {
                "error": this.error,
                "errors": this.errors,
                "log": this.log,
                "cst": this.cst,
                "isComplete": this.isComplete
            };
            return results;
        };
        // First part of the grammar, Program
        Parser.prototype.parseProgram = function () {
            // Recursively call the 2nd step, Block, with the Program production and the expected terminal
            if (this.parseBlock([JuiceC.Production.Program], true) && this.matchAndConsumeToken(JuiceC.TokenType.EOP, null, null, true)) {
                return true;
                // If block was not successful, return false
            }
            else {
                return false;
            }
        };
        // 2nd part of the grammar, Block
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.LBRACE, production, JuiceC.Production.Block, false) && this.parseStatementList() && this.matchAndConsumeToken(JuiceC.TokenType.RBRACE, null, null, true)) {
                // Ascend the tree after a block is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Block Expected" /* BLOCK_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                        + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Block
                        + " ::== { " + JuiceC.Production.StatementList + " }");
                    this.error = true;
                    this.errors++;
                }
                return false;
            }
        };
        Parser.prototype.parseStatementList = function () {
            if (this.parseStatement() && this.parseStatementList()) {
                // Ascend the tree after a StatementList is derived
                this.cst.ascendTree();
                return true;
            }
            // Empty string is acceptable
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + JuiceC.Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        };
        Parser.prototype.parseStatement = function () {
            if (this.parsePrintStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement]) || this.parseAssignmentStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement]) ||
                this.parseWhileStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement]) || this.parseVarDeclaration([JuiceC.Production.StatementList, JuiceC.Production.Statement]) ||
                this.parseIfStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement]) || this.parseBlock([JuiceC.Production.StatementList, JuiceC.Production.Statement], false)) {
                // Ascend the tree after Statement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parsePrintStatement = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.PRINT, production, JuiceC.Production.PrintStatement, false) && this.matchAndConsumeToken(JuiceC.TokenType.LPAREN, null, null, true) &&
                this.parseExpr([JuiceC.Production.Expr]) && this.matchAndConsumeToken(JuiceC.TokenType.RPAREN, null, null, true)) {
                // Ascend the tree after PrintStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseAssignmentStatement = function (production) {
            if (this.parseId(production.concat([JuiceC.Production.AssignStatement]), false) &&
                this.matchAndConsumeToken(JuiceC.TokenType.ASSIGN, null, null, true) && this.parseExpr([JuiceC.Production.Expr])) {
                // Ascend the tree after AssignmentStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseVarDeclaration = function (production) {
            if (this.parseType(production.concat([JuiceC.Production.VarDeclaration])) && this.parseId(null, true)) {
                // Ascend the tree after VarDeclaration is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseWhileStatement = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.WHILE, production, JuiceC.Production.WhileStatement, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after WhileStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseIfStatement = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.IF, production, JuiceC.Production.IfStatement, false) && this.parseBoolExpr([], true) &&
                this.parseBlock(null, true)) {
                // Ascend the tree after IfStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseExpr = function (production) {
            if (this.parseIntExpr(production) || this.parseStringExpr(production) || this.parseBoolExpr(production, false) ||
                this.parseId(production, false)) {
                // Ascend the tree after Expression is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Expression Expected" /* EXPR_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Expr
                    + " ::== " + JuiceC.Production.IntExpr + " or " + JuiceC.Production.StringExpr + " or " + JuiceC.Production.BooleanExpr + " or " + JuiceC.Production.Id + " )");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        Parser.prototype.parseIntExpr = function (production) {
            if (this.parseDigit(production.concat([JuiceC.Production.IntExpr]), false)) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null, false) && this.parseExpr([JuiceC.Production.Expr])) {
                    this.cst.ascendTree();
                    return true;
                    // Ascend if nothing is derived, because empty string is allowed
                }
                else {
                    this.log.push(DEBUG + " - " + PARSER + " - VALID: " + JuiceC.Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.cst.ascendTree();
                    return true;
                }
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseStringExpr = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.QUOTE, production, JuiceC.Production.StringExpr, false) && this.parseCharList([JuiceC.Production.CharList]) && this.matchAndConsumeToken(JuiceC.TokenType.QUOTE, null, null, true)) {
                // Ascend the tree after StringExpr is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseBoolExpr = function (production, expected) {
            if (this.parseBoolVal(production)) {
                // Ascend the tree after BooleanValue is derived
                this.cst.ascendTree();
                return true;
            }
            else if (this.matchAndConsumeToken(JuiceC.TokenType.LPAREN, production, JuiceC.Production.BooleanExpr, false) && this.parseExpr([JuiceC.Production.Expr]) &&
                this.parseBoolOp(null, true) && this.parseExpr([JuiceC.Production.Expr]) && this.matchAndConsumeToken(JuiceC.TokenType.RPAREN, null, null, true)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Expression Expected" /* BOOL_EXPR_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Expr
                    + " ::== ( " + JuiceC.Production.Expr + " " + JuiceC.Production.BoolOp + " " + JuiceC.Production.Expr + " )");
                this.error = true;
                this.errors++;
            }
            return false;
        };
        Parser.prototype.parseBoolVal = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.BOOLVAL, production.concat([JuiceC.Production.BooleanExpr]), JuiceC.Production.BoolVal, false)) {
                // Ascend the tree after BoolVal is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseId = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.ID, production, JuiceC.Production.Id, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "ID Expected" /* ID_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Id
                    + " ::== " + JuiceC.Production.Char);
                this.error = true;
                this.errors++;
            }
            return false;
        };
        Parser.prototype.parseType = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.TYPE, production, JuiceC.Production.Type, false)) {
                // Ascend the tree after Type is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseChar = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.CHAR, production, JuiceC.Production.Char, false)) {
                // Ascend tree after Char is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseDigit = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.DIGIT, production, JuiceC.Production.Digit, false)) {
                // Ascend tree after Digit is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseIntOp = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.INTOP, production, JuiceC.Production.IntOp, false)) {
                // Ascend tree after IntOp is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseBoolOp = function (production, expected) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.BOOLOP, production, JuiceC.Production.BoolOp, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Operation Expected" /* BOOL_OP_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Expr
                    + " ::== == | !=");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        Parser.prototype.parseSpace = function (production) {
            if (this.matchAndConsumeToken(JuiceC.TokenType.SPACE, production, JuiceC.Production.Space, false)) {
                // Ascend tree after Space is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseCharList = function (production) {
            if (this.parseChar(production, false) && this.parseCharList(production)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            }
            else if (this.parseSpace(production) && this.parseCharList(production)) {
                // Ascend the tree after CharList is derived
                this.cst.ascendTree();
                return true;
            } // Empty string is accepted
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + JuiceC.Production.Epsilon + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        };
        Parser.prototype.matchAndConsumeToken = function (token, start, rewrite, expected) {
            if (this.tokens[this.currentTokenIndex].type == token) {
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (var i = 0; i < start.length; i++) {
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
            }
            else {
                // If token was expected and was not present, throw an error
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Token Expected" /* TOKEN_EXPECTED */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                        + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + JuiceC.Production.Expr);
                    this.error = true;
                    this.errors++;
                }
            }
            return false;
        };
        return Parser;
    }());
    JuiceC.Parser = Parser;
})(JuiceC || (JuiceC = {}));
