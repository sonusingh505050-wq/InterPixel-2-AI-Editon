#include "power.h"
#include "../ports.h"

void power_reboot(void) {
    while ((inb(0x64) & 0x02) != 0) {
    }
    outb(0x64, 0xFE);
    for (;;) {
        __asm__ volatile("hlt");
    }
}

void power_shutdown_qemu(void) {
    outw(0x604, 0x2000);
    outw(0xB004, 0x2000);
    for (;;) {
        __asm__ volatile("hlt");
    }
}
