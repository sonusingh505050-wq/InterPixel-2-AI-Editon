#include "ipxfs.h"
#include "../drivers/block_drive.h"
#include "../drivers/driver_manager.h"

typedef struct {
    uint32_t magic;
    uint32_t version;
    uint32_t file_count;
    uint32_t next_free_lba;
    ipxfs_entry_t files[IPXFS_MAX_FILES];
} ipxfs_superblock_t;

static ipxfs_superblock_t fs;
static uint32_t fs_base_lba = 2048;

static int streq(const char *a, const char *b) {
    while (*a && *b && *a == *b) {
        a++;
        b++;
    }
    return *a == 0 && *b == 0;
}

static void strcopy(char *target, const char *source, int capacity) {
    int i = 0;
    for (; i < capacity - 1 && source[i]; i++) {
        target[i] = source[i];
    }
    target[i] = 0;
}

static int flush_superblock(void) {
    return block_drive_write_sector(fs_base_lba, &fs);
}

void ipxfs_init(void) {
    driver_manager_register("fs.ipxfs", IPX_DRIVER_READY);
    if (block_drive_read_sector(fs_base_lba, &fs) != 0 || fs.magic != IPXFS_MAGIC) {
        ipxfs_format(fs_base_lba);
    }
}

int ipxfs_format(uint32_t base_lba) {
    fs_base_lba = base_lba;
    fs.magic = IPXFS_MAGIC;
    fs.version = 1;
    fs.file_count = 0;
    fs.next_free_lba = base_lba + 8;
    for (int i = 0; i < IPXFS_MAX_FILES; i++) {
        fs.files[i].name[0] = 0;
        fs.files[i].start_lba = 0;
        fs.files[i].byte_size = 0;
        fs.files[i].flags = 0;
    }
    return flush_superblock();
}

int ipxfs_write_file(const char *name, const void *data, uint32_t byte_size) {
    uint8_t sector[512];
    if (fs.file_count >= IPXFS_MAX_FILES || byte_size > 512) {
        return -1;
    }
    for (int i = 0; i < 512; i++) {
        sector[i] = 0;
    }
    for (uint32_t i = 0; i < byte_size; i++) {
        sector[i] = ((const uint8_t *)data)[i];
    }
    ipxfs_entry_t *entry = &fs.files[fs.file_count++];
    strcopy(entry->name, name, IPXFS_NAME_MAX);
    entry->start_lba = fs.next_free_lba++;
    entry->byte_size = byte_size;
    entry->flags = 0;

    if (block_drive_write_sector(entry->start_lba, sector) != 0) {
        return -1;
    }
    return flush_superblock();
}

int ipxfs_read_file(const char *name, void *data, uint32_t capacity) {
    uint8_t sector[512];
    for (uint32_t i = 0; i < fs.file_count; i++) {
        if (streq(fs.files[i].name, name)) {
            if (capacity < fs.files[i].byte_size) {
                return -1;
            }
            if (block_drive_read_sector(fs.files[i].start_lba, sector) != 0) {
                return -1;
            }
            for (uint32_t j = 0; j < fs.files[i].byte_size; j++) {
                ((uint8_t *)data)[j] = sector[j];
            }
            return 0;
        }
    }
    return -1;
}

const ipxfs_entry_t *ipxfs_list(int *count) {
    *count = (int)fs.file_count;
    return fs.files;
}
