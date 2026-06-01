#include "block_drive.h"
#include "driver_manager.h"
#include "../ports.h"
#include <stdint.h>

#define ATA_DATA 0x1F0
#define ATA_ERROR 0x1F1
#define ATA_SECTOR_COUNT 0x1F2
#define ATA_LBA_LOW 0x1F3
#define ATA_LBA_MID 0x1F4
#define ATA_LBA_HIGH 0x1F5
#define ATA_DRIVE 0x1F6
#define ATA_STATUS_COMMAND 0x1F7

#define ATA_CMD_READ_SECTORS 0x20
#define ATA_CMD_WRITE_SECTORS 0x30
#define ATA_STATUS_BSY 0x80
#define ATA_STATUS_DRQ 0x08
#define ATA_STATUS_ERR 0x01

void block_drive_init(void) {
    driver_manager_register("ata.pio.primary", IPX_DRIVER_READY);
}

static int ata_wait_ready(void) {
    for (int i = 0; i < 100000; i++) {
        uint8_t status = inb(ATA_STATUS_COMMAND);
        if ((status & ATA_STATUS_ERR) != 0) {
            return -1;
        }
        if ((status & ATA_STATUS_BSY) == 0 && (status & ATA_STATUS_DRQ) != 0) {
            return 0;
        }
    }
    return -1;
}

static void ata_select_lba28(uint32_t lba) {
    outb(ATA_DRIVE, (uint8_t)(0xE0 | ((lba >> 24) & 0x0F)));
    outb(ATA_SECTOR_COUNT, 1);
    outb(ATA_LBA_LOW, (uint8_t)(lba & 0xFF));
    outb(ATA_LBA_MID, (uint8_t)((lba >> 8) & 0xFF));
    outb(ATA_LBA_HIGH, (uint8_t)((lba >> 16) & 0xFF));
}

int block_drive_read_sector(unsigned long lba, void *buffer) {
    uint16_t *words = (uint16_t *)buffer;
    ata_select_lba28((uint32_t)lba);
    outb(ATA_STATUS_COMMAND, ATA_CMD_READ_SECTORS);
    if (ata_wait_ready() != 0) {
        return -1;
    }
    for (int i = 0; i < 256; i++) {
        words[i] = inw(ATA_DATA);
    }
    return 0;
}

int block_drive_write_sector(unsigned long lba, const void *buffer) {
    const uint16_t *words = (const uint16_t *)buffer;
    ata_select_lba28((uint32_t)lba);
    outb(ATA_STATUS_COMMAND, ATA_CMD_WRITE_SECTORS);
    if (ata_wait_ready() != 0) {
        return -1;
    }
    for (int i = 0; i < 256; i++) {
        outw(ATA_DATA, words[i]);
    }
    outb(ATA_STATUS_COMMAND, 0xE7);
    return 0;
}
