/* --------  
   semantic.ts

   -------- */

   module JuiceC {

    export class Semantic {

        cst: Tree;
        ast: Tree;
        symbolTable;

        public analyze(cst: Tree) {
            this.cst = cst;
        }
    }
}
