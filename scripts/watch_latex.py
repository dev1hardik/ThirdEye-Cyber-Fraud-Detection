import os
import time
import subprocess
import re
from datetime import datetime

TEX_FILE = "Team_Third_Eye_Action_Plan.tex"
PDF_FILE = "Team_Third_Eye_PS01.pdf"
SCRIPT_FILE = os.path.join("scripts", "compile_latex_to_pdf.py")

print(f"[*] Starting Auto-Watcher on {TEX_FILE} -> {PDF_FILE}...")
print(f"[*] Any edits you save in {TEX_FILE} will automatically recompile {PDF_FILE}.")

last_mtime = 0
if os.path.exists(TEX_FILE):
    last_mtime = os.path.getmtime(TEX_FILE)

def sanitize_and_compile():
    try:
        # 1. Auto-sanitize any stray > bracket typos
        with open(TEX_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            
        fixed = re.sub(r'\{([^{}\n]+)>', r'{\1}', content)
        fixed = re.sub(r'\[([^\[\]\n]+)>', r'[\1]', fixed)
        
        if fixed != content:
            with open(TEX_FILE, 'w', encoding='utf-8') as f:
                f.write(fixed)
            print("  [Watcher] Auto-repaired bracket typos in LaTeX file.")

        # 2. Compile to PDF
        res = subprocess.run(["python", SCRIPT_FILE], capture_output=True, text=True)
        now_str = datetime.now().strftime("%H:%M:%S")
        if res.returncode == 0:
            print(f"[{now_str}] ✓ Successfully auto-recompiled {PDF_FILE} (Ready on refresh!)", flush=True)
        else:
            print(f"[{now_str}] ✗ Compilation error:\n{res.stderr}", flush=True)
    except Exception as e:
        print(f"  [Watcher Error]: {e}", flush=True)

while True:
    try:
        if os.path.exists(TEX_FILE):
            curr_mtime = os.path.getmtime(TEX_FILE)
            if curr_mtime != last_mtime:
                last_mtime = curr_mtime
                print(f"\n[*] Change detected in {TEX_FILE} at {datetime.now().strftime('%H:%M:%S')}", flush=True)
                sanitize_and_compile()
        time.sleep(1)
    except KeyboardInterrupt:
        print("[*] Watcher stopped.")
        break
    except Exception as e:
        time.sleep(1)
