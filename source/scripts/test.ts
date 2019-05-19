/**
 * test.ts  
 * 
 * Provides sample tests for each section of the compiler. The goal is to have 100% 
 * coverage. Contains passing and failing tests for each section (Lexer, Parser, Semantic,
 * Code Gen)
 */

module JuiceC {
    export class Test {
        /* ----------------------------------
            Passing Tests
        ----------------------------------- */

        static simpleTest1(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This is a simple program with no operations */
{}$`;
        }

        static simpleTest2(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for print statement */
{
    print("i love compilers")
}$`;
        }

        static fullProgram(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for a 'regular' program. Prints 1true23strastrbtrue */
{
    int a
    a = 1
    print(a)
    boolean b
    b = true
    print(b)
    {
        int a
        a = 2
        print(a)
    }
    {
        int a
        a = 3
        print(a)
    }
    string s
    s = "stra"
    print(s)
    s = "strb"
    print(s)
    if (a != 5) {
        print("true")
    }
    if (a == 5) {
        print("false")
    }
}$`;
        }

        static multiplePrograms(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for multiple programs */
{
    print("i love compilers")
    int a
    a = 2
    string s
    s = "ha"
}$
{
    int b
    b = 4
    string s
    s = "hey"
}$`;
        }

        static crazyOneLiner(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for crazy one liner */\n+\${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$`;
        }

        static whileStatement(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for WhileStatement. Prints 23458 */
{
    int a
    a = 1
    {
        int a
        a = 2
        print(a)
    }
    {
        while (a != 5) {
            a = 1 + a
            print(a)
        }
        print(3 + a)
    }
} $`;
        }

        static ifStatement(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for IfStatement. Prints numsidsstringsbooleans */
{
    int a
    a = 1
    if(1 == 1){
        print("nums")
    }
    if(a == a){
        print("ids")
    }
    if("hey" == "hey"){
        print("strings")
    }
    if(true == true){
        print("booleans")
    }
} $`;
        }

        static missingEOP(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Missing EOP */
{
    int b
    b = 4
    string s
    s = "hey"
}`;
        }

        static infiniteLoopMaxMemory(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This code segment uses the max
- allotted memory 256 bytes
- Also this is an infinite loop. Credit: Tien */
{
int a
a = 1
if("a" == "a") {
a = 2
print("a now is two")
}
if(a != 1) {
a = 3
print(" a now is three")
}
if(a == 1) {
a = 3
print("this does not print")
}

while true {
print(" this will always be true hahahahahahaha")
}

if false {
print("this")
}
} $`;
        }

        static booleanExpressions(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Boolean Expr Printing: This test case
- demonstrates the compiler's ability to
- generate code for computing the result
- of a BooeleanExpr and printing the result
- Result: falsefalsetruetruetruetruefalsefalsefalsetrue
- Credit: Tien */
{
boolean a
a = false
print((a == true))
print((true == a))
print((a == false))
print((false == a))
print((a != true))
print((true != a))
print((a != false))
print((false != a))
print(a)
if (a == false) {
a = true
}
print(a)
}$`;
        }

        static variableAddition(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*
Demonstrates compiler's ability to generate code that properly handles variable addition
Credit: Tien
*/
{
int a
a = 1
int b
b = 1
b = 1 + a
while (2 + a != 3 + b) {
a = 1 + a
print("int a is ")
print(a)
print(" ")
}
print("int b is ")
print(b)
}$`;
        }

        static longAddition(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This statement shows that addition
- checking and printing are both valid
- options that can be performed. Credit: Tien
- Result: 666addition checkfalse*/
{
int a
while (a != 3) {
print(1 + 2 + 3)
a = 1 + a
}
if (1+1+1+1+1 == 2+3) {
print("addition check")
}
if (1+5+3 != 8) {
print(false)
}
} $`;
        }

        /* ------------------------------------
            Failing Tests
        -------------------------------------- */

        /* -----------------------------------
            Lexer
        ---------------------------------------*/

        static alan(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Provided By
    - Compiler Tyrant
    - Alan G Labouseur
    - Program 1: Pass Lex, Parse, Semantic
    - Program 2: Pass Lex, Parse, Semantic
    - Program 3: Pass Lex, fail parse
    - Program 4: Fail Lex
*/
{}$
{{{{{{}}}}}}$
{{{{{{}}}}}}}$
{int	@}$`;
        }

        static typeInsideString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Type inside of a String */
{
    boolean d
    d = ("string") != "string")
}$`;
        }

