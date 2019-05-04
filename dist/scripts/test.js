/**
 * test.ts
 *
 * Provides sample tests for each section of the compiler. The goal is to have 100%
 * coverage. Contains passing and failing tests for each section (Lexer, Parser, Semantic,
 * Code Gen)
 *  */
var JuiceC;
(function (JuiceC) {
    var Test = /** @class */ (function () {
        function Test() {
        }
        /* ----------------------------------
            Passing Tests
        ----------------------------------- */
        Test.simpleTest1 = function () {
            document.getElementById("sourceCode").value = "/* This is a simple program with no operations */\n{}$";
        };
        Test.simpleTest2 = function () {
            document.getElementById("sourceCode").value = "/* Test case for print statement */\n{\n    print(\"i love compilers\")\n}$";
        };
        Test.fullProgram = function () {
            document.getElementById("sourceCode").value = "/* Test case for a 'regular' program. Prints 1true23strastrbtrue */\n{\n    int a\n    a = 1\n    print(a)\n    boolean b\n    b = true\n    print(b)\n    {\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        int a\n        a = 3\n        print(a)\n    }\n    string s\n    s = \"stra\"\n    print(s)\n    s = \"strb\"\n    print(s)\n    if (a != 5) {\n        print(\"true\")\n    }\n    if (a == 5) {\n        print(\"false\")\n    }\n}$";
        };
        Test.multiplePrograms = function () {
            document.getElementById("sourceCode").value = "/* Test case for multiple programs */\n{\n    print(\"i love compilers\")\n    int a\n    a = 2\n    string s\n    s = \"ha\"\n}$\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}$";
        };
        Test.crazyOneLiner = function () {
            document.getElementById("sourceCode").value = "/* Test case for crazy one liner */\n+${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$";
        };
        Test.whileStatement = function () {
            document.getElementById("sourceCode").value = "/* Test case for WhileStatement. Prints 23458 */\n{\n    int a\n    a = 1\n    {\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        while (a != 5) {\n            a = 1 + a\n            print(a)\n        }\n        print(3 + a)\n    }\n} $";
        };
        Test.ifStatement = function () {
            document.getElementById("sourceCode").value = "/* Test case for IfStatement. Prints numsidsstringsbooleans */\n{\n    int a\n    a = 1\n    if(1 == 1){\n        print(\"nums\")\n    }\n    if(a == a){\n        print(\"ids\")\n    }\n    if(\"hey\" == \"hey\"){\n        print(\"strings\")\n    }\n    if(true == true){\n        print(\"booleans\")\n    }\n} $";
        };
        Test.missingEOP = function () {
            document.getElementById("sourceCode").value = "/* Missing EOP */\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}";
        };
        Test.infiniteLoopMaxMemory = function () {
            document.getElementById("sourceCode").value = "/* This code segment uses the max\n- allotted memory 256 bytes \n- Also this is an infinite loop. Credit: Tien */\n{\nint a\na = 1\nif(\"a\" == \"a\") {\na = 2\nprint(\"a now is two\")\n}\nif(a != 1) {\na = 3\nprint(\" a now is three\")\n}\nif(a == 1) {\na = 3\nprint(\"this does not print\")\n}\n\nwhile true {\nprint(\" this will always be true hahahahahahaha\")\n}\n\nif false {\nprint(\"this\")\n}\n} $";
        };
        Test.booleanExpressions = function () {
            document.getElementById("sourceCode").value = "/* Boolean Expr Printing: This test case\n- demonstrates the compiler's ability to\n- generate code for computing the result\n- of a BooeleanExpr and printing the result\n- Result: falsefalsetruetruetruetruefalsefalsefalsetrue \n- Credit: Tien */\n{\nboolean a\na = false\nprint((a == true))\nprint((true == a))\nprint((a == false))\nprint((false == a))\nprint((a != true))\nprint((true != a))\nprint((a != false))\nprint((false != a))\nprint(a)\nif (a == false) {\na = true\n}\nprint(a)\n}$";
        };
        Test.variableAddition = function () {
            document.getElementById("sourceCode").value = "/*\nDemonstrates compiler's ability to generate code that properly handles variable addition\nCredit: Tien\n*/\n{\nint a\na = 1\nint b\nb = 1\nb = 1 + a\nwhile (2 + a != 3 + b) {\na = 1 + a\nprint(\"int a is \")\nprint(a)\nprint(\" \")\n}\nprint(\"int b is \")\nprint(b)\n}$";
        };
        Test.longAddition = function () {
            document.getElementById("sourceCode").value = "/* This statement shows that addition\n- checking and printing are both valid\n- options that can be performed. Credit: Tien\n- Result: 666addition checkfalse*/\n{\nint a\nwhile (a != 3) {\nprint(1 + 2 + 3)\na = 1 + a\n}\nif (1+1+1+1+1 == 2+3) {\nprint(\"addition check\")\n}\nif (1+5+3 != 8) {\nprint(false)\n}\n} $";
        };
        /* ------------------------------------
            Failing Tests
        -------------------------------------- */
        /* -----------------------------------
            Lexer
        ---------------------------------------*/
        Test.alan = function () {
            document.getElementById("sourceCode").value = "/*  Provided By \n    - Compiler Tyrant\n    - Alan G Labouseur\n    - Program 1: Pass Lex, Parse, Semantic\n    - Program 2: Pass Lex, Parse, Semantic\n    - Program 3: Pass Lex, fail parse\n    - Program 4: Fail Lex\n*/\n{}$\t\n{{{{{{}}}}}}$\t\n{{{{{{}}}}}}}$\t\n{int\t@}$";
        };
        Test.typeInsideString = function () {
            document.getElementById("sourceCode").value = "/*  Type inside of a String */\n{\t\n    boolean d\n    d = (\"string\") != \"string\")\t\n}$";
        };
        Test.EOPinsideString = function () {
            document.getElementById("sourceCode").value = "/*  EOP inside of a String */\n{\"$\"} $";
        };
        Test.unterminatedComment = function () {
            document.getElementById("sourceCode").value = "/*  Unterminated Comment */\n{ int a /* unterminated comment }$";
        };
        Test.unterminatedString = function () {
            document.getElementById("sourceCode").value = "/*  Unterminated String */\n{ a = \"unterminated string }$";
        };
        Test.extraRightBrace = function () {
            document.getElementById("sourceCode").value = "/*  Extra Right Brace */\n{{{{{{}}} /* comments are ignored */ }}}}$";
        };
        /* -----------------------------------
            Parser
        ------------------------------------- */
        Test.invalidStatementList = function () {
            document.getElementById("sourceCode").value = "/* Test case for invalid StatementList */\n{\n4 + 2\n}$";
        };
        Test.invalidExpr = function () {
            document.getElementById("sourceCode").value = "/* Test case for invalid Expr */\n{\nint a\na = a + 2\n}$";
        };
        Test.invalidVarDecl = function () {
            document.getElementById("sourceCode").value = "/* Test case for invalid VarDecl */\n{\nint 4\n}$";
        };
        Test.invalidPrint = function () {
            document.getElementById("sourceCode").value = "/* Test case for invalid Print pt. 2 */\n{\nprint(\"$)\n}$";
        };
        Test.incompleteBoolExpr = function () {
            document.getElementById("sourceCode").value = "/* Test case for incomplete BooleanExpr */\n{\ns = \"strb\"\nprint(s)\n\nif (a != ) {\nprint(\"true\")\n}\n}$";
        };
        Test.incompleteIntExpr = function () {
            document.getElementById("sourceCode").value = "/* Test case for incomplete IntExpr */\n{\nint a\na = 1 +\nprint(a)\n}$";
        };
        /* --------------------------------------
            Semantic Analysis
        --------------------------------------- */
        Test.semanticWarnings = function () {
            document.getElementById("sourceCode").value = "/* Has unused and undeclared variables */\n{\n  int a\n  int b\n  a = 3\n  b = 4\n  {\n    string a\n    a = \"hey\"\n    print(a)\n    print(b)\n  }\n  print(b)\n  string s\n  {\n    boolean b\n    b = false\n  }\n  string r\n  r = \"hey\"\n  int d\n  print(d)\n  d = 3\n}$";
        };
        Test.undeclaredVar = function () {
            document.getElementById("sourceCode").value = "/* Variables being used but not declared first */\n{\nint a\nb = 4\n}$";
        };
        Test.duplicateVar = function () {
            document.getElementById("sourceCode").value = "/* Variables being declared again in same scope*/\n{\nint a\n{\nstring a\na = \"this is fine\"\n}\nboolean a /* this is not fine\" */\n}$";
        };
        Test.typeMismatch = function () {
            document.getElementById("sourceCode").value = "/* A variable's type is not compatible with its assignment*/\n{\nstring s\ns = 4 + 3\n}$";
        };
        Test.incorrectTypeCompar = function () {
            document.getElementById("sourceCode").value = "/* Types do not match in Boolean comparison*/\n{\nif(4 == false){\nprint(\"this no good\")\n}\nif(4 == \"hey\"){\nprint(\"int to string\")\n}\nif(false != \"hey\"){\nprint(\"bool to string\")\n}\nif(4 != 3){\nprint(\"int to int\")\n}\n}$";
        };
        Test.incorrectIntExpr = function () {
            document.getElementById("sourceCode").value = "/* A digit is added to something other than a digit */\n{\nint a\na = 4 + false\n}$";
        };
        Test.initButNotUsed = function () {
            document.getElementById("sourceCode").value = "/* Variable initialized but not used. Produces semantic warning*/\n{    \n    int a\n    int b\n    b = 2\n    print(b)\n}$";
        };
        /* --------------------------------
            Code Generation
        --------------------------------- */
        Test.booleanHell = function () {
            document.getElementById("sourceCode").value = "/* This test case is included because it completely messed\n- up my AST with boolean hell and keeping track of boolexpr\n- may it serve as a good benchmark for those who come after \n- CREDIT: TIEN */\n{\nint a\na = 0\nboolean b\nb = false\nboolean c\nc = true\nwhile(((a!=9) == (\"test\" != \"alan\")) == ((5==5) != (b == c))) {\nprint(\"a\")\nstring d\nd = \"yes\"\nprint(d)\n{\n    int a\n    a = 5\n}\n}\n}$";
        };
        Test.maxMemory = function () {
            document.getElementById("sourceCode").value = "/* Valid code but can't fit into 256 bytes */\n{\nint a\nint b\nint c\nint d\na = 2\n{\nb = 5\nprint(b)\na = 1 + a\n{\n    print(a)\n    a = 5\n}\nif(a == b) {\n    print(\"wowza\")\n}\nint d\nd = 5\n{\n    string d\n    d = \"hey\"\n    print(d)\n    d = \"sap\"\n    print(d)\n}\nprint(d)\n}\nc = 4\nprint(c)\nwhile (c != 7) {\nc = 1 + 1 + 1 + c\nprint(c)\n}\nc = 9 + c\nprint(c)\n}$";
        };
        Test.stackOverflow = function () {
            document.getElementById("sourceCode").value = "/* Stack Overflow */\n{\nint a\na = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1\n}$";
        };
        Test.heapOverflow = function () {
            document.getElementById("sourceCode").value = "/* Heap Overflow */\n{\nstring a\na = \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"\n}$";
        };
        return Test;
    }());
    JuiceC.Test = Test;
})(JuiceC || (JuiceC = {}));
