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
        s = "hey there sexy"
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

    }
}