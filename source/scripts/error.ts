///<reference path="globals.ts" />
/**
 *  error.ts
 * 
 *  Error class that contains the Error Type, Value that was given instead 
 *  of the one that was expected, and the Line number and Column number
 *  of the error instance. Error Type string constants are located
 *  here as well
 */

module JuiceC {
    export const enum ErrorType {
        // Lexer errors
        NoEndQuote = "Missing End Quote in string literal",
        NoEndComment = "Missing End Comment",
        InvalidT = "Invalid Token",
        InvalidTInStr = "Invalid Token in string literal",
        InvalidTInComm = "Invalid Token in Comment",
        InvalidNewLine = "Invalid New Line",

        // Parser errors
        BlockExpected = "Block Expected",
        PrintExpected = "Print Statement Expected",
        AssignExpected = "Assignment Statement Expected",
        VarDeclExpected = "Variable Declaration Expected",
        IfExpected = "If Statement Expected",
        WhileExpected = "While Statement Expected",
        ExprExpected = "Expression Expected",
        IntExprExpected = "Integer Expression Expected",
        StrExprExpected = "String Expression Expected",
        BoolExprExpected = "Boolean Expression Expected",
        BoolValExpected = "Boolean Value Expected",
        IdExpected = "ID Expected",
        TypeExpected = "Type Expected",
        CharExpected = "Character Expected",
        DigitExpected = "Digit Expected",
        IntOpExpected = "Integer Operation Expected",
        BoolOpExpected = "Boolean Operation Expected",
        SpaceExpected = "Space Expected",
        TExpected = "Token Expected",

        // Semantic Errors
        DupVar = "Duplicate Variable",
        TypeMismatch = "Type Mismatch",
        UndeclaredVar = "Undeclared Variable",
        IncorrectIntExpr = "Incorrect Integer Expression",
        IncorrectTypeCompar = "Incorrect Type Comparison",

        // CodeGen Errors
        ExceedMemLimit = "Exceeded Memory Limit",
        ExceedStackLimit = "Exceeded Stack Memory Limit",
        ExceedHeapLimit = "Exceeded Heap Memory Limit",
        ExceedStaticLimit = "Exceeded Static Variable Memory Limit",
        NestedBoolean = "Nested Boolean"
    }

    export class Error {
        errorType: string;
        value: any;
        lineNum: number;
        colNum: number;
        expectedToken: TokenType;

        constructor (errorType: string,
                    value: any,
                    lineNum: number,
                    colNum: number,
                    expectedToken?: TokenType) {
            this.errorType = errorType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
            this.expectedToken = expectedToken;
        }

        /**
         * Helper function for logging unknown errors
         * @param section refers to Lexer, Parser, Semantic, or CodeGen
         * @param log the section's log
         */
        static logUnknownError(section: string, log: Array<string>): Array<string> {
            log.push(DEBUG + " - " + section + " - " + ERROR + " - Unknown Error has occured");

            return log;
        }
    }
}
