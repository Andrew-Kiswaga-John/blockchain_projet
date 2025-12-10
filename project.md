2025/2026 Master IASD - Blockchain
Pr. Ikram BEN ABDEL OUAHAB 

PROJET : BLOCKCHAIN POUR LA GESTION DÉCENTRALISÉE DES RESSOURCES DANS UNE SMART CITY 

CONTEXTE GÉNÉRAL DU PROJET
Les villes intelligentes (Smart Cities) reposent sur la collecte, le traitement et la coordination de grandes quantités de données urbaines (trafic, énergie, sécurité, mobilité...). Cependant, la centralisation de ces services pose des problèmes de sécurité, de transparence et de fiabilité.


Ce projet vise à concevoir un simulateur de Smart City décentralisée, où la blockchain assure la coordination, la validation et la traçabilité des interactions entre les différents services urbains. Chaque groupe développera un sous-projet indépendant, interconnecté à une blockchain commune déployée sur Hyperledger Fabric.


OBJECTIF GLOBAL
Créer un environnement de simulation dans lequel plusieurs modules de la Smart City (trafic, stationnement, énergie, urgences...) communiquent à travers la blockchain.

Chaque sous-projet devra :

Concevoir des smart contracts ou une logique transactionnelle propre à son domaine.

Expérimenter une modification interne de la blockchain (consensus, fonction de hachage, structure des blocs...).

Fournir une démonstration fonctionnelle du module simulé.

Visualiser les transactions en temps réel : réservations, paiements, allocations de ressources (via le simulateur ou le Dashboard).

Fournir une interface comme simulateur ou tableau de bord pour visualiser la smart city.

Simuler la violation des règles de la blockchain, comme la falsification de données, ou le non-respect des règles du consensus utilisé (ex. attaque relative aux consensus, fonctions de hachage, etc.).

RÉPARTITION EN SOUS-PROJETS 

SOUS-PROJET 1 : TRAFFIC CORE 

Concevoir le cœur de la simulation du trafic : routes, intersections, véhicules.

Représenter les mouvements et mises à jour via des transactions sur la blockchain.

Permettre l'ajustement du nombre de véhicules, routes et croisements.


Expérimentation : Expérimenter 2 nouveaux mécanismes de consensus (ex. PBFT modifié, PoA, consensus par vote temporel).

Comparer la performance de ces consensus avec des métriques bien déterminées.

---

## TRAFFIC CORE - DETAILED ARCHITECTURE

### Network Configuration
- **Environment**: Hyperledger Fabric (installed in ~/hyperledger-fabric on Ubuntu-22.04 via WSL)
- **Development**: Windows with WSL integration
- **Chaincode Language**: JavaScript
- **Channels**: 2
- **Organizations**: 5 peer organizations + 1 orderer organization
- **Minimum Peers**: 2 per organization

### Organizations Structure

#### 🟦 1. Traffic Authority
**Role**: Manager of global traffic rules + governance
**Components**:
- 2 Peers (peer0, peer1)
- Certificate Authority (CA)
- Admin API for traffic rules
- Event listeners for anomalies
**Responsibilities**:
- Define and enforce traffic regulations
- Monitor network-wide traffic conditions
- Validate policy compliance
- Coordinate with all organizations

#### 🟧 2. Vehicle Operator
**Role**: Represents vehicles, taxis, scooters, buses, etc.
**Components**:
- 2 Peers (peer0, peer1)
- CA for vehicles/agents
- Node.js SDK for simulation
**Responsibilities**:
- Register and manage vehicle identities
- Submit vehicle position updates
- Process route requests
- Handle vehicle state transitions

#### 🟩 3. Infrastructure Operator
**Role**: Road sensors, cameras, IoT gateways
**Components**:
- 2 Peers (peer0, peer1)
- IoT gateway simulator
- Event publishing logic
**Responsibilities**:
- Monitor road conditions via sensors
- Publish traffic density data
- Manage intersection states
- Report infrastructure status

#### 🟥 4. Emergency Services
**Role**: Privileged operations (priority lanes, alerts)
**Components**:
- 2 Peers (peer0, peer1)
- Emergency API
- Audit logs
**Responsibilities**:
- Issue emergency route requests
- Clear priority lanes
- Broadcast urgent alerts
- Maintain incident records

#### 🟫 5. Parking Management
**Role**: Handles parking reservations + slots
**Components**:
- 2 Peers (peer0, peer1)
- Parking smart contract (micro-reservation logic)
**Responsibilities**:
- Manage parking spot availability
- Process parking reservations
- Handle parking payments
- Coordinate with traffic flow

#### 🟪 6. OrdererOrg (Raft Consensus)
**Role**: Runs RAFT cluster (ordering service)
**Components**:
- orderer0.example.com
- orderer1.example.com
- orderer2.example.com
**Responsibilities**:
- Order transactions into blocks
- Maintain consensus across network
- Ensure fault tolerance

### Channel Architecture

#### 🌍 Channel 1: city-traffic-global (Main Channel)
**Purpose**: Global traffic state management
**Members**:
- Traffic Authority
- Vehicle Operator
- Infrastructure Operator
- Emergency Services
- Parking Management

