# TEMPLATE-20260520-acceptance

## Browser Acceptance

- Open `/`.
- Search for `SSE`.
- Open `/tools/ai/sse-parser`.
- Confirm default SSE sample parses into JSON-like event blocks.
- Open `/tools/crypto/aes`.
- Encrypt the default text and confirm an IV is displayed.
- Decrypt the ciphertext using the displayed IV and same passphrase.
- Open `/study/transformer-lectures`.
- Open `/study/transformer-lectures/stage1/chapter01_numpy_tensor`.
- Confirm lecture tables, code blocks, and Python example panel render.
- Open `/study/git-basics`.
- Open `/study/git-basics/stage1/chapter01_install_setup`.
- Confirm the Git beginner chapter renders command examples, tables, checklist sections, and Windows PowerShell / Command Prompt notes.
- Open `/study/godot-basics`.
- Open `/study/godot-basics/stage1/chapter01_install_editor`.
- Confirm the Godot beginner chapter states the Godot 4.6.3 baseline, renders setup steps, and displays the editor layout SVG diagram.
- Open `/study/godot-basics/stage1/chapter02_nodes_scenes`.
- Confirm the Godot scene/instance SVG diagram renders and the chapter still shows tables and code blocks.
- Open `/study/godot-basics/stage3/chapter11_export_release`.
- Confirm the Godot export SVG diagram renders and Windows `py -m http.server 8000` guidance appears.
- Open `/study/unity-basics`.
- Open `/study/unity-basics/stage1/chapter01_install_editor`.
- Confirm the Unity beginner chapter states the Unity 6.3 LTS baseline and renders Windows project directory setup notes.
- Open `/study/unreal-basics`.
- Open `/study/unreal-basics/stage1/chapter01_install_editor`.
- Confirm the Unreal beginner chapter states the Unreal Engine 5.7 baseline and renders Windows project directory setup notes.
- Toggle language in the header and confirm UI labels switch between English and Chinese.

## Deployment Acceptance

- Confirm GitHub Actions Pages workflow succeeds.
- Confirm the Pages artifact contains `CNAME`.
- Confirm `https://toolbox.silvericekey.fun` resolves to the deployed site after DNS propagation.
- Confirm HTTPS is enabled in GitHub Pages settings.
