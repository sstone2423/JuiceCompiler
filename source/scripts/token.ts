///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export enum TokenType {

        T_ID = "TID",
        T_LBRACE = "TLBRACE",
        T_RBRACE = "TRBRACE",
        T_EOP = "TEOP",
        T_DIGIT = "TDIGIT",
        T_INTOP = "TINTOP",
        T_BOOLVAL = "TBOOLVAL",
        T_TYPE = "TTYPE",
        T_ASSIGN = "TASSIGN",
        T_BOOLOP = "TBOOLOP",
        T_WHILE = "TWHILE",
        T_IF = "TIF",
        T_PRINT = "TPRINT",
        T_RPAREN = "TRPAREN",
        T_LPAREN = "TLPAREN",
        T_QUOTE = "TQUOTE",
        T_CHAR = "TCHAR",
        T_SPACE = "TSPACE",
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