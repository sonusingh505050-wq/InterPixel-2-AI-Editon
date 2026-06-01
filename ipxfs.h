#ifndef IPXFS_H
#define IPXFS_H

#include <stdint.h>

#define IPXFS_MAGIC 0x53465849u
#define IPXFS_MAX_FILES 5
#define IPXFS_NAME_MAX 64

typedef struct {
    char name[IPXFS_NAME_MAX];
    uint32_t start_lba;
    uint32_t byte_size;
    uint32_t flags;
} ipxfs_entry_t;

void ipxfs_init(void);
int ipxfs_format(uint32_t base_lba);
int ipxfs_write_file(const char *name, const void *data, uint32_t byte_size);
int ipxfs_read_file(const char *name, void *data, uint32_t capacity);
const ipxfs_entry_t *ipxfs_list(int *count);

#endif
