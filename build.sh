#!/usr/bin/env sh
set -eu

i686-elf-as boot.S -o boot.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c kernel_main.c -o kernel_main.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c drivers/driver_manager.c -o driver_manager.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c drivers/vga_text.c -o vga_text.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c drivers/keyboard.c -o keyboard.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c drivers/block_drive.c -o block_drive.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c drivers/power.c -o power.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c fs/ipxfs.c -o ipxfs.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c pkg/ipxpkg.c -o ipxpkg.o
i686-elf-gcc -std=gnu11 -ffreestanding -O2 -Wall -Wextra -c ai/ipx_ai.c -o ipx_ai.o
i686-elf-gcc -T linker.ld -o interpixel-os-2.bin -ffreestanding -O2 -nostdlib \
  boot.o kernel_main.o driver_manager.o vga_text.o keyboard.o block_drive.o power.o ipxfs.o ipxpkg.o ipx_ai.o -lgcc

mkdir -p iso/boot/grub
cp interpixel-os-2.bin iso/boot/interpixel-os-2.bin
cat > iso/boot/grub/grub.cfg <<CFG
menuentry "InterPixel OS 2" {
  multiboot /boot/interpixel-os-2.bin
}
CFG
grub-mkrescue -o interpixel-os-2.iso iso
