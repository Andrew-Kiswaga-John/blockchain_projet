# 🎤 Script de Présentation : Projet Traffic Core

Ce script est structuré pour une présentation fluide de 10 à 15 minutes. Il alterne entre la vision globale et les détails techniques qui impressionneront votre professeur.

---

## 1. Introduction (Le Problème)
> **Orateur :** "Bonjour à tous. Aujourd'hui, nous vous présentons **Traffic Core**, une solution de gestion urbaine décentralisée. Le problème actuel ? Les systèmes de trafic traditionnels sont des cibles faciles pour les cyber-attaques et manquent de transparence. Notre objectif était de construire une infrastructure 'Smart City' résiliente, capable de s'auto-surveiller."

---

## 2. L'Architecture Technique (Les 3 Piliers)
> **Orateur :** "Notre projet repose sur trois piliers technologiques :
> 1.  **Le Registre (Hyperledger Fabric v2.5)** : Nous avons déployé un réseau multi-organisations avec 5 entités distinctes (Autorité, Services d'Urgence, Infrastructures, etc.).
> 2.  **L'Intelligence (Mini-SOC avec Mistral 7B)** : Ce n'est pas un simple monitoring. Nous utilisons un agent d'IA local qui analyse les blocs de la blockchain pour détecter des anomalies comportementales.
> 3.  **L'Interface (Dashboard Cyberpunk)** : Développé en React, il permet une visualisation tactique du trafic et des alertes de sécurité en temps réel via WebSockets."

---

## 3. Le Point Fort : Laboratoire de Consensus
> **Orateur :** "Une de nos plus grandes réussites est le **Consensus Lab**. Contrairement à un réseau standard, nous avons implémenté un contrat intelligent capable de simuler et de comparer scientifiquement trois protocoles : RAFT, PBFT et PoA.
> - Nous avons démontré que le **PoA (Proof of Authority)** est idéal pour la scalabilité urbaine grâce à sa faible latence.
> - Tandis que le **PBFT** offre une sécurité maximale contre les nœuds malveillants, mais avec un coût de communication quadratique [$O(n^2)$]."

---

## 4. Sécurité et IA (Le Mini-SOC)
> **Orateur :** "En tant que projet de cybersécurité, nous avons simulé des attaques réelles, comme l'injection de fausses données GPS (Lying Sensor). 
> Notre **Mini-SOC** intercepte ces tentatives. L'IA Mistral 7B génère alors un rapport de raisonnement expliquant *pourquoi* la transaction est suspecte. Ces alertes sont ensuite orchestrées par **n8n** pour une réponse immédiate."

---

## 5. Défis et Solutions (Pourquoi c'était difficile)
> **Orateur :** "Techniquement, nous avons surmonté deux obstacles majeurs :
> 1.  **L'interopérabilité WSL-Windows** : Synchroniser les profils de connexion blockchain entre l'environnement Linux et notre application Windows a été un défi de configuration complexe.
> 2.  **La Latence de l'IA** : Pour ne pas bloquer le trafic, nous avons décorréler l'analyse de l'IA. Le bloc est enregistré, et l'audit se fait en arrière-plan (asynchrone), garantissant fluidité et sécurité."

---

## 6. Conclusion
> **Orateur :** "Pour conclure, Traffic Core prouve que la Blockchain et l'IA ne sont pas seulement des mots à la mode, mais des outils complémentaires pour sécuriser les villes de demain. Nous sommes maintenant prêts pour une démonstration en direct."

---

### 💡 Conseils pour l'oral :
- **Ne lisez pas tout** : Utilisez les points clés comme guide.
- **Montrez le Dashboard** : Pendant la partie 2, montrez l'écran. C'est l'atout visuel.
- **Soyez fiers du SOC** : C'est la partie la plus avancée du projet, insistez dessus si le prof pose des questions sur l'innovation.
