# IPXPACK File Format

`.ipxpack` is the InterPixel OS 2 teaching filesystem container.

The browser implementation stores it as readable JSON:

```json
{
  "magic": "IPXPACK",
  "version": 1,
  "createdBy": "InterPixel OS 2",
  "createdAt": "2026-05-25T00:00:00.000Z",
  "files": [
    {
      "path": "/notes/welcome.txt",
      "type": "text/plain",
      "bytes": 32,
      "contents": "Hello"
    }
  ]
}
```

The native header in `native/ipxpack.h` shows how to evolve this into a binary block format for a real kernel.
