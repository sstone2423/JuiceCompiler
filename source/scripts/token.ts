///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export enum TokenType {

        // Lexer tokens
        T_ID = "Id",
        T_LBRACE = "LBrace",
        T_RBRACE = "RBrace",
        T_EOP = "EOP",
        T_DIGIT = "Digit",
        T_INTOP = "IntOp",
        T_BOOLVAL = "BoolVal",
        T_TYPE = "Type",
        T_ASSIGN = "Assign",
        T_BOOLOP = "BoolOp",
        T_WHILE = "While",
        T_IF = "If",
        T_PRINT = "Print",
        T_RPAREN = "RParen",
        T_LPAREN = "LParen",
        T_QUOTE = "Quote",
        T_CHAR = "Char",
        T_SPACE = "Space",
        T_STRING = "String",
        T_ADDITION = "Addition",
        T_EQUALS = "Equals",
        T_NOTEQUALS = "NotEquals",

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