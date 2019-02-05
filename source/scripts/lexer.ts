///<reference path="globals.ts" />
/* 
	lexer.ts  
*/

module JuiceC {

	export class Lexer {

		// Token array
		tokens = [];
		// Error array
		errors = [];
		// Warning array
		warnings = [];
		// Pointers that indicate which characters are being matched
		startPtr: number = 0;
		endPtr: number = 1;
		// Initialize to first line and first column
		currentLineNum: number = 1;
		currentColNum: number = 0;

		constructor() { }

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
