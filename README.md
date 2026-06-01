# Bare-Metal Track

This folder is the native path for InterPixel OS 2.

Current teaching modules:

- `kernel_main.c`: native kernel entry
- `drivers/vga_text.c`: writes directly to VGA text memory at `0xB8000`
- `drivers/keyboard.c`: reads PS/2 keyboard scan codes from I/O ports
- `drivers/block_drive.c`: ATA PIO sector read/write driver for primary IDE-compatible disks
- `drivers/power.c`: reboot control through the keyboard controller and QEMU shutdown ports
- `fs/ipxfs.c`: first raw-sector InterPixel filesystem and file manager layer
- `pkg/ipxpkg.c`: package installer that writes package manifests into IPXFS
- `ai/ipx_ai.c`: tiny local AI teaching core that can run without an OS
- `boot.S`: Multiboot entry and stack
- `linker.ld`: simple freestanding kernel layout

## Build Target

Use a real cross compiler, not the host compiler:

```sh
sh build.sh
qemu-system-i386 -cdrom interpixel-os-2.iso
```

The project is now shaped like a real bootable kernel, but it still needs major production work before using it on real hardware: interrupt descriptor table, paging, heap allocator, process scheduler, AHCI/NVMe SSD drivers, safe filesystem recovery, user mode, and hardware-specific driver detection.
