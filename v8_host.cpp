#include <iostream>
#include <string>

// Build a real V8 host with:
//   -DINTERPIXEL_WITH_V8=1
//   V8 include directories
//   V8 libraries linked for your target
//
// A raw-computer OS cannot use desktop V8 until it provides enough platform
// services: virtual memory, threads, timers, file I/O, entropy, and C++ runtime
// support. This file is intentionally a teaching bridge.

#if INTERPIXEL_WITH_V8
#include "libplatform/libplatform.h"
#include "v8.h"
#endif

int run_interpixel_script(const std::string &source) {
#if INTERPIXEL_WITH_V8
    v8::V8::InitializeICUDefaultLocation("");
    v8::V8::InitializeExternalStartupData("");
    auto platform = v8::platform::NewDefaultPlatform();
    v8::V8::InitializePlatform(platform.get());
    v8::V8::Initialize();

    v8::Isolate::CreateParams create_params;
    create_params.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
    v8::Isolate *isolate = v8::Isolate::New(create_params);

    {
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        auto context = v8::Context::New(isolate);
        v8::Context::Scope context_scope(context);
        auto code = v8::String::NewFromUtf8(isolate, source.c_str()).ToLocalChecked();
        auto script = v8::Script::Compile(context, code).ToLocalChecked();
        script->Run(context).ToLocalChecked();
    }

    isolate->Dispose();
    delete create_params.array_buffer_allocator;
    v8::V8::Dispose();
    v8::V8::DisposePlatform();
    return 0;
#else
    std::cout << "V8 support is not compiled in.\n";
    std::cout << "Script preview: " << source << "\n";
    return 0;
#endif
}

int main() {
    return run_interpixel_script("const os = 'InterPixel OS 2'; os;");
}
