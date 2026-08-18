#!/usr/bin/env python3
"""
Lawyer Finder — Unified All-in-One Launcher
CSE 3104 Project (Ahsanullah University of Science and Technology)

This script:
1. Detects PHP (System PATH or XAMPP C:\\xampp\\php\\php.exe)
2. Checks / initializes the MySQL database schema (if MySQL is running)
3. Starts the PHP backend API server on http://localhost:8000
4. Starts the Vite React frontend on http://localhost:5173
5. Opens the browser automatically
6. Cleans up all child processes on Ctrl+C
"""

import os
import sys
import time
import shutil
import signal
import subprocess
import webbrowser
import urllib.request
from pathlib import Path

# Color styling for terminal
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"
SCHEMA_FILE = BACKEND_DIR / "database" / "schema.sql"

def print_banner():
    print(f"{GREEN}{BOLD}" + "=" * 65)
    print(" ⚖️  LAWYER FINDER — CSE 3104 PROJECT RUNNER")
    print(" Connects Clients with Verified Lawyers (Checkpoint 1)")
    print("=" * 65 + f"{RESET}\n")

def find_php():
    """Locate PHP binary in system PATH or common XAMPP installation folders."""
    php_path = shutil.which("php")
    if php_path:
        return php_path
    
    candidates = [
        r"C:\xampp\php\php.exe",
        r"D:\xampp\php\php.exe",
        r"C:\tools\php\php.exe",
        r"C:\Program Files\PHP\php.exe",
        r"C:\Program Files (x86)\PHP\php.exe",
    ]
    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate
    return None

def find_mysql():
    """Locate MySQL CLI binary in PATH or XAMPP."""
    mysql_path = shutil.which("mysql")
    if mysql_path:
        return mysql_path
    
    candidates = [
        r"C:\xampp\mysql\bin\mysql.exe",
        r"D:\xampp\mysql\bin\mysql.exe",
        r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    ]
    for candidate in candidates:
        if os.path.isfile(candidate):
            return candidate
    return None

def init_database_if_possible(mysql_bin):
    """Attempt to import schema.sql if MySQL server is responding."""
    if not mysql_bin or not SCHEMA_FILE.exists():
        return
    
    print(f"{CYAN}🔍 Checking MySQL database status...{RESET}")
    try:
        # Check connection to localhost MySQL (root / no password default in XAMPP)
        check_cmd = [mysql_bin, "-u", "root", "-e", "SHOW DATABASES LIKE 'lawyer_finder';"]
        result = subprocess.run(check_cmd, capture_output=True, text=True, timeout=3)
        
        if "lawyer_finder" not in result.stdout:
            print(f"{YELLOW}⚡ 'lawyer_finder' database not found. Auto-importing schema.sql...{RESET}")
            with open(SCHEMA_FILE, "r", encoding="utf-8") as sf:
                import_cmd = [mysql_bin, "-u", "root"]
                import_proc = subprocess.run(import_cmd, stdin=sf, capture_output=True, text=True, timeout=10)
                if import_proc.returncode == 0:
                    print(f"{GREEN}✓ Database initialized and seed data imported successfully!{RESET}")
                else:
                    print(f"{YELLOW}⚠️  Auto-import skipped. Please import backend/database/schema.sql in phpMyAdmin.{RESET}")
        else:
            print(f"{GREEN}✓ MySQL database 'lawyer_finder' is active and ready.{RESET}")
    except Exception as e:
        print(f"{YELLOW}ℹ️  MySQL not detected or requires password. If not already done, start MySQL in XAMPP and import backend/database/schema.sql in phpMyAdmin.{RESET}")

def ensure_frontend_dependencies():
    """Check if node_modules exists, run npm install if not."""
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print(f"{CYAN}📦 Installing frontend dependencies (first-time setup)...{RESET}")
        subprocess.run(["npm", "install"], cwd=str(FRONTEND_DIR), shell=True, check=True)
        print(f"{GREEN}✓ Frontend packages installed.{RESET}")

def wait_for_url(url, timeout=20):
    """Poll URL until it responds with HTTP status 200 or timeout."""
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=1) as resp:
                if resp.status in (200, 304):
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def main():
    print_banner()

    # 1. Check PHP
    php_bin = find_php()
    if not php_bin:
        print(f"{RED}{BOLD}❌ PHP was not found!{RESET}")
        print("Please install XAMPP or add PHP to your system PATH.")
        sys.exit(1)
    else:
        print(f"{GREEN}✓ Found PHP:{RESET} {php_bin}")

    # 2. Check Node
    npm_bin = shutil.which("npm")
    if not npm_bin:
        print(f"{RED}{BOLD}❌ Node.js / npm was not found!{RESET}")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)

    # 3. Check / Initialize DB
    mysql_bin = find_mysql()
    init_database_if_possible(mysql_bin)

    # 4. Ensure frontend packages
    ensure_frontend_dependencies()

    processes = []

    def shutdown(signum=None, frame=None):
        print(f"\n{YELLOW}🛑 Stopping all Lawyer Finder servers...{RESET}")
        for proc in processes:
            try:
                proc.terminate()
                proc.wait(timeout=2)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
        print(f"{GREEN}✓ Cleaned up all processes. Goodbye!{RESET}")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    try:
        # 5. Start PHP Built-in Server on Port 8000
        print(f"\n{CYAN}🚀 Starting PHP Backend API on http://localhost:8000 ...{RESET}")
        php_cmd = [php_bin, "-S", "localhost:8000", "-t", str(BACKEND_DIR)]
        php_proc = subprocess.Popen(
            php_cmd,
            cwd=str(BACKEND_DIR),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        processes.append(php_proc)

        # 6. Start Vite Frontend on Port 5173
        print(f"{CYAN}⚡ Starting React (Vite) Dev Server on http://localhost:5173 ...{RESET}")
        npm_cmd = "npm run dev"
        vite_proc = subprocess.Popen(
            npm_cmd,
            cwd=str(FRONTEND_DIR),
            shell=True
        )
        processes.append(vite_proc)

        # 7. Wait for Vite server and open browser
        print(f"{CYAN}🌐 Waiting for dev server to be ready...{RESET}")
        if wait_for_url("http://localhost:5173", timeout=15):
            print(f"{GREEN}{BOLD}✨ Lawyer Finder is LIVE! Opening browser at http://localhost:5173{RESET}")
            webbrowser.open("http://localhost:5173")
        else:
            print(f"{YELLOW}Server is starting. Open http://localhost:5173 in your browser.{RESET}")

        print(f"\n{GREEN}{BOLD}Ready for evaluation / testing!{RESET}")
        print("  - Client URL:   http://localhost:5173")
        print("  - Backend API:  http://localhost:8000")
        print("  - Press [Ctrl+C] to stop all servers.\n")

        # Keep main thread alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        shutdown()
    except Exception as e:
        print(f"{RED}Error running application: {e}{RESET}")
        shutdown()

if __name__ == "__main__":
    main()
