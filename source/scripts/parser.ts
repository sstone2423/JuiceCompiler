///<reference path="globals.ts" />
/**
 *  parser.ts
 * 
 *  LL(1) Recursive Descent Parser. Leftmost derivation and Lookahead by 1 Token.
 *  This parser takes in the tokens from a successful Lex and enforces the grammar 
 *  restrictions on those tokens. As it approves each section of the program, it adds 
 *  it to a Concrete Syntax Tree (CST) which will then be passed to Semantic Analysis.
 */

module JuiceC {
    export interface ParseResult {
        error: boolean;
        errors: number;
        log: Array<string>;
        cst: Tree;
    }

    export class Parser {
        currentTokenIndex: number;
        tokens: Array<Token>;
        error: boolean;
        errors: number;
        log: Array<string>;
        cst: Tree;

        init(tokens: Array<Token>): void {
            this.currentTokenIndex = 0;
            this.tokens = tokens;
            this.error = false;
            this.errors = 0;
            this.cst = new Tree();
            this.log = [];
        }

        /**
         * Parse recursively enforces the grammar upon the valid tokens
         * If parse is successful, return the errors, logs, and CST to control
         * Each derivation returns true or false, flagging the success of following a
         * rewrite rule for a production.
         * @param tokens are valid tokens within the grammar attained from the Lexer
         */
        parse(tokens: Array<Token>): ParseResult {
            this.init(tokens);

            if (this.parseProgram()) {
                // Report the results.
                const result: ParseResult = {
                    "error": this.error,
                    "errors": this.errors,
                    "log": this.log,
                    "cst": this.cst
                };

                return result;
            } else {
                // Report the results.
                const result: ParseResult = {
                    "error": this.error,
                    "errors": this.errors,
                    "log": this.log,
                    "cst": this.cst
                };

                return result;
            }
        }

        /**
         * Parses the tokens to see if they make up a Program, or a Block 
         * appended with an EOP marker
         */
        parseProgram(): boolean {
            // Recursively call the 2nd step, Block, with the Program production
            // and the expected terminal
            if (this.parseBlock([Production.Program], true) &&
                this.matchAndConsumeToken(TokenType.EOP, null, null, true)) {
                    return true;
            // If block was not successful, return false
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        parseBlock(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.LBrace, production, Production.Block, false) &&
                this.parseStatementList() &&
                this.matchAndConsumeToken(TokenType.RBrace, null, null, true)) {
                    // Ascend the tree after a block is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.BlockExpected
                        + " - found [ " + this.tokens[this.currentTokenIndex].type + " ] at ( "
                        + this.tokens[this.currentTokenIndex].lineNum + ":"
                        + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Block
                        + " ::== { " + Production.StatementList + " }");
                    this.error = true;
                    this.errors++;
                }

                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a StatementList, or a 
         * Statement StatementList, or epsilon
         */
        parseStatementList(): boolean {
            if (this.parseStatement() && this.parseStatementList()) {
                // Ascend the tree after a StatementList is derived
                this.cst.ascendTree();

                return true;
            }
            // Empty string is acceptable
            else {
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon
                    + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " )");

                return true;
            }
        }

