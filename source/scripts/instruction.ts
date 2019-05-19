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

module JuiceC {
    export const enum Instruction {
        // 6502 Assembly Instructions
        LoadAccWithConst = "A9", // LDA - Load the accumulator with a constant 
        LoadAccFromMem   = "AD", // LDA - Load the accumulator from memory 
        StoreAccInMem    = "8D", // STA - Store the accumulator in memory 
        AddWithCarry     = "6D", // ADC - Adds contents of an address to the 
                                 // accumulator and keeps the result in the accumulator 
        LoadXWithConst   = "A2", // LDX - Load the X register with a constant 
        LoadXFromMem     = "AE", // LDX - Load the X register from memory 
        LoadYWithConst   = "A0", // LDY - Load the Y register with a constant 
        LoadYFromMem     = "AC", // LDY - Load the Y register from memory 
        NoOp             = "EA", // NOP - No Operation 
        BreakOp       	 = "00", // BRK - Break (which is really a system call)
                                 // .. Already have the all powerful TERMINATOR const,
                                 // but lets leave this as a reference
        CompareMemToX    = "EC", // CPX - Compare a byte in memory to the X register.
                                 // Sets the Z (zero) flag if equal 
        BranchNBytes     = "D0", // BNE - Branch n bytes if z flag = 0 
        Increment        = "EE", // INC - Increment the value of a byte 
        SysCall          = "FF", // SYS - System Call
        PrintInt         = "01", // #$01 in X reg = print the integer stored in the Y register
        PrintStr         = "02"  // #$02 in X reg = print the 00-terminated
    }
}
