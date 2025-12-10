# 🚀 Traffic Core Blockchain Network - Complete Deployment Guide

## From Zero to Running Blockchain in 30 Minutes

**Last Updated:** December 10, 2025  
**Tested On:** Windows 11, WSL2 Ubuntu 22.04, Docker Desktop 27.4.0, Fabric 2.5.14  
**Difficulty Level:** Beginner-Friendly ✨

---

## 📋 Table of Contents

1. [What You'll Build](#what-youll-build)
2. [Prerequisites Setup](#prerequisites-setup)
   - [Part A: Install WSL2](#part-a-install-wsl2)
   - [Part B: Install Docker Desktop](#part-b-install-docker-desktop)
   - [Part C: Install Hyperledger Fabric Tools](#part-c-install-hyperledger-fabric-tools)
3. [Network Deployment (11 Steps)](#network-deployment)
4. [Verification & Testing](#verification-and-testing)
5. [Network Management](#network-management)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Next Steps: Phase 3](#next-steps-phase-3)

---

## 🎯 What You'll Build

You're about to deploy a **production-ready blockchain network** with:

- **6 Organizations**: Traffic Authority, Vehicle Operators, Infrastructure, Emergency Services, Parking, and Orderer Org
- **30 Containers**: 3 orderers, 10 peers, 10 databases, 6 certificate authorities, 1 CLI
- **2 Channels**: 
  - `city-traffic-global` - All 5 organizations share traffic data
  - `emergency-channel` - Emergency Services, Traffic Authority, Infrastructure only
- **RAFT Consensus**: 3-node fault-tolerant ordering service

**Visual Network Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│                  ORDERER CLUSTER (RAFT)                     │
│         orderer0      orderer1      orderer2                │
│         (Leader)      (Follower)    (Follower)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│ city-traffic-global │                  │ emergency-channel│
│  (5 Organizations) │                  │ (3 Organizations)│
└──────────────────┘                  └──────────────────┘
        ↓                                       ↓
┌─────────────────────────────────────────────────────────────┐
│  TrafficAuthority  │  VehicleOperator  │  Infrastructure   │
│   peer0, peer1     │   peer0, peer1    │   peer0, peer1    │
│  + 2 CouchDB + CA  │  + 2 CouchDB + CA │  + 2 CouchDB + CA │
├────────────────────┴───────────────────┴───────────────────┤
│  Emergency         │  Parking                               │
│   peer0, peer1     │   peer0, peer1                         │
│  + 2 CouchDB + CA  │  + 2 CouchDB + CA                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites Setup

### Part A: Install WSL2

**What is WSL2?** Windows Subsystem for Linux v2 - lets you run Linux on Windows.

#### Step A1: Enable WSL

1. **Open PowerShell as Administrator:**
   - Press `Windows + X`
   - Click "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command:**
   ```powershell
   wsl --install
   ```

3. **Restart your computer** (required!)
   - You'll see a prompt saying "Restart required"
   - Save all your work and restart

#### Step A2: Set Up Ubuntu

1. **After restart, Ubuntu will auto-install:**
   - A black window will appear saying "Installing Ubuntu..."
   - This takes 5-10 minutes
   - **Don't close this window!**

2. **Create your Linux username:**
   - When prompted: `Enter new UNIX username:`
   - Type a simple username (e.g., `andy`, `john`)
   - Press Enter

3. **Create your password:**
   - Type a password (you won't see it as you type - this is normal!)
   - Press Enter
   - Type it again to confirm
   - Press Enter

   > ⚠️ **Remember this password!** You'll need it later.

4. **Verify WSL is working:**
   ```powershell
   wsl --list --verbose
   ```
   
   **You should see:**
   ```
   NAME            STATE           VERSION
   Ubuntu-22.04    Running         2
   ```

   > ✅ **Checkpoint:** If you see "VERSION 2", you're good!

---

### Part B: Install Docker Desktop

**What is Docker?** Software that runs containers (isolated mini-computers).

#### Step B1: Download Docker

1. **Go to:** https://www.docker.com/products/docker-desktop/
2. **Click:** "Download for Windows"
3. **Wait for download** (about 500 MB)

#### Step B2: Install Docker

1. **Double-click** the downloaded file: `Docker Desktop Installer.exe`
2. **Check the box:** "Use WSL 2 instead of Hyper-V" (should be checked by default)
3. **Click:** "Ok"
4. **Wait 5-10 minutes** for installation
5. **Click:** "Close and restart"
6. **Your computer will restart again**

#### Step B3: Configure Docker

1. **After restart, Docker Desktop will start automatically**
   - You'll see the Docker whale icon in your system tray (bottom-right)
   - A window will open: "Docker Subscription Service Agreement"

2. **Accept the agreement:**
   - Scroll to bottom
   - Click "Accept"

3. **Skip the survey** (click "Skip" at the top-right)

4. **Enable WSL Integration:**
   - In Docker Desktop, click the gear icon (⚙️) at the top
   - Click "Resources" → "WSL Integration"
   - Toggle ON: "Enable integration with my default WSL distro"
   - Toggle ON: "Ubuntu-22.04"
   - Click "Apply & Restart"
   - Wait 1-2 minutes

#### Step B4: Verify Docker Works

1. **Open PowerShell** (doesn't need to be Admin this time)

2. **Test Docker in WSL:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "docker --version"
   ```

   **You should see:**
   ```
   Docker version 27.4.0, build bde2b89
   ```

3. **Test Docker can run containers:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "docker run hello-world"
   ```

   **You should see:**
   ```
   Hello from Docker!
   This message shows that your installation appears to be working correctly.
   ```

   > ✅ **Checkpoint:** If you see "Hello from Docker!", Docker is working!

---

### Part C: Install Hyperledger Fabric Tools

**What is Hyperledger Fabric?** The blockchain software we're using.

#### Step C1: Update Ubuntu Packages

```powershell
wsl -d Ubuntu-22.04 bash -c "sudo apt-get update && sudo apt-get install -y curl git"
```

- **Enter your Ubuntu password** when prompted
- **Wait 2-3 minutes**

#### Step C2: Download Fabric Binaries

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~ && curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh && ./install-fabric.sh binary"
```

**What this does:**
- Downloads Hyperledger Fabric tools
- Installs them in `~/fabric-samples/bin`
- Takes 3-5 minutes

**You'll see lots of text scrolling.** Wait until you see:
```
===> Done
```

#### Step C3: Set Up PATH

```powershell
wsl -d Ubuntu-22.04 bash -c "echo 'export PATH=\$HOME/fabric-samples/bin:\$PATH' >> ~/.bashrc && source ~/.bashrc"
```

#### Step C4: Verify Installation

```powershell
wsl -d Ubuntu-22.04 bash -c "~/fabric-samples/bin/peer version"
```

**You should see:**
```
peer:
 Version: 2.5.14
 ...
```

> ✅ **Checkpoint:** If you see "Version: 2.5.14", Fabric is installed!

---

## 🔨 Network Deployment

Now the fun part! We'll deploy your blockchain network in 11 easy steps.

### Step 1: Get the Project Files

**Option A: Using Git (Recommended)**

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~ && git clone https://github.com/Andrew-Kiswaga-John/blockchain_projet.git traffic-core"
```

**Option B: Manual Copy**

If you already have the files on Windows:

```powershell
# Copy from your Windows location to WSL
wsl -d Ubuntu-22.04 bash -c "mkdir -p ~/traffic-core"
```

Then copy the `network` folder from Windows to `\\wsl$\Ubuntu-22.04\home\YOUR_USERNAME\traffic-core\`

> Replace `YOUR_USERNAME` with the username you created in Part A.

#### Verify Files Are There

```powershell
wsl -d Ubuntu-22.04 bash -c "ls ~/traffic-core/network/scripts/"
```

**You should see:**
```
envVars.sh
network.sh
```

> ✅ **Checkpoint:** If you see these files, you're ready!

---

### Step 2: Set Up the Environment

#### Step 2a: Make Scripts Executable

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network && chmod +x scripts/*.sh"
```

#### Step 2b: Set FABRIC_CFG_PATH

```powershell
wsl -d Ubuntu-22.04 bash -c "echo 'export FABRIC_CFG_PATH=~/traffic-core/network/config' >> ~/.bashrc"
```

**Why?** This tells Fabric where to find configuration files.

#### Step 2c: Verify Environment

```powershell
wsl -d Ubuntu-22.04 bash -c "source ~/.bashrc && echo \$FABRIC_CFG_PATH"
```

**You should see:**
```
/home/YOUR_USERNAME/traffic-core/network/config
```

> ✅ **Checkpoint:** If you see the path, environment is ready!

---

### Step 3: Create Fabric Configuration

```powershell
wsl -d Ubuntu-22.04 bash -c "mkdir -p ~/traffic-core/network/config && cp ~/fabric-samples/config/core.yaml ~/traffic-core/network/config/ && cp ~/fabric-samples/config/orderer.yaml ~/traffic-core/network/config/"
```

**What this does:**
- Creates a `config` folder
- Copies default Fabric configuration files
- These files tell peers and orderers how to behave

#### Verify Config Files

```powershell
wsl -d Ubuntu-22.04 bash -c "ls ~/traffic-core/network/config/"
```

**You should see:**
```
core.yaml
orderer.yaml
```

> ✅ **Checkpoint:** If you see these files, configuration is ready!

---

### Step 4: Configure Hostnames

**Why?** Containers need to find each other by name, not just `localhost`.

```powershell
wsl -d Ubuntu-22.04 bash -c "sudo bash -c 'cat >> /etc/hosts << EOF

# Hyperledger Fabric Traffic Core Network
127.0.0.1 orderer0.example.com
127.0.0.1 orderer1.example.com
127.0.0.1 orderer2.example.com
127.0.0.1 peer0.trafficauthority.example.com
127.0.0.1 peer1.trafficauthority.example.com
127.0.0.1 peer0.vehicleoperator.example.com
127.0.0.1 peer1.vehicleoperator.example.com
127.0.0.1 peer0.infrastructure.example.com
127.0.0.1 peer1.infrastructure.example.com
127.0.0.1 peer0.emergency.example.com
127.0.0.1 peer1.emergency.example.com
127.0.0.1 peer0.parking.example.com
127.0.0.1 peer1.parking.example.com
EOF
'"
```

- **Enter your Ubuntu password** when prompted

#### Verify Hostnames

```powershell
wsl -d Ubuntu-22.04 bash -c "grep 'trafficauthority' /etc/hosts"
```

**You should see:**
```
127.0.0.1 peer0.trafficauthority.example.com
127.0.0.1 peer1.trafficauthority.example.com
```

> ✅ **Checkpoint:** If you see these lines, hostnames are configured!

---

### Step 5: Generate Crypto Materials

**What are crypto materials?** Certificates and keys that identify organizations and secure communication.

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh clean"
```

**This command:**
- Cleans up any old network data
- Generates fresh certificates for all 6 organizations
- Creates identities for orderers, peers, admins, and users
- Takes 30-60 seconds

**You'll see lots of output like:**
```
Creating Org1 Identities
Enrolling the CA admin
...
```

**Wait until you see:**
```
>>> Cleanup complete! Old network removed.
```

> ⏱️ **This takes 30-60 seconds**

> ✅ **Checkpoint:** Look for "Cleanup complete!" message

---

### Step 6: Start the Network Containers

**Now we'll start 30 Docker containers!**

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh up"
```

**This command starts:**
- 3 Orderers (ordering service)
- 6 Certificate Authorities (one per org)
- 10 Peers (2 per organization)
- 10 CouchDB databases (one per peer)
- 1 CLI container (for running commands)

**You'll see:**
```
[+] Running 30/30
✔ Container orderer0.example.com    Started
✔ Container orderer1.example.com    Started
✔ Container orderer2.example.com    Started
✔ Container ca_orderer              Started
✔ Container ca_trafficauthority     Started
...
>>> Network started successfully!
```

> ⏱️ **This takes 2-3 minutes**

#### Verify All Containers Are Running

```powershell
wsl -d Ubuntu-22.04 bash -c "docker ps --format 'table {{.Names}}\t{{.Status}}' | head -35"
```

**You should see 30 containers, all with "Up" status:**
```
NAMES                                STATUS
cli                                  Up X seconds
peer0.trafficauthority.example.com   Up X seconds
peer1.trafficauthority.example.com   Up X seconds
...
```

#### Count Containers

```powershell
wsl -d Ubuntu-22.04 bash -c "docker ps | wc -l"
```

**You should see:** `31` (30 containers + 1 header line)

> ✅ **Checkpoint:** If you see 30 containers all showing "Up", network is running!

---

### Step 7: Create Channels

**What are channels?** Private "subnetworks" where specific organizations can transact.

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh createChannel"
```

**This creates:**
- `city-traffic-global` - For all 5 organizations
- `emergency-channel` - For Emergency, Traffic Authority, Infrastructure only

**You'll see:**
```
>>> Creating channels...
INFO: Creating city-traffic-global channel...
...
INFO: Creating emergency-channel...
...
>>> Channels created successfully!
```

> ⏱️ **This takes 10-15 seconds**

> ✅ **Checkpoint:** Look for "Channels created successfully!"

---

### Step 8: Join Peers to Channels

**Now we connect each peer to its channels.**

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh joinChannel"
```

**This joins:**
- All 10 peers to `city-traffic-global`
- 6 peers (Emergency, Traffic Authority, Infrastructure) to `emergency-channel`

**You'll see:**
```
>>> Joining peers to channels...
INFO: Joining peers to city-traffic-global channel...
Using organization: TrafficAuthority, peer0
...
Successfully submitted proposal to join channel
...
>>> Peers joined to channels successfully!
```

> ⏱️ **This takes 30-40 seconds**

> ✅ **Checkpoint:** Look for "Peers joined to channels successfully!"

---

### Step 9: Update Anchor Peers

**What are anchor peers?** Special peers that help organizations find each other across the network.

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh updateAnchorPeers"
```

**This configures:**
- One anchor peer per organization on each channel
- Enables cross-organization communication

**You'll see:**
```
>>> Updating anchor peers...
INFO: Updating anchor peers for city-traffic-global...
...
Successfully submitted channel update
...
>>> Anchor peers updated successfully!
```

> ⏱️ **This takes 15-20 seconds**

> ✅ **Checkpoint:** Look for "Anchor peers updated successfully!"

---

### Step 10: Verify Network Status

Let's check that everything is working!

#### Test 1: Check Container Count

```powershell
wsl -d Ubuntu-22.04 bash -c "docker ps --format '{{.Names}}' | wc -l"
```

**Expected:** `30`

#### Test 2: Check Channels

```powershell
wsl -d Ubuntu-22.04 bash -c "docker exec peer0.trafficauthority.example.com peer channel list"
```

**Expected output:**
```
Channels peers has joined:
city-traffic-global
emergency-channel
```

#### Test 3: Check city-traffic-global

```powershell
wsl -d Ubuntu-22.04 bash -c "docker exec peer0.trafficauthority.example.com peer channel getinfo -c city-traffic-global"
```

**Expected output:**
```
Blockchain info: {"height":6,"currentBlockHash":"...","previousBlockHash":"..."}
```

**Height should be 6 or higher.**

#### Test 4: Check emergency-channel

```powershell
wsl -d Ubuntu-22.04 bash -c "docker exec peer0.trafficauthority.example.com peer channel getinfo -c emergency-channel"
```

**Expected output:**
```
Blockchain info: {"height":4,"currentBlockHash":"...","previousBlockHash":"..."}
```

**Height should be 4 or higher.**

#### Test 5: Check Health Endpoint

```powershell
wsl -d Ubuntu-22.04 bash -c "curl -s http://localhost:9446/healthz"
```

**Expected output:**
```
{"status":"OK","time":"2025-12-10T..."}
```

#### Test 6: Check CouchDB

```powershell
wsl -d Ubuntu-22.04 bash -c "curl -s http://localhost:5984/_up"
```

**Expected output:**
```
{"status":"ok","seeds":{}}
```

> ✅ **Checkpoint:** If all 6 tests pass, your network is fully operational!

---

### Step 11: Final Success Confirmation

If you made it here, **CONGRATULATIONS! 🎉**

Run this final command to see your network summary:

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && echo '========================================' && echo 'TRAFFIC CORE NETWORK - DEPLOYMENT STATUS' && echo '========================================' && echo '' && echo 'Containers:' && docker ps --format 'table {{.Names}}\t{{.Status}}' | head -10 && echo '...(20 more containers)' && echo '' && echo 'Channels:' && docker exec peer0.trafficauthority.example.com peer channel list 2>&1 | grep -A 10 'Channels peers' && echo '' && echo '========================================' && echo 'STATUS: ✅ NETWORK FULLY OPERATIONAL' && echo '========================================'"
```

---

## ✅ Verification and Testing

### Quick Health Check Script

Save this as a quick test whenever you want to check network health:

```powershell
# Save this in a file called test-network.ps1
wsl -d Ubuntu-22.04 bash -c "
echo '===================================='
echo 'Network Health Check'
echo '===================================='
echo ''
echo 'Test 1: Container Count'
COUNT=\$(docker ps | wc -l)
if [ \$COUNT -eq 31 ]; then 
  echo '  ✓ PASS - 30 containers running'
else 
  echo '  ✗ FAIL - Expected 30, found '\$((COUNT-1))
fi
echo ''
echo 'Test 2: Peer Health'
curl -s http://localhost:9446/healthz | grep -q 'OK' && echo '  ✓ PASS - Peers healthy' || echo '  ✗ FAIL'
echo ''
echo 'Test 3: CouchDB'
curl -s http://localhost:5984/_up | grep -q 'ok' && echo '  ✓ PASS - CouchDB accessible' || echo '  ✗ FAIL'
echo ''
echo 'Test 4: Channels'
CHANNELS=\$(docker exec peer0.trafficauthority.example.com peer channel list 2>&1 | grep -c 'channel')
if [ \$CHANNELS -eq 2 ]; then
  echo '  ✓ PASS - Both channels active'
else
  echo '  ✗ FAIL - Channel issue'
fi
echo ''
echo '===================================='
"
```

**Run it:**
```powershell
.\test-network.ps1
```

---

## 🎛️ Network Management

### Essential Commands

#### Stop the Network (Keeps Data)

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh down"
```

**When to use:** End of day, need to free up resources

#### Start the Network (After Stopping)

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh up"
```

**Note:** Channels and data persist. You don't need to recreate channels.

#### Complete Reset (Deletes Everything)

```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh clean"
```

**When to use:** Start completely fresh, fix major issues

**After clean, you must run:**
1. `./network.sh up`
2. `./network.sh createChannel`
3. `./network.sh joinChannel`
4. `./network.sh updateAnchorPeers`

#### View Logs

**View logs for a specific container:**
```powershell
wsl -d Ubuntu-22.04 bash -c "docker logs peer0.trafficauthority.example.com"
```

**Follow logs in real-time:**
```powershell
wsl -d Ubuntu-22.04 bash -c "docker logs -f peer0.trafficauthority.example.com"
```

Press `Ctrl+C` to stop following.

#### Monitor Resource Usage

```powershell
wsl -d Ubuntu-22.04 bash -c "docker stats --no-stream"
```

---

## 🔧 Troubleshooting Guide

### Problem 1: "wsl: command not found"

**Cause:** WSL not installed or not in PATH

**Solution:**
1. Open PowerShell as Admin
2. Run: `wsl --install`
3. Restart computer
4. Try again

---

### Problem 2: "Cannot connect to Docker daemon"

**Symptoms:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solution:**
1. **Check Docker Desktop is running:**
   - Look for Docker whale icon in system tray
   - If not there, start Docker Desktop from Start Menu

2. **Enable WSL Integration:**
   - Open Docker Desktop
   - Settings → Resources → WSL Integration
   - Enable "Ubuntu-22.04"
   - Click "Apply & Restart"

3. **Restart WSL:**
   ```powershell
   wsl --shutdown
   wsl -d Ubuntu-22.04
   ```

---

### Problem 3: Containers Not Starting

**Symptoms:**
```
[+] Running 5/30
...
Error: timeout
```

**Solution:**

1. **Increase Docker Resources:**
   - Docker Desktop → Settings → Resources
   - Memory: Set to at least **4 GB** (8 GB recommended)
   - CPUs: Set to at least **2** (4 recommended)
   - Click "Apply & Restart"

2. **Clean and retry:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh down && docker system prune -f && ./network.sh up"
   ```

---

### Problem 4: "Permission Denied" Errors

**Symptoms:**
```
bash: ./network.sh: Permission denied
```

**Solution:**
```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network && chmod +x scripts/*.sh"
```

---

### Problem 5: "Cannot Find Crypto Materials"

**Symptoms:**
```
Error: failed to create deliver client: orderer client failed to connect
```

**Solution:**

1. **Regenerate crypto materials:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh clean && ./network.sh up"
   ```

2. **Recreate channels:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh createChannel && ./network.sh joinChannel && ./network.sh updateAnchorPeers"
   ```

---

### Problem 6: "Channel Already Exists"

**Symptoms:**
```
Error: got unexpected status: BAD_REQUEST -- error authorizing update
```

**Solution:**

**Option A - Join existing channel:**
```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh joinChannel"
```

**Option B - Start fresh:**
```powershell
wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && ./network.sh clean && ./network.sh up && ./network.sh createChannel && ./network.sh joinChannel && ./network.sh updateAnchorPeers"
```

---

### Problem 7: "Port Already in Use"

**Symptoms:**
```
Error: Bind for 0.0.0.0:7050 failed: port is already allocated
```

**Solution:**

1. **Find what's using the port:**
   ```powershell
   netstat -ano | findstr :7050
   ```

2. **Kill the process** (replace XXXX with the PID from above):
   ```powershell
   taskkill /F /PID XXXX
   ```

3. **Or restart Docker:**
   - Right-click Docker Desktop icon
   - Click "Restart"

---

### Problem 8: "Connection Refused to Orderer"

**Symptoms:**
```
Error: failed to create deliver client: orderer client failed to connect
```

**Solution:**

1. **Check hostnames are configured:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "grep 'orderer0' /etc/hosts"
   ```

   Should show: `127.0.0.1 orderer0.example.com`

2. **If missing, add hostnames (Step 4 above)**

3. **Restart orderers:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "docker restart orderer0.example.com orderer1.example.com orderer2.example.com"
   ```

---

### Problem 9: Slow Performance

**Symptoms:**
- Commands take forever
- High CPU usage
- Docker Desktop using lots of RAM

**Solution:**

1. **Close other applications**

2. **Increase Docker resources:**
   - Docker Desktop → Settings → Resources
   - Memory: **6-8 GB**
   - CPUs: **4**

3. **Limit logging:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "export FABRIC_LOGGING_SPEC=ERROR"
   ```

---

### Problem 10: "File Not Found" Errors

**Symptoms:**
```
./network.sh: No such file or directory
```

**Solution:**

1. **Verify you're in the right directory:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "pwd"
   ```

   Should show: `/home/YOUR_USERNAME/traffic-core/network/scripts`

2. **If not, navigate there:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "cd ~/traffic-core/network/scripts && pwd"
   ```

3. **Check files exist:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "ls ~/traffic-core/network/scripts/"
   ```

---

## 📊 Port Reference

When you need to access services from Windows applications:

| Service | Port | URL |
|---------|------|-----|
| **Orderers** |
| orderer0 | 7050 | grpcs://localhost:7050 |
| orderer1 | 8050 | grpcs://localhost:8050 |
| orderer2 | 9050 | grpcs://localhost:9050 |
| **Traffic Authority** |
| peer0 | 7051 | grpcs://localhost:7051 |
| peer0 (operations) | 9446 | http://localhost:9446 |
| peer1 | 8051 | grpcs://localhost:8051 |
| peer1 (operations) | 9447 | http://localhost:9447 |
| CA | 8054 | https://localhost:8054 |
| CouchDB peer0 | 5984 | http://localhost:5984 |
| CouchDB peer1 | 6984 | http://localhost:6984 |
| **Vehicle Operator** |
| peer0 | 9051 | grpcs://localhost:9051 |
| peer0 (operations) | 9448 | http://localhost:9448 |
| peer1 | 10051 | grpcs://localhost:10051 |
| peer1 (operations) | 9449 | http://localhost:9449 |
| CA | 9054 | https://localhost:9054 |
| CouchDB peer0 | 7984 | http://localhost:7984 |
| CouchDB peer1 | 8984 | http://localhost:8984 |
| **Infrastructure** |
| peer0 | 11051 | grpcs://localhost:11051 |
| peer0 (operations) | 9450 | http://localhost:9450 |
| peer1 | 12051 | grpcs://localhost:12051 |
| peer1 (operations) | 9451 | http://localhost:9451 |
| CA | 10054 | https://localhost:10054 |
| CouchDB peer0 | 9984 | http://localhost:9984 |
| CouchDB peer1 | 10984 | http://localhost:10984 |
| **Emergency** |
| peer0 | 13051 | grpcs://localhost:13051 |
| peer0 (operations) | 9452 | http://localhost:9452 |
| peer1 | 14051 | grpcs://localhost:14051 |
| peer1 (operations) | 9453 | http://localhost:9453 |
| CA | 11054 | https://localhost:11054 |
| CouchDB peer0 | 11984 | http://localhost:11984 |
| CouchDB peer1 | 12984 | http://localhost:12984 |
| **Parking** |
| peer0 | 15051 | grpcs://localhost:15051 |
| peer0 (operations) | 9454 | http://localhost:9454 |
| peer1 | 16051 | grpcs://localhost:16051 |
| peer1 (operations) | 9455 | http://localhost:9455 |
| CA | 12054 | https://localhost:12054 |
| CouchDB peer0 | 13984 | http://localhost:13984 |
| CouchDB peer1 | 14984 | http://localhost:14984 |

---

## 🚀 Next Steps: Phase 3

### What's Next?

Now that your network is running, you're ready for **Phase 3: Smart Contract Development!**

In Phase 3, you'll:
1. **Create chaincode (smart contracts)** in JavaScript/TypeScript
2. **Package and install chaincode** on peers
3. **Deploy to channels** (city-traffic-global & emergency-channel)
4. **Invoke transactions** to record traffic data
5. **Query the ledger** to retrieve blockchain data

### Chaincode We'll Build

**1. Traffic Contract (`traffic-contract`)**
- Record vehicle counts at intersections
- Update traffic light status
- Log congestion levels
- Query real-time traffic statistics

**2. Emergency Contract (`emergency-contract`)**
- Create priority alerts for emergency vehicles
- Request optimized routes
- Track emergency vehicle locations
- Coordinate between Emergency Services and Traffic Authority

### Prerequisites for Phase 3

✅ Network deployed and running (you just did this!)  
✅ All 30 containers healthy  
✅ Both channels created and operational  
✅ All peers joined to their respective channels  

### Phase 3 Readiness Check

Run this command to confirm you're ready:

```powershell
wsl -d Ubuntu-22.04 bash -c "
echo '========================================
'
echo 'PHASE 3 READINESS CHECK'
echo '========================================'
echo ''
CONTAINERS=\$(docker ps | wc -l)
if [ \$CONTAINERS -eq 31 ]; then
  echo '✅ Containers: 30/30 running'
else
  echo '❌ Containers: Only '\$((CONTAINERS-1))'/30 running'
fi
CHANNELS=\$(docker exec peer0.trafficauthority.example.com peer channel list 2>&1 | grep -c channel)
if [ \$CHANNELS -eq 2 ]; then
  echo '✅ Channels: 2/2 operational'
else
  echo '❌ Channels: Issue detected'
fi
curl -s http://localhost:9446/healthz | grep -q OK && echo '✅ Peer Health: OK' || echo '❌ Peer Health: Failed'
curl -s http://localhost:5984/_up | grep -q ok && echo '✅ CouchDB: OK' || echo '❌ CouchDB: Failed'
echo ''
echo '========================================'
echo 'Ready for Phase 3: Chaincode Development'
echo '========================================'
"
```

**If all checks show ✅, you're ready to move forward!**

---

## 📚 Additional Resources

### Documentation
- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Docker Documentation](https://docs.docker.com/)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)

### Your Project Files
- **This Guide:** `docs/deployment-guide.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN.md`
- **Network Scripts:** `network/scripts/`
- **Docker Configs:** `network/docker/`

### Getting Help

**If you encounter issues not covered in this guide:**

1. **Check logs:**
   ```powershell
   wsl -d Ubuntu-22.04 bash -c "docker logs CONTAINER_NAME"
   ```

2. **Search error messages** in the Hyperledger Fabric documentation

3. **Review the troubleshooting section** above

---

## 🎓 Congratulations!

You've successfully deployed a **production-grade blockchain network** with:

- ✅ 6 organizations with independent identities
- ✅ 30 Docker containers running in harmony
- ✅ 2 private channels for different data sharing needs
- ✅ Fault-tolerant RAFT consensus with 3 orderers
- ✅ High availability with 2 peers per organization
- ✅ State databases (CouchDB) for each peer
- ✅ Complete PKI infrastructure with 6 Certificate Authorities

### Network Statistics

| Component | Count | Status |
|-----------|-------|--------|
| Organizations | 6 | ✅ Active |
| Channels | 2 | ✅ Operational |
| Peers | 10 | ✅ Running |
| Orderers | 3 | ✅ Running |
| Databases | 10 | ✅ Connected |
| CAs | 6 | ✅ Issuing Certs |
| **Total Containers** | **30** | **✅ Healthy** |

---

**You're now ready to develop and deploy smart contracts in Phase 3!** 🚀

---

*Document Version: 2.0*  
*Last Updated: December 10, 2025*  
*Status: Production Ready ✅*