**Consensus**: RAFT (using OrdererOrg)

**Data Types**:
- Vehicle positions and movements
- Traffic density metrics
- Intersection states (red/yellow/green)
- Congestion events
- Accident reports
- Global traffic rules and policies

**Chaincode Functions**:
- `registerVehicle(vehicleId, type, owner)`
- `updateVehiclePosition(vehicleId, latitude, longitude, timestamp)`
- `updateIntersectionState(intersectionId, state, duration)`
- `reportTrafficDensity(roadId, density, timestamp)`
- `queryVehiclesByArea(latitude, longitude, radius)`
- `queryIntersectionState(intersectionId)`
- `reportCongestion(roadId, level, timestamp)`

#### 🚨 Channel 2: emergency-channel (Priority Channel)
**Purpose**: High-priority emergency operations
**Members**:
- Emergency Services (admin)
- Traffic Authority
- Infrastructure Operator

**Consensus**: RAFT (can be modified for experimentation)

**Data Types**:
- Emergency incidents
- Priority route reservations
- Traffic controller override commands
- Emergency vehicle locations
- Alert broadcasts

**Chaincode Functions**:
- `createEmergencyIncident(incidentId, type, location, priority)`
- `requestPriorityRoute(vehicleId, origin, destination)`
- `overrideTrafficSignal(intersectionId, state, duration)`
- `broadcastEmergencyAlert(message, area, level)`
- `clearPriorityRoute(routeId)`
- `queryActiveIncidents(area)`

### Dashboard Features
**Technology Stack**: Web-based (React/Vue.js + Node.js backend)

**Map Integration**: 
- **Option 1**: Mapbox GL JS (realistic, customizable)
- **Option 2**: Leaflet with OpenStreetMap
- **Option 3**: Google Maps API

**Real-time Visualization**:
- Vehicle positions with real-time updates
- Traffic density heatmap
- Intersection signal states
- Emergency incidents markers
- Parking availability indicators
- Route visualization
- Blockchain transaction stream

**Interactive Controls**:
- Add/remove vehicles
- Trigger emergency scenarios
- Adjust traffic signal timing
- View transaction history
- Monitor consensus metrics
- Simulate attacks (data falsification, consensus violations)

### Consensus Experimentation
As required by the project, implement and compare:

1. **RAFT (Baseline)**: Current ordering service
   - Metrics: Throughput (TPS), latency, fault tolerance
   
2. **Modified PBFT**: 
   - Adapt for traffic-specific validation
   - Metrics: Byzantine fault tolerance, transaction finality time
   
3. **Proof of Authority (PoA)**:
   - Use trusted organizations as validators
   - Metrics: Energy efficiency, transaction speed

**Performance Metrics**:
- Transactions per second (TPS)
- Block creation time
- Transaction latency
- Network overhead
- Fault recovery time
- Consensus message complexity

### Attack Simulation Scenarios
1. **Data Falsification**: Alter vehicle positions in ledger
2. **Consensus Attack**: Introduce malicious orderer
3. **Double-spending**: Attempt to reserve same parking spot twice
4. **Replay Attack**: Resubmit old transactions
5. **Sybil Attack**: Create multiple fake vehicle identities

SOUS-PROJET 2 : ADAPTIVE SIGNAL CONTROL 

Développer un système de feux de circulation intelligents synchronisés via la blockchain.

Chaque feu s'adapte en fonction des données reçues sur le réseau (densité, priorités). Les décisions sont inscrites dans les blocs.


Expérimentation : Explorer 2 fonctions de hachage innovantes (ex. basée sur automate cellulaire ; atelier 2).

SOUS-PROJET 3 : DYNAMIC ROUTING & EMERGENCY MANAGEMENT 

Gérer les itinéraires dynamiques et prioritaires pour véhicules d'urgence.

Utiliser la blockchain pour la validation et la réservation de trajets sécurisés.


Expérimentation : Expérimenter un consensus hybride optimisé pour la rapidité de propagation.

SOUS-PROJET 4 : SMART PARKING & EV CHARGING 

Simuler la gestion de parkings et de stations de recharge pour véhicules électriques.

Gérer les places libres, les paiements et la consommation via des transactions blockchain.

Déployer un smart contract de réservation automatisée.


Expérimentation : Étudier l'impact de la taille et fréquence des blocs sur la performance du système.

TECHNOLOGIES 


Blockchain : Hyperledger Fabric.


Langages : Go, JavaScript/TypeScript, Python ou C++.


Déploiement : Docker / Hyperledger Composer.


Interface : Simulation graphique ou tableau de bord (Raylib, Qt, ou Web).

LIVRABLES 

Rapport technique (architecture, choix du consensus, structure de blocs, résultats).

Code source complet et commenté.

Démonstration de simulation fonctionnelle (en vidéo).

Présentation orale (15 min par groupe).

OPTION BONUS : PROJET INTÉGRÉ 


(À RENDRE APRÈS 7J DU DEADLINE) En fin de module, les groupes pourront fusionner leurs sous-projets pour former un simulateur complet de Smart City décentralisée, où les différents services interagissent via un réseau blockchain commun.