var JuiceC;
(function (JuiceC) {
    var Instruction;
    (function (Instruction) {
        // 6502 Assembly Instructions
        Instruction["LoadAccWithConst"] = "A9";
        Instruction["LoadAccFromMem"] = "AD";
        Instruction["StoreAccInMem"] = "8D";
        Instruction["AddWithCarry"] = "6D";
        Instruction["LoadXWithConst"] = "A2";
        Instruction["LoadXFromMem"] = "AE";
        Instruction["LoadYWithConst"] = "A0";
        Instruction["LoadYFromMem"] = "AC";
        Instruction["NoOp"] = "EA";
        // BreakOp       = "00", // BRK - Break (which is really a system call) .. Already have the all powerful TERMINATOR const, but lets leave this as a reference
        Instruction["CompareMemToX"] = "EC";
        Instruction["BranchNBytes"] = "D0";
        Instruction["Increment"] = "EE";
        Instruction["SysCall"] = "FF";
        Instruction["PrintInt"] = "01";
        Instruction["PrintStr"] = "02"; // #$02 in X reg = print the 00-terminated
    })(Instruction = JuiceC.Instruction || (JuiceC.Instruction = {}));
})(JuiceC || (JuiceC = {}));
