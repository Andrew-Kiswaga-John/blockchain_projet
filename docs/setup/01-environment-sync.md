# Part 01: Environment Preparation & File Synchronization

This guide covers setting up the WSL2 environment and moving the project files from Windows to Linux.

---

## 💻 Step 1: Verify Hyperledger Fabric
Before starting, ensure your professor has the Fabric binaries and samples installed in their WSL Ubuntu home directory.

1.  Open your **WSL Ubuntu Terminal**.
2.  Check the path:
    ```bash
    ls ~/hyperledger-fabric/fabric-samples
    ```
    *If this directory does not exist, the network scripts will fail. Please ensure the `bin` and `config` folders are present within `fabric-samples`.*

---

## 📁 Step 2: Create the Project Workspace
In the same WSL terminal, create a fresh directory for the Traffic Core project:

```bash
mkdir -p ~/traffic-core
```

---

## 🔄 Step 3: Copy Files from Windows to WSL
Since the project was likely cloned to a Windows directory, we need to move the blockchain-related components into the WSL file system for performance and compatibility.

> [!NOTE]
> The second channel is named **`emergency-ops`** for priority operations.

1.  Identify your **Windows Project Path** (e.g., `/mnt/c/Users/.../ATELIER1`).
2.  Run these exact commands in your **WSL Terminal**:

```bash
# Define your windows path (Change path to where you cloned the repo)
export WINDOWS_PROJECT="/mnt/c/Users/For/Documents/S3/BLOCKCHAIN/ATELIER1"

# Copy the Network components
cp -r $WINDOWS_PROJECT/network ~/traffic-core/

# Copy the Smart Contracts
cp -r $WINDOWS_PROJECT/chaincode ~/traffic-core/

# Copy the Backend logic
mkdir -p ~/traffic-core/application
cp -r $WINDOWS_PROJECT/application/backend ~/traffic-core/application/
```

---

## 🔑 Step 4: Fix Permissions
Linux requires explicit execution permissions for the automation scripts:

```bash
chmod +x ~/traffic-core/network/scripts/*.sh
```

---

## ✅ Next Step
Proceed to **[Part 02: Launching the Blockchain Network](02-blockchain-network.md)**.