        static EOPinsideString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  EOP inside of a String */
{"$"} $`;
        }

        static unterminatedComment(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Unterminated Comment */
{ int a /* unterminated comment }$`;
        }

        static unterminatedString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Unterminated String */
{ a = "unterminated string }$`;
        }

        static extraRightBrace(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Extra Right Brace */
{{{{{{}}} /* comments are ignored */ }}}}$`;
        }

        /* -----------------------------------
            Parser
        ------------------------------------- */

        static invalidStatementList(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid StatementList */
{
4 + 2
}$`;
        }

        static invalidExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid Expr */
{
int a
a = a + 2
}$`;
        }

        static invalidVarDecl(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid VarDecl */
{
int 4
}$`;
        }

        static invalidPrint(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid Print pt. 2 */
{
print("$)
}$`;
        }

        static incompleteBoolExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for incomplete BooleanExpr */
{
s = "strb"
print(s)

if (a != ) {
print("true")
}
}$`;
        }

        static incompleteIntExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for incomplete IntExpr */
{
int a
a = 1 +
print(a)
}$`;
        }

        /* --------------------------------------
            Semantic Analysis
        --------------------------------------- */

        static semanticWarnings(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Has unused and undeclared variables */
{
  int a
  int b
  a = 3
  b = 4
  {
    string a
    a = "hey"
    print(a)
    print(b)
  }
  print(b)
  string s
  {
    boolean b
    b = false
  }
  string r
  r = "hey"
  int d
  print(d)
  d = 3
}$`;
        }

        static undeclaredVar(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Variables being used but not declared first */
{
int a
b = 4
}$`;
        }

        static duplicateVar(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Variables being declared again in same scope*/
{
int a
{
string a
a = "this is fine"
}
boolean a /* this is not fine" */
}$`;
        }
        static typeMismatch(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* A variable's type is not compatible with its assignment*/
{
string s
s = 4 + 3
}$`;
        }

        static incorrectTypeCompar(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Types do not match in Boolean comparison*/
{
if(4 == false){
print("this no good")
}
if(4 == "hey"){
print("int to string")
}
if(false != "hey"){
print("bool to string")
}
if(4 != 3){
print("int to int")
}
}$`;
        }

        static incorrectIntExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* A digit is added to something other than a digit */
{
int a
a = 4 + false
}$`;
        }

        static initButNotUsed(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Variable initialized but not used. Produces semantic warning*/
{
    int a
    int b
    b = 2
    print(b)
}$`;
        }

        /* --------------------------------
            Code Generation
        --------------------------------- */

        static booleanHell(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This test case is included because it completely messed
- up my AST with boolean hell and keeping track of boolexpr
- may it serve as a good benchmark for those who come after
- CREDIT: TIEN */
{
int a
a = 0
boolean b
b = false
boolean c
c = true
while(((a!=9) == ("test" != "alan")) == ((5==5) != (b == c))) {
print("a")
string d
d = "yes"
print(d)
{
    int a
    a = 5
}
}
}$`;
        }

        static maxMemory(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Valid code but can't fit into 256 bytes */
{
int a
int b
int c
int d
a = 2
{
b = 5
print(b)
a = 1 + a
{
    print(a)
    a = 5
}
if(a == b) {
    print("wowza")
}
int d
d = 5
{
    string d
    d = "hey"
    print(d)
    d = "sap"
    print(d)
}
print(d)
}
c = 4
print(c)
while (c != 7) {
c = 1 + 1 + 1 + c
print(c)
}
c = 9 + c
print(c)
}$`;
        }

        static stackOverflow(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Stack Overflow */
{
int a
a = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1
}$`;
        }

        static heapOverflow(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Heap Overflow */
{
string a
a = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}$`;
        }
    }
}
