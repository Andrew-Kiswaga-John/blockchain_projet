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