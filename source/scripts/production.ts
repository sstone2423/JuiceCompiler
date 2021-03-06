/**
 * production.ts
 * 
 * The productions of the grammar
 */

module JuiceC {
    export const enum Production {
        Program = "Program",
        Block = "Block",
        StatementList = "StatementList",
        Statement = "Statement",
        PrintStatement = "PrintStatement",
        AssignStatement = "AssignmentStatement",
        VarDecl = "VarDecl",
        WhileStatement = "WhileStatement",
        IfStatement = "IfStatement",
        Expr = "Expression",
        IntExpr = "IntegerExpression",
        StringExpr = "StringExpression",
        BooleanExpr = "BooleanExpression",
        Id = "Id",
        CharList = "CharList",
        Type = "Type",
        Char = "Char",
        Space = "Space",
        Digit = "Digit",
        BoolOp = "BoolOp",
        BoolVal = "BoolVal",
        IntOp = "IntOp",
        Epsilon = "&epsilon;"
    }
}
