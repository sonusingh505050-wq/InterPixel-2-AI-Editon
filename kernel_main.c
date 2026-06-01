#include "drivers/driver_manager.h"
#include "drivers/vga_text.h"
#include "drivers/keyboard.h"
#include "drivers/block_drive.h"
#include "drivers/power.h"
#include "fs/ipxfs.h"
#include "ai/ipx_ai.h"

void ipx_kernel_main(void) {
    vga_clear();
    vga_write("InterPixel OS 2 bare-metal kernel\n");
    vga_write("Booting drivers...\n");

    driver_manager_init();
    keyboard_init();
    block_drive_init();
    ipxfs_init();
    ipx_ai_init();

    vga_write("AI Core ready. Keyboard driver ready. Drive driver ready.\n");
    vga_write("IPXFS file manager ready. Type Enter to test keyboard polling.\n");
    vga_write("This is the native teaching kernel entry.\n");

    for (;;) {
        keyboard_poll();
    }
}
