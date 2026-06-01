#include "ipxpkg.h"
#include "../fs/ipxfs.h"

static void make_package_path(char *out, const char *name) {
    const char prefix[] = "/Packages/";
    int i = 0;
    for (; prefix[i]; i++) {
        out[i] = prefix[i];
    }
    for (int j = 0; name[j] && i < 110; j++, i++) {
        char c = name[j];
        out[i] = (c == '/' || c == '\\') ? '_' : c;
    }
    out[i++] = '.';
    out[i++] = 'i';
    out[i++] = 'p';
    out[i++] = 'x';
    out[i++] = 'p';
    out[i++] = 'k';
    out[i++] = 'g';
    out[i] = 0;
}

int ipxpkg_install_text_package(const char *package_name, const char *manifest_text) {
    char path[128];
    unsigned int size = 0;
    while (manifest_text[size] && size < 512) {
        size++;
    }
    make_package_path(path, package_name);
    return ipxfs_write_file(path, manifest_text, size);
}
