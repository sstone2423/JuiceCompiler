///<reference path="globals.ts" />
/* 
    error.ts

    Error class for the Lexer and Parser that contain the Error Type, Value that was given instead of the one that was expected,
    and the Line number and Column number of the error instance.
*/

module JuiceC {

    export const enum ErrorType {

        // Lexer errors
        E_NO_END_QUOTE = "No End Quote",
        E_NO_END_COMMENT = "No End Comment",
        E_INVALID_T = "Invalid Token",
        E_INVALID_T_STRING = "Invalid Token in String",
        E_INVALID_T_COMMENT = "Invalid Token in Comment",
        E_INVALID_NEW_LINE = "Invalid New Line",

        // Parser errors
        E_BLOCK_EXPECTED = "Block Expected",
        E_PRINT_EXPECTED = "Print Statement Expected",
        E_ASSIGNMENT_EXPECTED = "Assignment Statement Expected",
        E_VAR_DECL_EXPECTED = "Variable Declaration Expected",
        E_IF_EXPECTED = "If Statement Expected",
        E_WHILE_EXPECTED = "While Statement Expected",
        E_EXPR_EXPECTED = "Expression Expected",
        E_INT_EXPR_EXPECTED = "Integer Expression Expected",
        E_STRING_EXPR_EXPECTED = "String Expression Expected",
        E_BOOL_EXPR_EXPECTED = "Boolean Expression Expected",
        E_BOOL_VAL_EXPECTED = "Boolean Value Expected",
        E_ID_EXPECTED = "ID Expected",
        E_TYPE_EXPECTED = "Type Expected",
        E_CHAR_EXPECTED = "Character Expected",
        E_DIGIT_EXPECTED = "Digit Expected",
        E_INT_OP_EXPECTED = "Integer Operation Expected",
        E_BOOL_OP_EXPECTED = "Boolean Operation Expected",
        E_SPACE_EXPECTED = "Space Expected",
        E_TOKEN_EXPECTED = "Token Expected"

    }

	export class Error {

        errorType: string;
        value: any;
        lineNum: number;
        colNum: number;

        constructor (errorType: string, value: any, lineNum: number, colNum: number) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }
    }

}