#!/usr/bin/env python3
"""Wrap a raw RGBA dump from tools/frame.mjs into a PNG, so a frame can be
looked at with eyes or a vision model without a browser. Stdlib only."""
import struct, sys, zlib


def png(path, w, h, rgba):
    raw = b"".join(b"\x00" + bytes(rgba[y * w * 4:(y + 1) * w * 4]) for y in range(h))

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    head = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    blob = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", head)
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    open(path, "wb").write(blob)


if __name__ == "__main__":
    src, dst, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
    data = open(src, "rb").read()
    assert len(data) == w * h * 4, f"{len(data)} bytes for {w}x{h}"
    png(dst, w, h, data)
    print(f"{dst}: {w}x{h} from {len(data)} bytes")
