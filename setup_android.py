#!/usr/bin/env python3
"""
Android PWA Setup Helper
Finds your IP address and provides installation instructions
"""

import socket
import subprocess
import platform
import webbrowser
import time

def get_local_ip():
    """Get the local IP address"""
    try:
        # Create a socket to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def check_port(port):
    """Check if a port is in use"""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return False
    except:
        return True

def open_browser(ip):
    """Open browser with the app"""
    url = f"http://{ip}:3000"
    print(f"Opening browser at: {url}")
    webbrowser.open(url)

def main():
    print("AgriTech Android PWA Setup Helper")
    print("=" * 40)
    
    # Get local IP
    ip = get_local_ip()
    print(f"Your Local IP: {ip}")
    
    # Check if servers are running
    frontend_running = check_port(3000)
    disease_running = check_port(5000)
    marketplace_running = check_port(5001)
    
    print("\nServer Status:")
    print(f"Frontend (Port 3000): {'Running' if frontend_running else 'Not Running'}")
    print(f"Disease Detection (Port 5000): {'Running' if disease_running else 'Not Running'}")
    print(f"Marketplace (Port 5001): {'Running' if marketplace_running else 'Not Running'}")
    
    if not frontend_running:
        print("\nWARNING: Frontend server is not running!")
        print("Please start the frontend server:")
        print("cd d:\\Hackthon\\AgriTech-Web")
        print("npm start")
        return
    
    print("\nAndroid Installation Instructions:")
    print("=" * 40)
    print("1. Make sure your Android device is on the same WiFi network")
    print("2. Open Chrome browser on your Android device")
    print(f"3. Go to: http://{ip}:3000")
    print("4. Wait for the app to load completely")
    print("5. Look for 'Add to Home screen' banner")
    print("6. If no banner appears:")
    print("   - Tap the three dots (menu) in Chrome")
    print("   - Select 'Add to Home screen' or 'Install app'")
    print("7. Tap 'Add' or 'Install' to confirm")
    print("8. Look for the AgriTech icon on your home screen")
    
    print(f"\nQR Code for easy access:")
    print(f"URL: http://{ip}:3000")
    print("(You can use a QR code generator app to create a QR code)")
    
    # Ask if user wants to open browser
    try:
        choice = input("\nOpen browser on this computer? (y/n): ").lower().strip()
        if choice in ['y', 'yes']:
            open_browser(ip)
            print("Browser opened. You can now use this URL on your Android device.")
    except KeyboardInterrupt:
        print("\nSetup cancelled.")
    
    print("\nSetup complete! Follow the Android instructions above.")

if __name__ == "__main__":
    main()
