"""Export League SCB static mesh to Wavefront OBJ (UV + positions)."""
import sys
from pathlib import Path

from pyritofile.so import SO


def read_scb_relaxed(path: str) -> SO:
    so = SO()
    with so.stream_scb(path, "rb") as bs:
        sig, = bs.read_s(8)
        if sig != "r3d2Mesh":
            raise SystemExit(f"bad signature {sig!r}")
        major, minor = bs.read_u16(2)
        so.version = float(f"{major}.{minor}")
        so.name, = bs.read_s_padded(128)
        vertex_count, face_count, flags_raw = bs.read_u32(3)
        so.flags = flags_raw
        so.bounding_box = (bs.read_vec3()[0], bs.read_vec3()[0])
        so.vertex_type = None
        if major == 3 and minor == 2:
            so.vertex_type, = bs.read_u32()
        so.positions = bs.read_vec3(vertex_count)
        if so.vertex_type is not None and so.vertex_type >= 1:
            so.colors = [bs.read_u8(4) for _ in range(vertex_count)]
        so.central, = bs.read_vec3()
        so.indices = []
        so.uvs = []
        for _ in range(face_count):
            face = bs.read_u32(3)
            if face[0] == face[1] or face[1] == face[2] or face[2] == face[0]:
                continue
            so.indices.extend(face)
            so.material, = bs.read_s_padded(64)
            from pyritofile.structs import Vector

            uvs = bs.read_f32(6)
            so.uvs.append(Vector(uvs[0], uvs[3]))
            so.uvs.append(Vector(uvs[1], uvs[4]))
            so.uvs.append(Vector(uvs[2], uvs[5]))
    return so


def write_obj(so: SO, out_path: Path) -> None:
    lines = ["# jinx_r_mis.scb via pyritofile\n"]
    for p in so.positions:
        lines.append(f"v {p.x} {p.y} {p.z}\n")
    for uv in so.uvs:
        lines.append(f"vt {uv.x} {uv.y}\n")
    face_count = len(so.indices) // 3
    for fi in range(face_count):
        i0, i1, i2 = so.indices[fi * 3 : fi * 3 + 3]
        t0, t1, t2 = fi * 3 + 1, fi * 3 + 2, fi * 3 + 3
        lines.append(f"f {i0+1}/{t0} {i1+1}/{t1} {i2+1}/{t2}\n")
    out_path.write_text("".join(lines), encoding="utf-8")
    print(f"Wrote {out_path} — verts {len(so.positions)} faces {face_count}")


def main() -> None:
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".obj")
    so = read_scb_relaxed(str(src))
    write_obj(so, dst)
    bb = so.bounding_box
    print("bbox min", bb[0], "max", bb[1])


if __name__ == "__main__":
    main()
