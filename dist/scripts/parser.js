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
            if (this.parseBlock(["Program" /* Program */], true) && this.matchAndConsumeToken("EOP" /* EOP */, null, null, true)) {
                return true;
                // If block was not successful, return false
            }
            else {
                return false;
            }
        };
        // 2nd part of the grammar, Block
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.matchAndConsumeToken("LBrace" /* LBrace */, production, "Block" /* Block */, false) && this.parseStatementList() && this.matchAndConsumeToken("RBrace" /* RBrace */, null, null, true)) {
                // Ascend the tree after a block is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Block Expected" /* BlockExpected */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                        + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Block" /* Block */
                        + " ::== { " + "StatementList" /* StatementList */ + " }");
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
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        };
        Parser.prototype.parseStatement = function () {
            if (this.parsePrintStatement(["StatementList" /* StatementList */, "Statement" /* Statement */]) || this.parseAssignmentStatement(["StatementList" /* StatementList */, "Statement" /* Statement */]) ||
                this.parseWhileStatement(["StatementList" /* StatementList */, "Statement" /* Statement */]) || this.parseVarDeclaration(["StatementList" /* StatementList */, "Statement" /* Statement */]) ||
                this.parseIfStatement(["StatementList" /* StatementList */, "Statement" /* Statement */]) || this.parseBlock(["StatementList" /* StatementList */, "Statement" /* Statement */], false)) {
                // Ascend the tree after Statement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parsePrintStatement = function (production) {
            if (this.matchAndConsumeToken("Print" /* Print */, production, "PrintStatement" /* PrintStatement */, false) && this.matchAndConsumeToken("LParen" /* LParen */, null, null, true) &&
                this.parseExpr(["Expression" /* Expr */]) && this.matchAndConsumeToken("RParen" /* RParen */, null, null, true)) {
                // Ascend the tree after PrintStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseAssignmentStatement = function (production) {
            if (this.parseId(production.concat(["AssignmentStatement" /* AssignStatement */]), false) &&
                this.matchAndConsumeToken("Assign" /* Assign */, null, null, true) && this.parseExpr(["Expression" /* Expr */])) {
                // Ascend the tree after AssignmentStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseVarDeclaration = function (production) {
            if (this.parseType(production.concat(["VarDecl" /* VarDeclaration */])) && this.parseId(null, true)) {
                // Ascend the tree after VarDeclaration is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseWhileStatement = function (production) {
            if (this.matchAndConsumeToken("While" /* While */, production, "WhileStatement" /* WhileStatement */, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after WhileStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseIfStatement = function (production) {
            if (this.matchAndConsumeToken("If" /* If */, production, "IfStatement" /* IfStatement */, false) && this.parseBoolExpr([], true) &&
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
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Expression Expected" /* ExprExpected */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Expression" /* Expr */
                    + " ::== " + "IntegerExpression" /* IntExpr */ + " or " + "StringExpression" /* StringExpr */ + " or " + "BooleanExpression" /* BooleanExpr */ + " or " + "Id" /* Id */ + " )");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        Parser.prototype.parseIntExpr = function (production) {
            if (this.parseDigit(production.concat(["IntegerExpression" /* IntExpr */]))) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null) && this.parseExpr(["Expression" /* Expr */])) {
                    this.cst.ascendTree();
                    return true;
                    // Ascend if nothing is derived, because empty string is allowed
                }
                else {
                    this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.cst.ascendTree();
                    return true;
                }
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseStringExpr = function (production) {
            if (this.matchAndConsumeToken("Quote" /* Quote */, production, "StringExpression" /* StringExpr */, false) && this.parseCharList(["CharList" /* CharList */]) && this.matchAndConsumeToken("Quote" /* Quote */, null, null, true)) {
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
            else if (this.matchAndConsumeToken("LParen" /* LParen */, production, "BooleanExpression" /* BooleanExpr */, false) && this.parseExpr(["Expression" /* Expr */]) &&
                this.parseBoolOp(null) && this.parseExpr(["Expression" /* Expr */]) && this.matchAndConsumeToken("RParen" /* RParen */, null, null, true)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Expression Expected" /* BoolExprExpected */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Expression" /* Expr */
                    + " ::== ( " + "Expression" /* Expr */ + " " + "BoolOp" /* BoolOp */ + " " + "Expression" /* Expr */ + " )");
                this.error = true;
                this.errors++;
            }
            return false;
        };
        Parser.prototype.parseBoolVal = function (production) {
            if (this.matchAndConsumeToken("BoolVal" /* BoolVal */, production.concat(["BooleanExpression" /* BooleanExpr */]), "BoolVal" /* BoolVal */, false)) {
                // Ascend the tree after BoolVal is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseId = function (production, expected) {
            if (this.matchAndConsumeToken("Id" /* Id */, production, "Id" /* Id */, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "ID Expected" /* IdExpected */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Id" /* Id */
                    + " ::== " + "Char" /* Char */);
                this.error = true;
                this.errors++;
            }
            return false;
        };
        Parser.prototype.parseType = function (production) {
            if (this.matchAndConsumeToken("Type" /* Type */, production, "Type" /* Type */, false)) {
                // Ascend the tree after Type is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseChar = function (production) {
            if (this.matchAndConsumeToken("Char" /* Char */, production, "Char" /* Char */, false)) {
                // Ascend tree after Char is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseDigit = function (production) {
            if (this.matchAndConsumeToken("Digit" /* Digit */, production, "Digit" /* Digit */, false)) {
                // Ascend tree after Digit is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseIntOp = function (production) {
            if (this.matchAndConsumeToken("IntOp" /* IntOp */, production, "IntOp" /* IntOp */, false)) {
                // Ascend tree after IntOp is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseBoolOp = function (production) {
            if (this.matchAndConsumeToken("BoolOp" /* BoolOp */, production, "BoolOp" /* BoolOp */, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                this.log.push(DEBUG + " - " + PARSER + " - + " + ERROR + ": " + "Boolean Operation Expected" /* BoolOpExpected */ + " - found [ " + this.tokens[this.currentTokenIndex].type
                    + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Expression" /* Expr */
                    + " ::== == | !=");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        Parser.prototype.parseSpace = function (production) {
            if (this.matchAndConsumeToken("Space" /* Space */, production, "Space" /* Space */, false)) {
                // Ascend tree after Space is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.parseCharList = function (production) {
            if (this.parseChar(production) && this.parseCharList(production)) {
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
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
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
                    this.log.push(DEBUG + " - " + PARSER + " - " + ERROR + ": " + "Token Expected" /* TExpected */ + " [ " + "Expression" /* Expr */ + " ] - found [ " + this.tokens[this.currentTokenIndex].type
                        + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
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
