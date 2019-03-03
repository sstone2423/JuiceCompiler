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
            document.getElementById("sourceCode").value = "/* Test case for WhileStatement */\n{\n    string s\n    int a\n    a = 1\n    {\n        s = \"hey there sexy\"\n        int a\n        a = 2\n        print(a)\n    }\n    {\n        while (a != 5) {\n            a = 1 + a\n            print(a)\n        }\n        print(3 + a)\n        print(s)\n    }\n} $";
        };
        Test.ifStatement = function () {
            document.getElementById("sourceCode").value = "/* Test case for IfStatement */\n{\n    int a\n    a = 1\n    if(1 == 1){\n        print(\"nums\")\n    }\n    if(a == a){\n        print(\"ids\")\n    }\n    if(\"hey\" == \"hey\"){\n        print(\"strings\")\n    }\n    if(true == (a == a)){\n        print(\"booleans\")\n    }\n} $";
        };
        Test.missingEOP = function () {
            document.getElementById("sourceCode").value = "/* Missing EOP */\n{\n    int b\n    b = 4\n    string s\n    s = \"hey\"\n}";
        };
        Test.alan = function () {
            document.getElementById("sourceCode").value = "/*  Provided By \n    - Compiler Tyrant\n    - Alan G Labouseur\n*/\n{}$\t\n{{{{{{}}}}}}$\t\n{{{{{{}}}}}}}$\t\n{int\t@}$";
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
        return Test;
    }());
    JuiceC.Test = Test;
})(JuiceC || (JuiceC = {}));
