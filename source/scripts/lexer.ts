///<reference path="globals.ts" />
/* 
	lexer.ts  
*/

module JuiceC {

	export class Lexer {

		public lex(): string {
		    // Grab the "raw" source code.
		    let sourceCode = (<HTMLInputElement>document.getElementById("sourceCode")).value;
		    // Trim the leading and trailing spaces.
		    sourceCode = JuiceC.Utils.trim(sourceCode);
		    // TODO: remove all spaces in the middle; remove line breaks too.
		    return sourceCode;
		}

	}
}
