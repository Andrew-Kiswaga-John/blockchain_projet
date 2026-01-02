# 🏙️ Smart City Command Center - Frontend Architecture

We are moving from a "Basic Prototype" to a **"Professional Security Operation Center (SOC)"**.

## 🎨 Theme & Aesthetic
*   **Style**: Cyberpunk / Sci-Fi / Glassmorphism.
*   **Palette**: Dark Backgrounds (`#0f172a`), Neon Accents (Blue for Info, Red for Alerts, Green for Consensus).
*   **Vibe**: Similar to a spaceship dashboard or a city monitoring room.

---

## 🏗️ Structure: The "Command Center" Layout
We will split the app into a **Dashboard Layout** with a permanent Sidebar.

### 📍 1. The Global Sidebar (Navigation)
Always visible on the left. Contains icons for:
*   📊 **Dashboard**: High-level stats & Live Map.
*   🚦 **Traffic Controls**: Manage lights and intersections manually.
*   ⚔️ **Attack Simulator**: The "Hacker" panel to launch attacks.
*   📜 **Blockchain Ledger**: A live, scrolling feed of ALL transactions (accepted & rejected).
*   🛡️ **SOC Alerts**: The message inbox from the AI Agents.

---

## 🚀 Page-by-Page Breakdown

### 🏠 Page 1: The "Overwatch" (Dashboard)
*   **Main View**: A dark Mapbox/Leaflet map.
*   **Overlays**: 
    *   Live Cars moving (from `vehicle-simulator`).
    *   Traffic Lights changing color in real-time.
*   **Widgets**:
    *   "Network Health": TPS (Transactions Per Second) gauge.
    *   "Active Nodes": Peer status (Green/Red dots).

### ⚔️ Page 2: The "War Room" (Attack Simulator)
*   **Concept**: A control panel that looks like a launchpad.
*   **Features**:
    *   **Attack Cards**: 4 distinct cards for our 4 simulations.
        *   😈 **Lying Sensor** ("Launch" button) -> Triggers `lyingSensor.js`
        *   🎭 **Imposter** ("Launch" button) -> Triggers `imposterHack.js`
        *   🏎️ **Race Condition** ("Launch" button) -> Triggers `conflict.js`
        *   🕴️ **Traitor** ("Launch" button) -> Triggers `traitor.js`
    *   **Live Console**: A terminal-like window showing the *stdout* of the attack script in real-time.

### 📜 Page 3: The "Immutable Truth" (Blockchain Inspector)
*   **Concept**: A matrix-style scrolling feed.
*   **Features**:
    *   **Left Column**: "Valid Blocks" (Green). Shows successful transactions.
    *   **Right Column**: "Rejected Requests" (Red). Shows attacks blocked by the policy.
    *   **Detail View**: Clicking a block expands it to show the JSON payload and the **MSP Signature**.

### 🛡️ Page 4: The "AI Guardian" (SOC Interface)
*   **Concept**: A chat interface with the AI.
*   **Features**:
    *   **Inbox**: List of alerts from `socService.js`.
    *   **Analysis View**: Large text area showing Mistral 7B's analysis.
    *   **Action Buttons**: "Email Supervisor", "Shut Down Intersection", "Flag MSP".

---

## 🛠️ Technical Stack Upgrades
1.  **Routing**: `react-router-dom` for proper page navigation.
2.  **State**: `Zustand` or `Context API` to share the "Live Stream" data across pages.
3.  **Visuals**: `framer-motion` for smooth entry animations (e.g., Attack console sliding up).
4.  **Icons**: `lucide-react` for modern, clean icons.

This architecture proves we aren't just "showing buttons"—we are building a **comprehensive monitoring tool** that visualizes the entire lifecycle of a transaction, from the vehicle to the blockchain, to the AI, and finally to the user.
