#ifndef IPX_BLOCK_DRIVE_H
#define IPX_BLOCK_DRIVE_H

void block_drive_init(void);
int block_drive_read_sector(unsigned long lba, void *buffer);
int block_drive_write_sector(unsigned long lba, const void *buffer);

#endif
