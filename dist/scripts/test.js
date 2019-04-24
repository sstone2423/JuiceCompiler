/*
    test.ts
*/
var JuiceC;
(function (JuiceC) {
    var Test = /** @class */ (function () {
        function Test() {
        }
        Test.simpleTest1 = function () {
            document.getElementById("sourceCode").value = "/* This is a simple program with no operations */\n{}$";
        };
        Test.simpleTest2 = function () {
            document.getElementById("sourceCode").value = "/* Test case for print statement */\n{\n    print(\"i love compilers\")\n}$";
        };
        Test.fullProgram = function () {
            document.getElementById("sourceCode").value = "/* Test case for a 'regular' program*/\n{\n    int a\n    a = 1\n    print(a)\n    boolean b\n    b = true\n    print(b)\n    {\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        int a\n        a = 3\n        print(a)\n    }\n    string s\n    s = \"stra\"\n    print(s)\n    s = \"strb\"\n    print(s)\n    if (a != 5) {\n        print(\"true\")\n    }\n    if (a == 5) {\n        print(\"false\")\n    }\n}$";
        };
        Test.multiplePrograms = function () {
            document.getElementById("sourceCode").value = "/* Test case for multiple programs */\n{\n    print(\"i love compilers\")\n    int a\n    a = 2\n    string s\n    s = \"ha\"\n}$\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}$";
        };
        Test.crazyOneLiner = function () {
            document.getElementById("sourceCode").value = "/* Test case for crazy one liner */\n+${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$";
        };
        Test.whileStatement = function () {
            document.getElementById("sourceCode").value = "/* Test case for WhileStatement */\n{\n    string s\n    int a\n    a = 1\n    {\n        s = \"hey there\"\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        while (a != 5) {\n            a = 1 + a\n            print(a)\n        }\n        print(3 + a)\n        print(s)\n    }\n} $";
        };
        Test.ifStatement = function () {
            document.getElementById("sourceCode").value = "/* Test case for IfStatement */\n{\n    int a\n    a = 1\n    if(1 == 1){\n        print(\"nums\")\n    }\n    if(a == a){\n        print(\"ids\")\n    }\n    if(\"hey\" == \"hey\"){\n        print(\"strings\")\n    }\n    if(true == (a == a)){\n        print(\"booleans\")\n    }\n} $";
        };
        Test.missingEOP = function () {
            document.getElementById("sourceCode").value = "/* Missing EOP */\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}";
        };
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
        Test.tienTest = function () {
            document.getElementById("sourceCode").value = "/* Thx Tien. */       \n{\nint a\na = 0\nstring z\nz = \"bond\"\nwhile (a != 9) {\nif (a != 5) {\nprint(\"bond\")\n}\n{\na = 1 + a\nstring b\nb = \"james bond\"\nprint(b)\n}\n}\n{/*Holy Hell This is Disgusting*/}\nboolean c\nc = true\nboolean d\nd = (true == (true == false))\nd = (a == b)\nd = (1 == a)\nd = (1 != 1)\nd = (\"string\" == 1)\nd = (a != \"string\")\nd = (\"string\" != \"string\")\nif (d == true) {\nint c\nc = 1 + d\nif (c == 1) {\nprint(\"ugh\")\n}\n}\nwhile (\"string\" == a) {\nwhile (1 == true) {\na = 1 + \"string\"\n}\n}\n}$";
        };
        Test.tienBooleanHell = function () {
            document.getElementById("sourceCode").value = "/* Thanks Tien. Assuming you get past Boolean Hell\n- there is a boolean being compared to\n- a string which will cause a type error */\n{\nint a\na = 4\nboolean b\nb = true\nboolean c\nstring d\nd = \"there is no spoon\"\nc = (d != \"there is a spoon\")\nif(c == (false != (b == (true == (a == 3+1))))) {\nprint((b != d))\n}\n}$";
        };
        Test.initButNotUsed = function () {
            document.getElementById("sourceCode").value = "/* Variable initialized but not used. Produces semantic warning*/\n{    \n    int a\n    int b\n    b = 2\n    print(b)\n}$";
        };
        return Test;
    }());
    JuiceC.Test = Test;
})(JuiceC || (JuiceC = {}));
