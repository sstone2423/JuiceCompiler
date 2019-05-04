///<reference path="globals.ts" />
/**
 *  parser.ts
 *
 *  LL(1) Recursive Descent Parser. Leftmost derivation and Lookahead by 1 Token.
 *  This parser takes in the tokens from a successful Lex and enforces the grammar
 *  restrictions on those tokens. As it approves each section of the program, it adds
 *  it to a Concrete Syntax Tree (CST) which will then be passed to Semantic Analysis.
 *  */
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
            this.cst = new JuiceC.Tree();
            this.log = [];
        };
        /**
         * Parse recursively enforces the grammar upon the valid tokens
         * If parse is successful, return the errors, logs, and CST to control
         * Each derivation returns true or false, flagging the success of following a
         * rewrite rule for a production.
         * @param tokens are valid tokens within the grammar attained from the Lexer
         */
        Parser.prototype.parse = function (tokens) {
            this.init(tokens);
            if (this.parseProgram()) {
                // Report the results.
                var result = {
                    "error": this.error,
                    "errors": this.errors,
                    "log": this.log,
                    "cst": this.cst
                };
                return result;
            }
            else {
                // Report the results.
                var result = {
                    "error": this.error,
                    "errors": this.errors,
                    "log": this.log,
                    "cst": this.cst
                };
                return result;
            }
        };
        // Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
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
        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.matchAndConsumeToken("LBrace" /* LBrace */, production, "Block" /* Block */, false) && this.parseStatementList()
                && this.matchAndConsumeToken("RBrace" /* RBrace */, null, null, true)) {
                // Ascend the tree after a block is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Block Expected" /* BlockExpected */ + " - found [ "
                        + this.tokens[this.currentTokenIndex].type + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum
                        + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Block" /* Block */ + " ::== { "
                        + "StatementList" /* StatementList */ + " }");
                    this.error = true;
                    this.errors++;
                }
                return false;
            }
        };
        // Parses the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
        Parser.prototype.parseStatementList = function () {
            if (this.parseStatement() && this.parseStatementList()) {
                // Ascend the tree after a StatementList is derived
                this.cst.ascendTree();
                return true;
            }
            // Empty string is acceptable
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        };
        // Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, 
        // WhileStatement, VarDecl, IfStatement, or Block
        Parser.prototype.parseStatement = function () {
            if (this.parsePrintStatement(["StatementList" /* StatementList */, "Statement" /* Statement */])
                || this.parseAssignmentStatement(["StatementList" /* StatementList */, "Statement" /* Statement */])
                || this.parseWhileStatement(["StatementList" /* StatementList */, "Statement" /* Statement */])
                || this.parseVarDecl(["StatementList" /* StatementList */, "Statement" /* Statement */])
                || this.parseIfStatement(["StatementList" /* StatementList */, "Statement" /* Statement */])
                || this.parseBlock(["StatementList" /* StatementList */, "Statement" /* Statement */], false)) {
                // Ascend the tree after Statement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the productions being rewritten
         */
        Parser.prototype.parsePrintStatement = function (production) {
            if (this.matchAndConsumeToken("Print" /* Print */, production, "PrintStatement" /* PrintStatement */, false)
                && this.matchAndConsumeToken("LParen" /* LParen */, null, null, true) && this.parseExpr(["Expression" /* Expr */])
                && this.matchAndConsumeToken("RParen" /* RParen */, null, null, true)) {
                // Ascend the tree after PrintStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the productions being rewritten
         */
        Parser.prototype.parseVarDecl = function (production) {
            if (this.parseType(production.concat(["VarDecl" /* VarDecl */])) && this.parseId(null, true)) {
                // Ascend the tree after VarDecl is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
         * @param production the productions being rewritten
         */
        Parser.prototype.parseWhileStatement = function (production) {
            if (this.matchAndConsumeToken("While" /* While */, production, "WhileStatement" /* WhileStatement */, false)
                && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after WhileStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
         * @param production the productions being rewritten
         */
        Parser.prototype.parseIfStatement = function (production) {
            if (this.matchAndConsumeToken("If" /* If */, production, "IfStatement" /* IfStatement */, false)
                && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // Ascend the tree after IfStatement is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up an Expr, or an IntExpr, StringExpr, BooleanExpr, or Id
         * @param production the productions being rewritten
         */
        Parser.prototype.parseExpr = function (production) {
            if (this.parseIntExpr(production) || this.parseStringExpr(production) || this.parseBoolExpr(production, false)
                || this.parseId(production, false)) {
                // Ascend the tree after Expression is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Expression Expected" /* ExprExpected */ + " - found [ "
                    + this.tokens[this.currentTokenIndex].type + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum
                    + " ) - " + "Expression" /* Expr */ + " ::== " + "IntegerExpression" /* IntExpr */ + " or " + "StringExpression" /* StringExpr */ + " or "
                    + "BooleanExpression" /* BooleanExpr */ + " or " + "Id" /* Id */ + " )");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
         * @param production the productions being rewritten
         */
        Parser.prototype.parseIntExpr = function (production) {
            if (this.parseDigit(production.concat(["IntegerExpression" /* IntExpr */]))) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null) && this.parseExpr(["Expression" /* Expr */])) {
                    this.cst.ascendTree();
                    return true;
                    // Ascend if nothing is derived, because empty string is allowed
                }
                else {
                    this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( "
                        + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.cst.ascendTree();
                    return true;
                }
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up a StringExpr, or a " CharList "
         * @param production the productions being rewritten
         */
        Parser.prototype.parseStringExpr = function (production) {
            if (this.matchAndConsumeToken("Quote" /* Quote */, production, "StringExpression" /* StringExpr */, false)
                && this.parseCharList(["CharList" /* CharList */])
                && this.matchAndConsumeToken("Quote" /* Quote */, null, null, true)) {
                // Ascend the tree after StringExpr is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up a BooleanExpr, or a Boolval or a ( Expr Boolop Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBoolExpr = function (production, expected) {
            if (this.parseBoolVal(production)) {
                // Ascend the tree after BooleanValue is derived
                this.cst.ascendTree();
                return true;
            }
            else if (this.matchAndConsumeToken("LParen" /* LParen */, production, "BooleanExpression" /* BooleanExpr */, false)
                && this.parseExpr(["Expression" /* Expr */]) && this.parseBoolOp(null) && this.parseExpr(["Expression" /* Expr */])
                && this.matchAndConsumeToken("RParen" /* RParen */, null, null, true)) {
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "Boolean Expression Expected" /* BoolExprExpected */ + " - found [ "
                    + this.tokens[this.currentTokenIndex].type + ", " + this.tokens[this.currentTokenIndex].value
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Expression" /* Expr */ + " ::== ( " + "Expression" /* Expr */
                    + " " + "BoolOp" /* BoolOp */ + " " + "Expression" /* Expr */ + " )");
                this.error = true;
                this.errors++;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a BoolVal, or true or false
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up an Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseId = function (production, expected) {
            if (this.matchAndConsumeToken("Id" /* Id */, production, "Id" /* Id */, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + "ID Expected" /* IdExpected */ + " - found [ "
                    + this.tokens[this.currentTokenIndex].type + ", " + this.tokens[this.currentTokenIndex].value
                    + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - " + "Id" /* Id */ + " ::== " + "Char" /* Char */);
                this.error = true;
                this.errors++;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Type, or int, string, or boolean
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up a Char, or a, b, c ..., z
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up an Intop, or +
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up an Boolop, or == or !=
         * @param production the productions being rewritten
         */
        Parser.prototype.parseBoolOp = function (production) {
            if (this.matchAndConsumeToken("BoolOp" /* BoolOp */, production, "BoolOp" /* BoolOp */, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();
                return true;
            }
            else {
                this.log.push(DEBUG + " - " + PARSER + " - " + ERROR + ": " + "Boolean Operation Expected" /* BoolOpExpected */ + " - found [ "
                    + this.tokens[this.currentTokenIndex].type + ", " + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " ) - "
                    + "Expression" /* Expr */ + " ::== == | !=");
                this.error = true;
                this.errors++;
                return false;
            }
        };
        /**
         * Parses the tokens to see if they make up a Space, or a " "
         * @param production the productions being rewritten
         */
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
        /**
         * Parses the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
         * @param production the productions being rewritten
         */
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
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + "&epsilon;" /* Epsilon */ + " found at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
                return true;
            }
        };
        /**
         * Matches and consumes a passed token type.
         * If the next token we're looking at matches to a terminal symbol, consume token and advance the current token.
         * If error, break out of parse
         * Logs appropriate productions that are being derived and adds appropriate productions to the CST.
         * Token is expected to be present based on boolean value passed. If the token is not present, return an error.
         * @param token the token that is being matched and consumed
         * @param start productions that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        Parser.prototype.matchAndConsumeToken = function (token, start, rewrite, expected) {
            if (this.tokens[this.currentTokenIndex].type == token) {
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (var i = 0; i < start.length; i++) {
                        this.cst.addNTNode(start[i], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                        if (i != 0) {
                            this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + start[i - 1]
                                + " ], found [ " + start[i] + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum
                                + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                        }
                    }
                    // Add final production that was rewritten.
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + start[start.length - 1]
                        + " ], found [ " + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : "
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + rewrite + " ], found [ "
                        + rewrite + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum + " : "
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                }
                // Add terminal to log
                this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + token + " ], found [ "
                    + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum
                    + " : " + this.tokens[this.currentTokenIndex].colNum + " )");
                // Add token to tree
                this.cst.addTNode(this.tokens[this.currentTokenIndex], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                // consume token
                this.currentTokenIndex++;
                return true;
            }
            else {
                // If token was expected and was not present, throw an error
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - " + ERROR + ": " + "Token Expected" /* TExpected */ + " [ "
                        + "Expression" /* Expr */ + " ] " + " - found [ " + this.tokens[this.currentTokenIndex].type + ", "
                        + this.tokens[this.currentTokenIndex].value + " ] at ( " + this.tokens[this.currentTokenIndex].lineNum
                        + ":" + this.tokens[this.currentTokenIndex].colNum + " )");
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
