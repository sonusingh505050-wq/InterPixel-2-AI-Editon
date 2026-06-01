#include "ipx_ai.h"

void ipx_ai_init(void) {
}

static int contains(const char *text, const char *needle) {
    for (; *text; text++) {
        const char *a = text;
        const char *b = needle;
        while (*a && *b && *a == *b) {
            a++;
            b++;
        }
        if (*b == 0) {
            return 1;
        }
    }
    return 0;
}

const char *ipx_ai_answer(const char *prompt) {
    if (contains(prompt, "driver")) {
        return "Drivers translate kernel requests into hardware operations.";
    }
    if (contains(prompt, "task")) {
        return "Tasks need saved registers, stacks, states, and scheduler time.";
    }
    if (contains(prompt, "file")) {
        return "IPXPACK maps paths to block ranges and metadata.";
    }
    return "InterPixel AI: boot small, verify each layer, then expand.";
}
