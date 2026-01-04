# 🏙️ Traffic Core - Gestion du Trafic par Blockchain pour Smart City

[![Statut du Projet : Terminé](https://img.shields.io/badge/Statut-Terminé-brightgreen)](README.md)
[![Hyperledger Fabric](https://img.shields.io/badge/Plateforme-Hyperledger%20Fabric%20v2.5-blue)](https://www.hyperledger.org/use/fabric)
[![Rapport Technique](https://img.shields.io/badge/Rapport-Technique%20(PDF)-orange)](docs/report/blockchain_project.pdf)

Un système de gestion du trafic décentralisé et cyber-résilient pour les villes intelligentes modernes. Ce projet intègre un réseau blockchain multi-organisations, un centre d'opérations de sécurité (Mini-SOC) propulsé par l'IA (Mistral 7B), et un laboratoire expérimental de comparaison de consensus.

---

## 📑 Rapport Technique
Le rapport complet détaillant l'architecture, le laboratoire de consensus et la couche de cyber-sécurité est disponible ici :  
👉 **[Télécharger le Rapport Technique (PDF)](docs/report/blockchain_project.pdf)**

---

## 🎥 Démonstration Vidéo
Découvrez le système en action à travers cette simulation fonctionnelle complète (7 min).  
Elle couvre le dashboard cyberpunk, le consensus lab, et la détection d'attaques par l'IA.

https://github.com/Andrew-Kiswaga-John/blockchain_projet/assets/simulation_video.mp4

> [!NOTE]
> *Si la vidéo ne s'affiche pas directement ci-dessus, vous pouvez la trouver dans :* `docs/demo/simulation_video.mp4`

---

## 🚀 Guide de Démarrage (Étape par Étape)

L'installation du projet est divisée en plusieurs parties modulaires. **Veuillez les suivre dans l'ordre :**

### 1️⃣ Phase 1 : Environnement & Synchronisation
[Configuration de WSL Ubuntu, création des espaces de travail et transfert des fichiers.](docs/setup/01-environment-sync.md)

### 2️⃣ Phase 2 : Réseau Blockchain
[Installation des dépendances des chaincodes et lancement du réseau Hyperledger (6 Orgs).](docs/setup/02-blockchain-network.md)

### 3️⃣ Phase 3 : Backend SDK Bridge
[Initialisation de l'API Node.js faisant le pont entre l'UI et le Registre.](docs/setup/03-backend-sdk.md)

### 4️⃣ Phase 4 : Lancement des Applications
[Démarrage du Dashboard Cyberpunk, du Simulateur Citadin et des Agents IA sur Windows.](docs/setup/04-windows-apps.md)

### 🏆 Phase 5 : Guide d'Évaluation
[Scénario de test et guide d'évaluation pour les professeurs (Fonctionnalités clés).](docs/setup/05-evaluation-guide.md)

---

## 🏗️ Architecture du Système

*   **Moteur Blockchain** : Hyperledger Fabric avec consensus RAFT.
*   **Protocole de Sécurité** : Mini-SOC piloté par l'IA (Agents Python + n8n) surveillant l'intégrité de la blockchain.
*   **Analyses** : Visualisation du trafic en temps réel et benchmark de consensus (PBFT/PoA/RAFT).
*   **Dashboard** : Interface React (Vite) haute performance avec WebSockets en temps réel.

---

## 👥 Informations Académiques

**Professeure** : Pr. Ikram BEN ABDEL OUAHAB  
**Module** : Blockchain 
**Master** : IASD - 2025/2026  

---
*Développé avec ❤️ pour la résilience urbaine.*
