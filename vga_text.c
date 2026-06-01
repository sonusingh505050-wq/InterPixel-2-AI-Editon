#include "vga_text.h"
#include <stdint.h>

static volatile uint16_t *const VGA = (uint16_t *)0xB8000;
static int row = 0;
static int col = 0;

static void put_char(char c) {
    if (c == '\n') {
        row++;
        col = 0;
        return;
    }
    VGA[row * 80 + col] = (uint16_t)c | ((uint16_t)0x0F << 8);
    col++;
    if (col >= 80) {
        col = 0;
        row++;
    }
    if (row >= 25) {
        row = 0;
    }
}

void vga_clear(void) {
    for (int i = 0; i < 80 * 25; i++) {
        VGA[i] = (uint16_t)' ' | ((uint16_t)0x0F << 8);
    }
    row = 0;
    col = 0;
}

void vga_write(const char *text) {
    while (*text) {
        put_char(*text++);
    }
}
