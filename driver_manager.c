#include "driver_manager.h"

static ipx_driver_t drivers[32];
static int driver_count = 0;

void driver_manager_init(void) {
    driver_count = 0;
    driver_manager_register("driver.manager", IPX_DRIVER_READY);
}

void driver_manager_register(const char *name, ipx_driver_state_t state) {
    if (driver_count >= 32) {
        return;
    }
    drivers[driver_count++] = (ipx_driver_t){ name, state };
}

const ipx_driver_t *driver_manager_list(int *count) {
    *count = driver_count;
    return drivers;
}
