#include <stdint.h>
#include <stddef.h>

typedef struct {
    const char *name;
    uint32_t pid;
    uint32_t cpu_percent;
    uint32_t memory_kb;
} ipx_task_t;

static ipx_task_t tasks[32];
static uint32_t task_count = 0;

void ipx_task_register(const char *name, uint32_t pid) {
    if (task_count >= 32) {
        return;
    }
    tasks[task_count++] = (ipx_task_t){ name, pid, 0, 0 };
}

const ipx_task_t *ipx_tasks(size_t *count) {
    *count = task_count;
    return tasks;
}

void kernel_main(void) {
    ipx_task_register("kernel.idle", 1);
    ipx_task_register("driver.drive0", 2);
    ipx_task_register("runtime.js", 3);

    for (;;) {
        __asm__ volatile("hlt");
    }
}
