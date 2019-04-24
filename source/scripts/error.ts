///<reference path="globals.ts" />
/* 
    error.ts

    Error class for the Lexer and Parser that contain the Error Type, Value that was given instead of the one that was expected,
    and the Line number and Column number of the error instance.
*/

module JuiceC {

    export const enum ErrorType {

        // Lexer errors
        NO_END_QUOTE = "No End Quote in string literal",
        NO_END_COMMENT = "No End Comment",
        INVALID_T = "Invalid Token",
        INVALID_T_STRING = "Invalid Token in string literal",
        INVALID_T_COMMENT = "Invalid Token in Comment",
        INVALID_NEW_LINE = "Invalid New Line",

        // Parser errors
        BLOCK_EXPECTED = "Block Expected",
        PRINT_EXPECTED = "Print Statement Expected",
        ASSIGNMENT_EXPECTED = "Assignment Statement Expected",
        VAR_DECL_EXPECTED = "Variable Declaration Expected",
        IF_EXPECTED = "If Statement Expected",
        WHILE_EXPECTED = "While Statement Expected",
        EXPR_EXPECTED = "Expression Expected",
        INT_EXPR_EXPECTED = "Integer Expression Expected",
        STRING_EXPR_EXPECTED = "String Expression Expected",
        BOOL_EXPR_EXPECTED = "Boolean Expression Expected",
        BOOL_VAL_EXPECTED = "Boolean Value Expected",
        ID_EXPECTED = "ID Expected",
        TYPE_EXPECTED = "Type Expected",
        CHAR_EXPECTED = "Character Expected",
        DIGIT_EXPECTED = "Digit Expected",
        INT_OP_EXPECTED = "Integer Operation Expected",
        BOOL_OP_EXPECTED = "Boolean Operation Expected",
        SPACE_EXPECTED = "Space Expected",
        TOKEN_EXPECTED = "Token Expected",

        // Semantic Errors
        DUPLICATE_VARIABLE = "Duplicate Variable",
        TYPE_MISMATCH = "Type Mismatch",
        UNDECLARED_VARIABLE = "Undeclared Variable",
        INCORRECT_INT_EXPR = "Incorrect Integer Expression",
        INCORRECT_TYPE_COMPAR = "Incorrect Type Comparison"

    }

	export class Error {

        errorType: string;
        value: any;
        lineNum: number;
        colNum: number;
        expectedToken: TokenType;

        constructor (errorType: string, value: any, lineNum: number, colNum: number, expectedToken?: TokenType) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.expectedToken = expectedToken;
        }
    }

}