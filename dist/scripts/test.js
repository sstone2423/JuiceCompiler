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
            document.getElementById("sourceCode").value = "/* Test case for print statement */\n                {\n                print(\"i love compilers\")\n                }$";
        };
        Test.fullProgram = function () {
            document.getElementById("sourceCode").value = "/* Test case for a 'regular' program*/\n                {\n                int a\n                a = 1\n                print(a)\n                boolean b\n                b = true\n                print(b)\n                {\n                    int a\n                    a = 2\n                    print(a)\n                }\n                {\n                    int a\n                    a = 3\n                    print(a)\n                }\n                string s\n                s = \"stra\"\n                print(s)\n                s = \"strb\"\n                print(s)\n                if (a != 5) {\n                    print(\"true\")\n                }\n                if (a == 5) {\n                    print(\"false\")\n                }\n                }$";
        };
        Test.multiplePrograms = function () {
            document.getElementById("sourceCode").value = "/* Test case for multiple programs */\n                {\n                print(\"i love compilers\")\n                int a\n                a = 2\n                string s\n                s = \"ha\"\n                }$\n                {\n                int b\n                b = 4\n                string s\n                s = \"hey\"\n                }$";
        };
        return Test;
    }());
    JuiceC.Test = Test;
})(JuiceC || (JuiceC = {}));
