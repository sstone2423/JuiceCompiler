/* 
    test.ts  
*/

module JuiceC {

    export class Test {
        public static simpleTest1(): void {
            (<HTMLInputElement>document.getElementById("sourceCode")).value = `/* This is a simple program with no operations */\n{}$`;
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

    }
}