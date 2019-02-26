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
            this.parseResult = {
                "errors": []
            };
        }
        Parser.prototype.init = function (tokens) {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.errors = [];
        };
        // Parse the completed lex programs
        Parser.prototype.parse = function (tokens) {
            this.init(tokens);
            this.parseProgram();
            // Grab the next token.
            //currentTokenIndex = this.getNextToken();
            // Report the results.
            return this.parseResult;
        };
        // First part of the grammar, Program
        Parser.prototype.parseProgram = function () {
            // Recursively call the 2nd step, Block, with the Program production and the expected terminal
            if (this.parseBlock([JuiceC.Production.Program], true)) {
                return true;
                // If block was not successful, return false
            }
            else {
                return false;
            }
        };
        // 2nd part of the grammar, Block
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_LBRACE, production, JuiceC.Production.Block, false) && this.parseStatementList(null, false) && this.consumeToken(JuiceC.TokenType.T_RBRACE, null, null, true)) {
                // ascend the tree after we've derived a block
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Block Expected" /* E_BLOCK_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseStatementList = function (production, expected) {
            if (this.parseStatement([JuiceC.Production.StatementList], false) && this.parseStatementList([JuiceC.Production.StatementList], false)) {
                // ascend the tree after we've derived a statemtlist
                //this.cst.ascendTree();
                return true;
            }
            // Empty string is acceptable
            else {
                return true;
            }
        };
        Parser.prototype.parseStatement = function (production, expected) {
            if (this.parsePrintStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement], false) || this.parseAssignmentStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement], false) ||
                this.parseWhileStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement], false) || this.parseVarDeclaration([JuiceC.Production.StatementList, JuiceC.Production.Statement], false) ||
                this.parseIfStatement([JuiceC.Production.StatementList, JuiceC.Production.Statement], false) || this.parseBlock([JuiceC.Production.StatementList, JuiceC.Production.Statement], false)) {
                //this.cst.ascendTree();
                return true;
            }
            return false;
        };
        Parser.prototype.parsePrintStatement = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_PRINT, production, JuiceC.Production.PrintStatement, false) && this.consumeToken(JuiceC.TokenType.T_LPAREN, null, null, true) &&
                this.parseExpr([JuiceC.Production.Expr], true) && this.consumeToken(JuiceC.TokenType.T_RPAREN, null, null, true)) {
                // ascend the tree after we've derived a printstmt
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Print Statement Expected" /* E_PRINT_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseAssignmentStatement = function (production, expected) {
            if (this.parseId(production.concat([JuiceC.Production.AssignStatement]), false) &&
                this.consumeToken(JuiceC.TokenType.T_ASSIGN, null, null, true) && this.parseExpr([JuiceC.Production.Expr], true)) {
                // ascend the tree after we've derived a assignstmt
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Assignment Statement Expected" /* E_ASSIGNMENT_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseVarDeclaration = function (production, expected) {
            if (this.parseType(production.concat([JuiceC.Production.VarDeclaration]), false) && this.parseId(null, true)) {
                // ascend the tree after we've derived a vardecl
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Variable Declaration Expected" /* E_VAR_DECL_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseWhileStatement = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_WHILE, production, JuiceC.Production.WhileStatement, false) && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                // ascend the tree after we've derived a whilestmt
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("While Statement Expected" /* E_WHILE_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseIfStatement = function (production, expected) {
            // we let parseBoolExpr derive appropriate rewrite rules by passing empty production array
            if (this.consumeToken(JuiceC.TokenType.T_IF, production, JuiceC.Production.IfStatement, false) && this.parseBoolExpr([], true) &&
                this.parseBlock(null, true)) {
                // ascend the tree after we've derived an ifstatement
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("If Statement Expected" /* E_IF_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseExpr = function (production, expected) {
            if (this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBoolExpr(production, false) ||
                this.parseId(production, false)) {
                // ascend the tree after we've derived an expr
                //this.cst.ascendTree();
                return true;
            }
            else {
                this.errors.push(new JuiceC.Error("Expression Expected" /* E_EXPR_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
                return false;
            }
        };
        Parser.prototype.parseIntExpr = function (production, expected) {
            if (this.parseDigit(production.concat([JuiceC.Production.IntExpr]), false)) {
                // ascend the tree after we've derived an intexpr
                if (this.parseIntOp(null, false) && this.parseExpr([JuiceC.Production.Expr], true)) {
                    //this.cst.ascendTree();
                    return true;
                }
                else {
                    //this.cst.ascendTree();
                    return true;
                }
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Integer Expression Expected" /* E_INT_EXPR_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseStringExpr = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_QUOTE, production, JuiceC.Production.StringExpr, false) && this.parseCharList([JuiceC.Production.CharList], true) && this.consumeToken(JuiceC.TokenType.T_QUOTE, null, null, true)) {
                // ascend the tree after we've derived a stringexpr
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("String Expression Expected" /* E_STRING_EXPR_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseBoolExpr = function (production, expected) {
            if (this.parseBoolVal(production, false)) {
                // ascend the tree after we've derived a booleanexpr
                //this.cst.ascendTree();
                return true;
            }
            else if (this.consumeToken(JuiceC.TokenType.T_LPAREN, production, JuiceC.Production.BooleanExpr, false) && this.parseExpr([JuiceC.Production.Expr], true) &&
                this.parseBoolOp(null, true) && this.parseExpr([JuiceC.Production.Expr], true) && this.consumeToken(JuiceC.TokenType.T_RPAREN, null, null, true)) {
                // ascend the tree after we've derived a print statement
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Boolean Expression Expected" /* E_BOOL_EXPR_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseBoolVal = function (production, expected) {
            // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
            if (this.consumeToken(JuiceC.TokenType.T_BOOLVAL, production.concat([JuiceC.Production.BooleanExpr]), JuiceC.Production.BoolVal, false)) {
                // ascend the tree after we've derived a boolval statement
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Boolean Value Expected" /* E_BOOL_VAL_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseId = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_ID, production, JuiceC.Production.Id, false)) {
                // ascend the tree after we've derived an id
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("ID Expected" /* E_ID_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseType = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_TYPE, production, JuiceC.Production.Type, false)) {
                // ascend the tree after we've derived a type
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Type Expected" /* E_TYPE_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseChar = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_CHAR, production, JuiceC.Production.Char, false)) {
                // ascend tree after deriving char
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Character Expected" /* E_CHAR_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseDigit = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_DIGIT, production, JuiceC.Production.Digit, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Digit Expected" /* E_DIGIT_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseIntOp = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_INTOP, production, JuiceC.Production.IntOp, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Integer Operation Expected" /* E_INT_OP_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseBoolOp = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_BOOLOP, production, JuiceC.Production.BoolOp, false)) {
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Boolean Operation Expected" /* E_BOOL_OP_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseSpace = function (production, expected) {
            if (this.consumeToken(JuiceC.TokenType.T_SPACE, production, JuiceC.Production.Space, false)) {
                // ascend the tree if found space
                //this.cst.ascendTree();
                return true;
            }
            if (expected) {
                this.errors.push(new JuiceC.Error("Space Expected" /* E_SPACE_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        Parser.prototype.parseCharList = function (production, expected) {
            // spaces are treated as chars for me
            if (this.parseChar(production, false) && this.parseCharList(production, false)) {
                // ascend the tree after we've derived a charlist
                //this.cst.ascendTree();
                return true;
            }
            else if (this.parseSpace(production, false) && this.parseCharList(production, false)) {
                // ascend the tree after we've derived a charlist
                //this.cst.ascendTree();
                return true;
            }
            else {
                // Empty string is accepted
                return true;
            }
        };
        Parser.prototype.consumeToken = function (token, start, rewrite, expected) {
            if (this.tokens[this.currentTokenIndex].type == token) {
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (var i = 0; i < start.length; i++) {
                        //this.cst.addNTNode(start[i], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                        if (i != 0) {
                            JuiceC.Control.putMessage("VALID - Expecting [" + start[i - 1] + "], found [" + start[i] + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                        }
                    }
                    // Add final production that was rewritten.
                    //this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    JuiceC.Control.putMessage("VALID - Expecting [" + start[start.length - 1] + "], found [" + rewrite + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    //this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                    JuiceC.Control.putMessage("VALID - Expecting [" + rewrite + "], found [" + rewrite + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                }
                // Add terminal to log
                JuiceC.Control.putMessage("VALID - Expecting [" + token + "], found [" + this.tokens[this.currentTokenIndex].value + "] on line " + this.tokens[this.currentTokenIndex].lineNum + " col " + this.tokens[this.currentTokenIndex].colNum);
                // Add token to tree
                //this.cst.addTNode(this.tokens[this.currentTokenIndex], this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum);
                // consume token
                this.currentTokenIndex++;
                return true;
            }
            // If token was expected and was not present, throw an error
            if (expected) {
                this.errors.push(new JuiceC.Error("Token Expected" /* E_TOKEN_EXPECTED */, this.tokens[this.currentTokenIndex].type, this.tokens[this.currentTokenIndex].lineNum, this.tokens[this.currentTokenIndex].colNum));
            }
            return false;
        };
        return Parser;
    }());
    JuiceC.Parser = Parser;
})(JuiceC || (JuiceC = {}));
