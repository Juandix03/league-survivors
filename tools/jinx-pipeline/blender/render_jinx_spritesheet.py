# Blender 4.x — import GLB, bake 4×4 sheet (64px frames).
# Usage: Scripting workspace → Open → Run Script
# Set GLB_PATH below to your exported jinx_skin0_khada.glb

import bpy
import math
import os

GLB_PATH = os.path.join(
    os.path.dirname(__file__), "..", "work", "jinx_skin0_khada.glb"
)
OUT_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "..",
    "public",
    "assets",
    "champions",
    "jinx",
    "spritesheet_authentic_test.png",
)

FRAME_W = 64
FRAME_H = 64
COLS = 4
ROWS = 4

CLIPS = [
    ("Idle1_Base", 0),
    ("Run_Base", 0),
    ("Run_Base", math.pi),
    ("Run_Base", math.pi / 2),
]

ROT_Y = [0, 0, math.pi, math.pi / 2]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def setup_camera():
    cam_data = bpy.data.cameras.new("OrthoCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 1.35
    cam = bpy.data.objects.new("OrthoCam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = (0, 28, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = cam
    return cam


def setup_render():
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.film_transparent = True
    sc.render.resolution_x = FRAME_W
    sc.render.resolution_y = FRAME_H


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)
    root = bpy.context.selected_objects[0] if bpy.context.selected_objects else None
    return root


def find_action(name):
    for act in bpy.data.actions:
        if act.name == name or name.lower() in act.name.lower():
            return act
    return None


def render_frame(root, action, time, rot_y, out_file):
    if root:
        root.rotation_euler = (0, rot_y, 0)
    if action:
        action.frame_range[0]
        frame = action.frame_range[0] + time * (action.frame_range[1] - action.frame_range[0])
        bpy.context.scene.frame_set(int(frame))
    bpy.context.scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)


def main():
    clear_scene()
    setup_camera()
    setup_render()
    root = import_glb(os.path.abspath(GLB_PATH))
    tmp_dir = bpy.app.tempdir
    tiles = []
    for row, (clip, _) in enumerate(CLIPS):
        act = find_action(clip)
        for col in range(4):
            t = (col + 0.12) / 4.0
            path = os.path.join(tmp_dir, f"jinx_{row}_{col}.png")
            render_frame(root, act, t, ROT_Y[row], path)
            tiles.append((path, col * FRAME_W, row * FRAME_H))

    # Composite in image editor manually, or use Pillow outside Blender.
    print("Rendered tiles to", tmp_dir)
    print("Composite to", OUT_PATH, "or re-run npm run render in tools/jinx-pipeline")


if __name__ == "__main__":
    main()