        /**
         * Parses the tokens to see if they make up a Statement, or a
         *  PrintStatement, AssignStatement, WhileStatement, VarDecl,
         *  IfStatement, or Block
         */
        parseStatement(): boolean {
            if (this.parsePrintStatement([Production.StatementList, Production.Statement]) ||
                this.parseAssignmentStatement([Production.StatementList, Production.Statement]) ||
                this.parseWhileStatement([Production.StatementList, Production.Statement]) ||
                this.parseVarDecl([Production.StatementList, Production.Statement]) ||
                this.parseIfStatement([Production.StatementList, Production.Statement]) ||
                this.parseBlock([Production.StatementList, Production.Statement], false)) {
                    // Ascend the tree after Statement is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the productions being rewritten
         */
        parsePrintStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(
                TokenType.Print, production, Production.PrintStatement, false) &&
                this.matchAndConsumeToken(TokenType.LParen, null, null, true) &&
                this.parseExpr([Production.Expr]) &&
                this.matchAndConsumeToken(TokenType.RParen, null, null, true)) {
                    // Ascend the tree after PrintStatement is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the productions being rewritten
         */
        parseAssignmentStatement(production: Array<Production>): boolean {
            if (this.parseId(production.concat([Production.AssignStatement]), false) &&
                this.matchAndConsumeToken(TokenType.Assign, null, null, true) &&
                this.parseExpr([Production.Expr])) {
                    // Ascend the tree after AssignmentStatement is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the productions being rewritten
         */
        parseVarDecl(production: Array<Production>): boolean {
            if (this.parseType(production.concat([Production.VarDecl])) &&
                this.parseId(null, true)) {
                    // Ascend the tree after VarDecl is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
         * @param production the productions being rewritten
         */
        parseWhileStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(
                TokenType.While, production, Production.WhileStatement, false) &&
                this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                    // Ascend the tree after WhileStatement is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
         * @param production the productions being rewritten
         */
        parseIfStatement(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.If, production, Production.IfStatement, false)
                && this.parseBoolExpr([], true) && this.parseBlock(null, true)) {
                    // Ascend the tree after IfStatement is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an Expr, or an IntExpr, 
         * StringExpr, BooleanExpr, or Id
         * @param production the productions being rewritten
         */
        parseExpr(production: Array<Production>): boolean {
            if (this.parseIntExpr(production) || this.parseStringExpr(production) ||
                this.parseBoolExpr(production, false) || this.parseId(production, false)) {
                    // Ascend the tree after Expression is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.ExprExpected
                    + " - found [ " + this.tokens[this.currentTokenIndex].type + ", "
                    + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Expr
                    + " ::== " + Production.IntExpr + " or " + Production.StringExpr + " or "
                    + Production.BooleanExpr + " or " + Production.Id + " )");
                this.error = true;
                this.errors++;

                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
         * @param production the productions being rewritten
         */
        parseIntExpr(production: Array<Production>): boolean {
            if (this.parseDigit(production.concat([Production.IntExpr]))) {
                // Ascend the tree after IntExpr is derived
                if (this.parseIntOp(null) && this.parseExpr([Production.Expr])) {
                    this.cst.ascendTree();

                    return true;
                // Ascend if nothing is derived, because empty string is allowed
                } else {
                    this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon
                        + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":"
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.cst.ascendTree();

                    return true;
                }
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a StringExpr, or a " CharList "
         * @param production the productions being rewritten
         */
        parseStringExpr(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(
                TokenType.Quote, production, Production.StringExpr, false) &&
                this.parseCharList([Production.CharList]) &&
                this.matchAndConsumeToken(TokenType.Quote, null, null, true)) {
                    // Ascend the tree after StringExpr is derived
                    this.cst.ascendTree();

                    return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a BooleanExpr, 
         * or a Boolval or a ( Expr Boolop Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        parseBoolExpr(production: Array<Production>, expected: boolean): boolean {
            if (this.parseBoolVal(production)) {
                // Ascend the tree after BooleanValue is derived
                this.cst.ascendTree();

                return true;
            } else if (this.matchAndConsumeToken(
                TokenType.LParen, production, Production.BooleanExpr, false) &&
                this.parseExpr([Production.Expr]) && this.parseBoolOp(null) &&
                this.parseExpr([Production.Expr]) &&
                this.matchAndConsumeToken(TokenType.RParen, null, null, true)) {
                    this.cst.ascendTree();

                    return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.BoolExprExpected
                    + " - found [ " + this.tokens[this.currentTokenIndex].type + ", "
                    + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Expr
                    + " ::== ( " + Production.Expr + " " + Production.BoolOp + " "
                    + Production.Expr + " )");
                this.error = true;
                this.errors++;
            }

            return false;
        }

        /**
         * Parses the tokens to see if they make up a BoolVal, or true or false
         * @param production the productions being rewritten
         */
        parseBoolVal(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.BoolVal,
                production.concat([Production.BooleanExpr]), Production.BoolVal, false)) {
                // Ascend the tree after BoolVal is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        parseId(production: Array<Production>, expected: boolean): boolean {
            if (this.matchAndConsumeToken(TokenType.Id, production, Production.Id, false)) {
                // Ascend the tree after Id is derived
                this.cst.ascendTree();

                return true;
            }
            if (expected) {
                this.log.push(DEBUG + " - " + PARSER + " - ERROR: " + ErrorType.IdExpected
                    + " - found [ " + this.tokens[this.currentTokenIndex].type + ", "
                    + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - " + Production.Id
                    + " ::== " + Production.Char);
                this.error = true;
                this.errors++;
            }

            return false;
        }

        /**
         * Parses the tokens to see if they make up a Type, or int, string, or boolean
         * @param production the productions being rewritten
         */
        parseType(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.Type, production, Production.Type, false)) {
                // Ascend the tree after Type is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a Char, or a, b, c ..., z
         * @param production the productions being rewritten
         */
        parseChar(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.Char, production, Production.Char, false)) {
                // Ascend tree after Char is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
         * @param production the productions being rewritten
         */
        parseDigit(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.Digit, production, Production.Digit, false)) {
                // Ascend tree after Digit is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an Intop, or +
         * @param production the productions being rewritten
         */
        parseIntOp(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.IntOp, production, Production.IntOp, false)) {
                // Ascend tree after IntOp is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up an Boolop, or == or !=
         * @param production the productions being rewritten
         */
        parseBoolOp(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.BoolOp, production, Production.BoolOp, false)) {
                // Ascend tree after BoolOp is derived
                this.cst.ascendTree();

                return true;
            } else {
                this.log.push(DEBUG + " - " + PARSER + " - " + ERROR + ": "
                    + ErrorType.BoolOpExpected + " - found [ "
                    + this.tokens[this.currentTokenIndex].type + ", "
                    + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " ) - "
                    + Production.Expr + " ::== == | !=");
                this.error = true;
                this.errors++;

                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a Space, or a " "
         * @param production the productions being rewritten
         */
        parseSpace(production: Array<Production>): boolean {
            if (this.matchAndConsumeToken(TokenType.Space, production, Production.Space, false)) {
                // Ascend tree after Space is derived
                this.cst.ascendTree();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Parses the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
         * @param production the productions being rewritten
         */
        parseCharList(production: Array<Production>): boolean {
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
                this.log.push(DEBUG + " - " + PARSER + " - VALID: " + Production.Epsilon
                    + " found at ( " + this.tokens[this.currentTokenIndex].lineNum + ":"
                    + this.tokens[this.currentTokenIndex].colNum + " )");

                return true;
            }
        }

        /**
         * Matches and consumes a passed token type.
         * If the next token we're looking at matches to a terminal symbol, 
         * consume token and advance the current token. If error, break out of parse
         * Logs appropriate productions that are being derived and adds appropriate 
         * productions to the CST. Token is expected to be present based on boolean 
         * value passed. If the token is not present, return an error.
         * @param token the token that is being matched and consumed
         * @param start productions that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        matchAndConsumeToken(token: TokenType,
                             start: Array<Production>,
                             rewrite: Production,
                             expected: boolean): boolean {
            if (this.tokens[this.currentTokenIndex].type == token) {
                // If rewriting from a non-terminal to a terminal, add to tree and log
                if (start != null && start.length != 0) {
                    // Add all productions in start
                    for (let i = 0; i < start.length; i++) {
                        this.cst.addNTNode(start[i], this.tokens[this.currentTokenIndex].lineNum,
                            this.tokens[this.currentTokenIndex].colNum);
                        if (i != 0) {
                            this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ "
                                + start[i - 1] + " ], found [ " + start[i] + " ] at ( "
                                + this.tokens[this.currentTokenIndex].lineNum + " : "
                                + this.tokens[this.currentTokenIndex].colNum + " )");
                        }
                    }
                    // Add final production that was rewritten.
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum,
                        this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ "
                        + start[start.length - 1] + " ], found [ " + rewrite + " ] at ( "
                        + this.tokens[this.currentTokenIndex].lineNum + " : "
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                } // If rewriting to some non-terminal only, display it in tree and log
                else if (rewrite != null) {
                    this.cst.addNTNode(rewrite, this.tokens[this.currentTokenIndex].lineNum,
                        this.tokens[this.currentTokenIndex].colNum);
                    this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ "
                        + rewrite + " ], found [ " + rewrite + " ] at ( "
                        + this.tokens[this.currentTokenIndex].lineNum + " : "
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                }
                // Add terminal to log
                this.log.push(DEBUG + " - " + PARSER + " - " + "VALID - Expecting [ " + token
                    + " ], found [ " + this.tokens[this.currentTokenIndex].value + " ] at ( "
                    + this.tokens[this.currentTokenIndex].lineNum + " : "
                    + this.tokens[this.currentTokenIndex].colNum + " )");
                // Add token to tree
                this.cst.addTNode(this.tokens[this.currentTokenIndex],
                                  this.tokens[this.currentTokenIndex].lineNum,
                                  this.tokens[this.currentTokenIndex].colNum);
                // Consume token
                this.currentTokenIndex++;

                return true;
            } else {
                // If token was expected and was not present, throw an error
                if (expected) {
                    this.log.push(DEBUG + " - " + PARSER + " - " + ERROR + ": "
                        + ErrorType.TExpected + " [ " + Production.Expr + " ] "
                        +  " - found [ " + this.tokens[this.currentTokenIndex].type + ", "
                        + this.tokens[this.currentTokenIndex].value + " ] at ( "
                        + this.tokens[this.currentTokenIndex].lineNum + ":"
                        + this.tokens[this.currentTokenIndex].colNum + " )");
                    this.error = true;
                    this.errors++;
                }
            }

            return false;
        }
    }
}
