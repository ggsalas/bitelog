# HTTPS Setup for Mobile Testing

This guide will help you test the Bitelog camera functionality on your mobile device.

## Prerequisites
- Your computer and mobile device must be on the same WiFi network
- You need `mkcert` installed on your system

## One-Time Setup

### 1. Install mkcert (if not already installed)

**macOS:**
```bash
brew install mkcert
brew install nss # for Firefox support
```

**Linux:**
```bash
# Arch Linux
sudo pacman -S mkcert

# Ubuntu/Debian
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

**Windows:**
```bash
choco install mkcert
```

### 2. Create Local Certificate Authority
```bash
mkcert -install
```

### 3. Generate SSL Certificates for localhost
Run this command in the project root:
```bash
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
```

This will create two files:
- `localhost.pem` (certificate)
- `localhost-key.pem` (private key)

## Running HTTPS Dev Server

### Start the server:
```bash
npm run dev:https
```

This will:
- Start Next.js dev server on port 3000
- Create HTTPS proxy on port 3001

## Accessing from Your Computer

Open your browser and go to:
```
https://localhost:3001
```

You should see the Bitelog app with no certificate warnings.

## Accessing from Mobile Device

### 1. Find Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local IP (usually starts with `192.168.x.x` or `10.x.x.x`)

### 2. Access from Mobile

On your mobile device's browser, go to:
```
https://YOUR_IP_ADDRESS:3001
```

For example: `https://192.168.1.100:3001`

### 3. Accept Certificate Warning

Since the certificate is self-signed, your mobile browser will show a security warning:

**iOS Safari:**
1. You'll see "This Connection Is Not Private"
2. Tap "Show Details"
3. Tap "visit this website"
4. Tap "Visit Website" again to confirm

**Android Chrome:**
1. You'll see "Your connection is not private"
2. Tap "Advanced"
3. Tap "Proceed to [IP address] (unsafe)"

**Note:** This is safe for local development. The certificate is valid, just not from a public certificate authority.

## Troubleshooting

### Camera still not working?
- Make sure you're using HTTPS (the URL should start with `https://`)
- Check that your mobile device is on the same WiFi network
- Try restarting the dev server
- Clear your browser cache on mobile

### Can't connect from mobile?
- Check your firewall settings (port 3001 needs to be accessible)
- Make sure both devices are on the same network
- Try disabling VPN if you have one active

### Certificate errors?
- Make sure you ran `mkcert -install` first
- Regenerate certificates if needed
- On mobile, you may need to accept the security warning each time (this is normal for self-signed certificates)

## Alternative: Use ngrok (No SSL Setup Required)

If the above doesn't work, you can use ngrok:

1. Install ngrok: https://ngrok.com/download
2. Run your dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the HTTPS URL provided by ngrok on your mobile device

Ngrok automatically provides HTTPS and works from anywhere (not just local network).
