///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export const enum TokenType {

        // Lexer tokens
        Id = "Id",
        LBrace = "LBrace",
        RBrace = "RBrace",
        EOP = "EOP",
        Digit = "Digit",
        IntOp = "IntOp",
        BoolVal = "BoolVal",
        Type = "Type",
        Assign = "Assign",
        BoolOp = "BoolOp",
        While = "While",
        If = "If",
        Print = "Print",
        RParen = "RParen",
        LParen = "LParen",
        Quote = "Quote",
        Char = "Char",
        Space = "Space",
        String = "String",
        Addition = "Addition",
        Equals = "Equals",
        NotEquals = "NotEquals",

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