/**
 * 	instruction.ts
 *
 * 	The 6502 is an 8-bit microprocessor that follows the memory oriented design philosophy of
 * 	the Motorola 6800.  Several engineers left Motorola and formed MOS Technology which
 * 	introduced the 6502 in 1975. The 6502 gained in popularity because of it's low price and
 * 	became the heart of several early personal computers including the Apple II, Commodore 64,
 * 	and Atari 400 and 800. The 6502 handles data in its registers, each of which holds one byte
 *  (8-bits) of data.
 *
 * 	Reference: https://dwheeler.com/6502/oneelkruns/asm1step.html
 */
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
        Instruction["BreakOp"] = "00";
        Instruction["CompareMemToX"] = "EC";
        Instruction["BranchNBytes"] = "D0";
        Instruction["Increment"] = "EE";
        Instruction["SysCall"] = "FF";
        Instruction["PrintInt"] = "01";
        Instruction["PrintStr"] = "02"; // #$02 in X reg = print the 00-terminated
    })(Instruction = JuiceC.Instruction || (JuiceC.Instruction = {}));
})(JuiceC || (JuiceC = {}));
