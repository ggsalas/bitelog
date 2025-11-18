# Production Deployment with Cloudflare Tunnel

This guide explains how to run bitelog in production mode and expose it externally using Cloudflare Tunnel.

## Prerequisites

1. **Ollama running locally** on `localhost:11434`
2. **Node.js** installed
3. **cloudflared** installed (see installation below)

---

## Quick Start (Easiest Method)

```bash
# 1. Install cloudflared (one-time setup)
# Linux:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS:
brew install cloudflared

# 2. Build and run with tunnel
npm run build
npm run start:tunnel
```

This will:
- Build the production version
- Start Next.js on `localhost:3000`
- Create a public Cloudflare Tunnel URL (e.g., `https://abc-123.trycloudflare.com`)

**Access from your phone:** Use the URL shown in the terminal.

---

## Manual Step-by-Step

### Step 1: Build Production Version

```bash
npm run build
```

This creates an optimized production build in `.next/`

### Step 2: Start Production Server

```bash
npm start
```

Server runs on `http://localhost:3000`

### Step 3: Create Cloudflare Tunnel

**In a new terminal:**

```bash
cloudflared tunnel --url http://localhost:3000
```

You'll see:
```
Your quick Tunnel has been created! Visit it at:
https://random-words-123.trycloudflare.com
```

### Step 4: Access from Any Device

- Copy the `https://` URL from the terminal
- Open it on your phone, tablet, or any device
- Camera permissions will be requested when you visit `/scan`

---

## How It Works

```
Mobile Device (anywhere)
    ↓ HTTPS
Cloudflare Tunnel (public internet)
    ↓
Your Next.js App (localhost:3000)
    ↓
Ollama Vision Model (localhost:11434)
```

**Security:**
- Only your Next.js app is exposed
- Ollama stays local (not accessible from internet)
- Server Actions run on your machine, calling Ollama locally
- Cloudflare provides automatic HTTPS

---

## Advanced: Named Tunnel (Persistent URL)

If you want a **permanent URL** that doesn't change:

### 1. Login to Cloudflare

```bash
cloudflared tunnel login
```

Select your Cloudflare domain in the browser.

### 2. Create Named Tunnel

```bash
cloudflared tunnel create bitelog
```

Note the **Tunnel ID** shown in the output.

### 3. Create Config File

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: /home/YOUR_USERNAME/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: bitelog.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### 4. Route DNS

```bash
cloudflared tunnel route dns bitelog bitelog.yourdomain.com
```

### 5. Run Named Tunnel

```bash
# Start Next.js
npm start

# In another terminal
cloudflared tunnel run bitelog
```

Your app is now available at `https://bitelog.yourdomain.com`

---

## Production vs Development

| Feature | Development (`npm run dev`) | Production (`npm start`) |
|---------|----------------------------|--------------------------|
| Build | On-demand compilation | Pre-compiled, optimized |
| Performance | Slower (hot reload) | Fast (static assets) |
| File size | Larger | Minified |
| Debugging | Source maps, verbose | Minimal logging |
| Auto-reload | Yes | No (restart needed) |

---

## Troubleshooting

### Tunnel shows 502 Bad Gateway
- Ensure Next.js is running on port 3000
- Check: `curl http://localhost:3000` should return HTML

### Camera doesn't work on mobile
- Ensure you're using HTTPS (Cloudflare Tunnel provides this)
- Check browser permissions for camera access
- Try a different browser (Chrome/Safari recommended)

### Ollama connection fails
- Verify Ollama is running: `curl http://localhost:11434/api/version`
- Check model is available: `ollama list`
- Server Actions run on your server, not the client

### Tunnel URL changes every time
- Use **Named Tunnel** method for persistent URLs
- Quick Tunnel URLs are temporary by design

---

## Keeping It Running

### Using tmux (Recommended)

```bash
# Install tmux
sudo apt install tmux  # Linux
brew install tmux      # macOS

# Create session
tmux new -s bitelog

# Run your app
npm start

# Detach: Press Ctrl+B, then D
# Reattach: tmux attach -t bitelog
```

### Using screen

```bash
# Start screen
screen -S bitelog

# Run your app
npm start

# Detach: Press Ctrl+A, then D
# Reattach: screen -r bitelog
```

### Using pm2 (Process Manager)

```bash
# Install pm2
npm install -g pm2

# Start Next.js
pm2 start npm --name "bitelog" -- start

# Start Cloudflare Tunnel
pm2 start cloudflared --name "tunnel" -- tunnel --url http://localhost:3000

# View status
pm2 status

# View logs
pm2 logs

# Auto-restart on server reboot
pm2 startup
pm2 save
```

---

## Cost

**Cloudflare Tunnel:** FREE
- No bandwidth limits
- No time limits
- Automatic HTTPS
- DDoS protection included

---

## Next Steps

1. **Test locally first:** `npm run dev`
2. **Build production:** `npm run build`
3. **Test production locally:** `npm start` → visit `http://localhost:3000`
4. **Expose with tunnel:** `npm run start:tunnel`
5. **Access from phone:** Use the Cloudflare URL

---

## Security Notes

- Cloudflare Tunnel doesn't expose your IP address
- All traffic is encrypted (HTTPS)
- You can add Cloudflare Access for authentication
- Ollama runs locally and is never exposed
- Consider rate limiting if publicly sharing

---

## Useful Commands

```bash
# Full restart
pkill -f next && npm start

# Check what's running on port 3000
lsof -i :3000

# Test Ollama locally
curl http://localhost:11434/api/version

# View Next.js production logs
npm start 2>&1 | tee bitelog.log

# Stop all processes
pkill -f "next start"
pkill -f cloudflared
```
