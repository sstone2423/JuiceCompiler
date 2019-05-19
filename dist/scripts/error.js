///<reference path="globals.ts" />
/**
 *  error.ts
 *
 *  Error class that contains the Error Type, Value that was given instead
 *  of the one that was expected, and the Line number and Column number
 *  of the error instance. Error Type string constants are located
 *  here as well
 */
var JuiceC;
(function (JuiceC) {
    var Error = /** @class */ (function () {
        function Error(errorType, value, lineNum, colNum, expectedToken) {
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
        Error.logUnknownError = function (section, log) {
            log.push(DEBUG + " - " + section + " - " + ERROR + " - Unknown Error has occured");
            return log;
        };
        return Error;
    }());
    JuiceC.Error = Error;
})(JuiceC || (JuiceC = {}));
