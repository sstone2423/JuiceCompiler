///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export enum TokenType {

        // Lexer tokens
        ID = "Id",
        LBRACE = "LBrace",
        RBRACE = "RBrace",
        EOP = "EOP",
        DIGIT = "Digit",
        INTOP = "IntOp",
        BOOLVAL = "BoolVal",
        TYPE = "Type",
        ASSIGN = "Assign",
        BOOLOP = "BoolOp",
        WHILE = "While",
        IF = "If",
        PRINT = "Print",
        RPAREN = "RParen",
        LPAREN = "LParen",
        QUOTE = "Quote",
        CHAR = "Char",
        SPACE = "Space",
        STRING = "String",
        ADDITION = "Addition",
        EQUALS = "Equals",
        NOTEQUALS = "NotEquals",

    }

	export class Token {

        type: string;
        value: any;
        lineNum: number;
        colNum: number;
        
        constructor (tokenType: TokenType, value: any, lineNum: number, colNum: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNum = lineNum;
            this.colNum = colNum;
        }

    }

}