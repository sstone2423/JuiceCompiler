///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export enum TokenType {

        T_ID = "ID",
        T_LBRACE = "LBRACE",
        T_RBRACE = "RBRACE",
        T_EOP = "EOP",
        T_DIGIT = "DIGIT",
        T_INTOP = "INTOP",
        T_BOOLVAL = "BOOLVAL",
        T_TYPE = "TYPE",
        T_ASSIGN = "ASSIGN",
        T_BOOLOP = "BOOLOP",
        T_WHILE = "WHILE",
        T_IF = "IF",
        T_PRINT = "PRINT",
        T_RPAREN = "RPAREN",
        T_LPAREN = "LPAREN",
        T_QUOTE = "QUOTE",
        T_CHAR = "CHAR",
        T_SPACE = "SPACE",
        T_STRING = "STRING",
        T_ADDITION = "ADDITION",
        T_EQUALS = "EQUALS",
        T_NOTEQUALS = "NOTEQUALS"

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