/* 
    test.ts  
*/

module JuiceC {

    export class Test {
        public static simpleTest1(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This is a simple program with no operations */
{}$`;
        }

        public static simpleTest2(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for print statement */
{
    print("i love compilers")
}$`;
        }

        public static fullProgram(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for a 'regular' program*/
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

        public static multiplePrograms(): void {
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

        public static crazyOneLiner(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for crazy one liner */\n+\${hellotruefalse!======trueprinta=3b=0print(\"false true\")whi33leiftruefalsestring!= stringintbooleanaa truewhileif{hi+++==!==}}/*aaahaha*/hahahahaha/*awao*/$`;
        }

        public static whileStatement(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for WhileStatement */
{
    string s
    int a
    a = 1
    {
        s = "hey there"
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
        print(s)
    }
} $`;
        }

        public static ifStatement(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for IfStatement */
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
    if(true == (a == a)){
        print("booleans")
    }
} $`;
        }

        public static missingEOP(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Missing EOP */
{
    int b
    b = 4
    string s
    s = "hey"
}`;
        }

        public static alan(): void {
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

        public static typeInsideString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Type inside of a String */
{	
    boolean d
    d = ("string") != "string")	
}$`;
        }
        
        public static EOPinsideString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  EOP inside of a String */
{"$"} $`;
        }

        public static unterminatedComment(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Unterminated Comment */
{ int a /* unterminated comment }$`;
        }

        public static unterminatedString(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Unterminated String */
{ a = "unterminated string }$`;
        }

        public static extraRightBrace(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/*  Extra Right Brace */
{{{{{{}}} /* comments are ignored */ }}}}$`;
        }

        public static invalidStatementList(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid StatementList */
{
4 + 2
}$`;
        }

        public static invalidExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid Expr */
{
int a
a = a + 2
}$`;
        }

        public static invalidVarDecl(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid VarDecl */
{
int 4
}$`;
        }

        public static invalidPrint(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for invalid Print pt. 2 */
{
print("$)
}$`;
        }

        public static incompleteBoolExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for incomplete BooleanExpr */
{
s = "strb"
print(s)

if (a != ) {
print("true")
}
}$`;
        }

        public static incompleteIntExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Test case for incomplete IntExpr */
{
int a
a = 1 +
print(a)
}$`;
        }

        public static semanticWarnings(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* has unused and undeclared variables */
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

        public static undeclaredVar(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Variables being used but not declared first */
{
int a
b = 4
}$`;
        }

        public static duplicateVar(): void {
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
        public static typeMismatch(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* A variable's type is not compatible with its assignment*/
{
string s
s = 4 + 3
}$`;
        }

        public static incorrectTypeCompar(): void {
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

        public static incorrectIntExpr(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* A digit is added to something other than a digit */
{
int a
a = 4 + false
}$`;
        }

        public static tienTest(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Thx Tien. */       
{
int a
a = 0
string z
z = "bond"
while (a != 9) {
if (a != 5) {
print("bond")
}
{
a = 1 + a
string b
b = "james bond"
print(b)
}
}
{/*Holy Hell This is Disgusting*/}
boolean c
c = true
boolean d
d = (true == (true == false))
d = (a == b)
d = (1 == a)
d = (1 != 1)
d = ("string" == 1)
d = (a != "string")
d = ("string" != "string")
if (d == true) {
int c
c = 1 + d
if (c == 1) {
print("ugh")
}
}
while ("string" == a) {
while (1 == true) {
a = 1 + "string"
}
}
}$`;
        }

        public static tienBooleanHell(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Thanks Tien. Assuming you get past Boolean Hell
- there is a boolean being compared to
- a string which will cause a type error */
{
int a
a = 4
boolean b
b = true
boolean c
string d
d = "there is no spoon"
c = (d != "there is a spoon")
if(c == (false != (b == (true == (a == 3+1))))) {
print((b != d))
}
}$`;
        }

        public static initButNotUsed(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* Variable initialized but not used. Produces semantic warning*/
{    
    int a
    int b
    b = 2
    print(b)
}$`;
        }

    }
}