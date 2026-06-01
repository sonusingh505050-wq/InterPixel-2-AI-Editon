#ifndef IPX_DRIVER_MANAGER_H
#define IPX_DRIVER_MANAGER_H

typedef enum {
    IPX_DRIVER_STOPPED = 0,
    IPX_DRIVER_READY = 1,
    IPX_DRIVER_ERROR = 2
} ipx_driver_state_t;

typedef struct {
    const char *name;
    ipx_driver_state_t state;
} ipx_driver_t;

void driver_manager_init(void);
void driver_manager_register(const char *name, ipx_driver_state_t state);
const ipx_driver_t *driver_manager_list(int *count);

#endif
