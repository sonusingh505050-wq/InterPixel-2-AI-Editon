#include "keyboard.h"
#include "driver_manager.h"
#include "vga_text.h"
#include "../ports.h"

void keyboard_init(void) {
    driver_manager_register("ps2.keyboard", IPX_DRIVER_READY);
}

void keyboard_poll(void) {
    unsigned char status = inb(0x64);
    if ((status & 1) == 0) {
        return;
    }
    unsigned char scan = inb(0x60);
    if (scan == 0x1C) {
        vga_write("enter\n");
    }
}
