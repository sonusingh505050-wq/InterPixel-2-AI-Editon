#ifndef INTERPIXEL_IPXPACK_H
#define INTERPIXEL_IPXPACK_H

#include <stdint.h>

#define IPXPACK_MAGIC "IPXPACK"
#define IPXPACK_VERSION 1

typedef struct {
    char magic[8];
    uint32_t version;
    uint32_t file_count;
    uint64_t directory_offset;
    uint64_t data_offset;
} ipxpack_header_t;

typedef struct {
    char path[256];
    uint64_t offset;
    uint64_t size;
    uint32_t flags;
} ipxpack_entry_t;

#endif
