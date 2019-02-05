///<reference path="globals.ts" />
/* 
    token.ts  
*/

module JuiceC {

    export enum TokenType {

        TID = "TID",
        TLBRACE = "TLBRACE",
        TRBRACE = "TRBRACE",
        TEOP = "TEOP",
        TDIGIT = "TDIGIT",
        TINTOP = "TINTOP",
        TBOOLVAL = "TBOOLVAL",
        TTYPE = "TTYPE",
        TASSIGN = "TASSIGN",
        TBOOLOP = "TBOOLOP",
        TWHILE = "TWHILE",
        TIF = "TIF",
        TPRINT = "TPRINT",
        TRPAREN = "TRPAREN",
        TLPAREN = "TLPAREN",
        TQUOTE = "TQUOTE",
        TCHAR = "TCHAR",
        TSPACE = "TSPACE",
        TSTRING = "STRING",
        TADDITION = "ADDITION",
        TEQUALS = "EQUALS",
        TNOTEQUALS = "NOTEQUALS"

    }

	export class Token {

        type: string;
        value: any;
        lineNumber: number;
        colNumber: number;
        
        constructor (tokenType: TokenType, value: any, lineNumber: number, colNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }

    }

}