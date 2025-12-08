## Page 1

½ Module : Blockchain
Pr. Ikram BENABDELOUAHAB
2ème année Master IASD
2025/2026

&lt;img&gt;Logo of Faculty of Law and Economics, University of Tunis El Manar&lt;/img&gt;
كلية الحقوق و الاقتصاد
الجامعة التونسية المنار
Faculté des Sciences Juridiques et Économiques
Tunis

# ATELIER HYPERLEDGER FABRIC

&lt;img&gt;Hyperledger logo (hexagon with nodes)&lt;/img&gt;

# HYPERLEDGER

## INTRODUCTION

### QU'EST-CE QUE HYPERLEDGER FABRIC ?

*   C'est une plateforme blockchain pour les entreprises, conçue pour construire des applications et des solutions blockchain modulaires et sécurisées.
*   Contrairement à Bitcoin ou Ethereum (qui sont publiques), Hyperledger Fabric est **permissionnée**, ce qui signifie:
    *   Seules les personnes ou organisations autorisées peuvent rejoindre le réseau.
    *   On peut contrôler qui peut lire ou écrire des transactions.
*   Hyperledger Fabric est une **blockchain privée et modulable pour entreprises**, axée sur la sécurité, la confidentialité et la traçabilité, sans nécessiter de crypto-monnaie.

## CARACTÉRISTIQUES PRINCIPALES

1.  **Permissionnée** :
    *   Chaque participant du réseau est identifié.
    *   Idéal pour les entreprises qui veulent partager des données sensibles.
2.  **Modularité** :
    *   Tu peux personnaliser différents composants : consensus, sécurité, gestion des identités.
3.  **Chaînes privées (Channels)** :
    *   Permet à certaines parties de créer des sous-réseaux privés pour que certaines transactions soient visibles **uniquement par les participants concernés**.
4.  **Smart Contracts appelés “Chaincode”** :
    *   Les règles de business et transactions sont codées dans des chaincodes.
    *   Ils peuvent être écrits en Go, Java ou JavaScript.
5.  **Pas de crypto-monnaie native** :
    *   Hyperledger Fabric ne nécessite pas de token ou crypto comme Ethereum ou Bitcoin.
    *   Il se concentre sur l'échange sécurisé et vérifiable de données entre entreprises.

## CAS D'USAGE TYPIQUES

*   **Supply chain** : suivre la provenance des produits.
*   **Finance** : transferts interbancaires sécurisés.
*   **Santé** : partage sécurisé des dossiers médicaux entre hôpitaux.
*   **Assurances** : traitement automatisé des contrats et sinistres.

---


## Page 2

½ Module : Blockchain
Pr. Ikram BENABDELOUAHAB
2ème année Master IASD
2025/2026

&lt;img&gt;Logo of Faculty of Law and Economics, University of Tunis El Manar&lt;/img&gt;
كلية الحقوق و الاقتصاد
الجامعة التونسية المنار
Faculté des Sciences Juridiques et Économiques
Tunis

# DÉFINITIONS UTILES

## UN LEDGER DANS HYPERLEDGER FABRIC

Le ledger = la blockchain elle-même, ou plus exactement la base de données distribuée qui enregistre toutes les transactions et l'état des actifs.

*   Chaque peer du réseau possède une copie du ledger.
*   Le ledger contient :
    1. La chaîne de blocs (blockchain) : historique de toutes les transactions validées.
    2. L'état courant (world state) : la version la plus récente de tous les actifs.

# CONCEPTS DE BASE

<table>
<thead>
<tr>
<th>Terme</th>
<th>Définition</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Hyperledger Fabric</strong></td>
<td>Framework open source de blockchain permissionnée développé par la Linux Foundation, conçu pour les entreprises.</td>
</tr>
<tr>
<td><strong>Permissioned Blockchain</strong></td>
<td>Blockchain privée où seuls les membres autorisés peuvent rejoindre le réseau.</td>
</tr>
<tr>
<td><strong>Consortium</strong></td>
<td>Groupe d'organisations qui partagent une même blockchain Fabric.</td>
</tr>
</tbody>
</table>

# ARCHITECTURE DU RÉSEAU DANS HYPERLEDGER FABRIC

<table>
<thead>
<tr>
<th>Terme</th>
<th>Définition</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Peer Node (Peer)</strong></td>
<td>Noeud qui héberge un ledger et exécute les smart contracts (chaincodes).</td>
</tr>
<tr>
<td><strong>Ordering Service (Orderer)</strong></td>
<td>Composant qui ordonne les transactions et crée les blocs.</td>
</tr>
<tr>
<td><strong>Client Application</strong></td>
<td>Programme externe (par ex. en Go, Node.js, Python) qui soumet les transactions à la blockchain.</td>
</tr>
<tr>
<td><strong>Channel</strong></td>
<td>Réseau privé entre un sous-ensemble de membres pour partager un ledger commun.</td>
</tr>
<tr>
<td><strong>Organization (Org)</strong></td>
<td>Entité membre du réseau (ex. une entreprise) avec ses propres pairs et identités.</td>
</tr>
<tr>
<td><strong>MSP (Membership Service Provider)</strong></td>
<td>Système de gestion d'identité et d'autorisations dans le réseau.</td>
</tr>
<tr>
<td><strong>CA (Certificate Authority)</strong></td>
<td>Autorité qui délivre les certificats numériques aux membres du réseau.</td>
</tr>
</tbody>
</table>

# Ledger et Transactions

<table>
<thead>
<tr>
<th>Terme</th>
<th>Définition</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Ledger</strong></td>
<td>Registre distribué contenant toutes les transactions validées.</td>
</tr>
<tr>
<td><strong>World State</strong></td>
<td>Base de données (ex. LevelDB ou CouchDB) stockant l'état actuel des actifs.</td>
</tr>
<tr>
<td><strong>Transaction</strong></td>
<td>Requête de modification du ledger (création, mise à jour ou suppression d'un actif).</td>
</tr>
<tr>
<td><strong>Block</strong></td>
<td>Ensemble de transactions ordonnées et ajoutées au ledger.</td>
</tr>
<tr>
<td><strong>Genesis Block</strong></td>
<td>Premier bloc d'un canal, contenant sa configuration initiale.</td>
</tr>
</tbody>
</table>

# Smart Contracts et Chaincode

<table>
<thead>
<tr>
<th>Terme</th>
<th>Définition</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Smart Contract</strong></td>
<td>Programme exécuté sur la blockchain pour gérer la logique métier.</td>
</tr>
<tr>
<td><strong>Chaincode</strong></td>
<td>Nom utilisé dans Fabric pour désigner un smart contract. Il peut être écrit en Go, JavaScript ou Java.</td>
</tr>
<tr>
<td><strong>Invoke Transaction</strong></td>
<td>Appel qui modifie l'état du ledger via un chaincode.</td>
</tr>
<tr>
<td><strong>Query Transaction</strong></td>
<td>Appel qui lit des données sans les modifier.</td>
</tr>
</tbody>
</table>

# Sécurité et Identité

<table>
<thead>
<tr>
<th>Terme</th>
<th>Définition</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Identity</strong></td>
<td>Certificat X.509 représentant un utilisateur ou un pair.</td>
</tr>
<tr>
<td><strong>Admin</strong></td>
<td>Identité ayant les droits d'administration pour une organisation.</td>
</tr>
<tr>
<td><strong>Endorsement Policy</strong></td>
<td>Règle définissant quels pairs doivent valider une transaction avant qu'elle soit ajoutée au ledger.</td>
</tr>
</tbody>
</table>

---


## Page 3

½ Module : Blockchain
Pr. Ikram BENABDELOUAHAB
2ème année Master IASD
2025/2026

&lt;img&gt;Logo of Faculty of Law and Economics, University of Tunis El Manar, Faculty of Sciences of Management&lt;/img&gt;

## Mécanismes internes

<table>
  <thead>
    <tr>
      <th>Terme</th>
      <th>Définition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Endorsement</b></td>
      <td>Signature d'un pair attestant qu'une transaction est correcte.</td>
    </tr>
    <tr>
      <td><b>Commit</b></td>
      <td>Étape finale où le bloc est ajouté au ledger après validation.</td>
    </tr>
    <tr>
      <td><b>Gossip Protocol</b></td>
      <td>Mécanisme de communication entre pairs pour diffuser les blocs et transactions.</td>
    </tr>
    <tr>
      <td><b>Consensus</b></td>
      <td>Processus d'accord sur l'ordre des transactions (dans Fabric, il est fourni par l'<b>Orderer</b>).</td>
    </tr>
    <tr>
      <td><b>Anchor Peer</b></td>
      <td>Peer principal utilisé pour la communication inter-organisation sur un canal.</td>
    </tr>
  </tbody>
</table>

## Outils & Commandes

<table>
  <thead>
    <tr>
      <th>Terme</th>
      <th>Définition</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Fabric-CA</b></td>
      <td>Service pour gérer les identités et certificats des membres.</td>
    </tr>
    <tr>
      <td><b>Fabric-CLI / peer CLI</b></td>
      <td>Ligne de commande utilisée pour interagir avec le réseau (ex. peer lifecycle chaincode install).</td>
    </tr>
    <tr>
      <td><b>Fabric SDK</b></td>
      <td>Librairies pour développer des applications clientes (Go, Node.js, Java, etc.).</td>
    </tr>
    <tr>
      <td><b>Docker</b></td>
      <td>Conteneurisation utilisée pour déployer les composants Fabric.</td>
    </tr>
    <tr>
      <td><b>configtx.yaml</b></td>
      <td>Fichier de configuration du réseau, canaux et organisations.</td>
    </tr>
    <tr>
      <td><b>crypto-config.yaml</b></td>
      <td>Fichier décrivant la structure d'identité et les certificats à générer.</td>
    </tr>
  </tbody>
</table>

<mermaid>
graph TD
    subgraph " "
        direction LR
        A[Organisation A]
        B[Organisation B]
    end

    subgraph " "
        direction LR
        C[Chaincode C]
        D[Chaincode D]
        E[Account A1]
        F[Peer A1]
        G[Account A2]
        H[Peer A2]
        I[Chaincode C]
        J[Chaincode D]
        K[Account B1]
        L[Peer B1]
        M[Account B2]
        N[Peer B2]
    end

    A -->|Channel A| C
    A -->|Channel A| D
    A -->|Channel A| E
    A -->|Channel A| F
    A -->|Channel A| G
    A -->|Channel A| H

    B -->|Channel B| I
    B -->|Channel B| J
    B -->|Channel B| K
    B -->|Channel B| L
    B -->|Channel B| M
    B -->|Channel B| N

    Orderer --- A
    Orderer --- B
</mermaid>

## CONSENSUS PAR DÉFAUT DANS HYPERLEDGER FABRIC

Depuis Hyperledger Fabric v2.x, le mécanisme de consensus par défaut est : Raft (Crash Fault Tolerant - CFT)

Les anciens consensus :

*   Solo → utilisé uniquement pour les tests locaux.
*   Kafka → déprécié à partir de Fabric 2.x et supprimé dans Fabric 3.x.

Raft est un algorithme de consensus tolérant aux pannes (CFT) qui permet à plusieurs nœuds (orderers) de s'accorder sur un ordre unique de transactions à ajouter dans la blockchain.

Chaque nœud orderer peut être dans un des trois états :

<table>
  <thead>
    <tr>
      <th>Rôle</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Leader</td>
      <td>Gère la production des blocs, reçoit les transactions des clients et les diffuse aux autres nœuds.</td>
    </tr>
    <tr>
      <td>Follower</td>
      <td>Réplique les blocs envoyés par le leader et reste en veille.</td>
    </tr>
    <tr>
      <td>Candidate</td>
      <td>Apparaît lors d'une élection quand le leader devient injoignable.</td>
    </tr>
  </tbody>
</table>

---


## Page 4

½ Module : Blockchain
Pr. Ikram BENABDELOUAHAB
2ème année Master IASD
2025/2026

&lt;img&gt;Logo of Faculty of Law and Economics, University of Tunis El Manar&lt;/img&gt;
كلية الحقوق و الاقتصاد
الجامعة التونسية المنار
Faculté des Sciences Juridiques et Économiques
Tunis

**Fonctionnement simplifié :**

1.  **Élection du leader**
    *   Au démarrage, les nœuds élisent un leader (vote majoritaire).
    *   Si le leader tombe, une nouvelle élection est déclenchée.
2.  **Proposition de blocs**
    *   Le leader reçoit les transactions validées (endorsements).
    *   Il les regroupe en **blocs**.
3.  **Réplication**
    *   Le leader envoie le bloc à tous les **followers**.
    *   Chaque follower confirme la réception.
4.  **Validation**
    *   Quand la majorité (≥ 50% + 1) des nœuds confirme, le bloc est **commité**.
    *   Tous les orderers ajoutent le bloc à leur copie du **ledger**.

**SMART CONTRACT**

Un smart contract (ou contrat intelligent) est un programme informatique qui s'exécute automatiquement sur la blockchain pour gérer la logique métier entre plusieurs parties sans intermédiaire.

Il définit :
*   Les règles d'une application (ex : transfert, validation, mise à jour d'un actif),
*   Les conditions d'exécution,
*   Et les actions à réaliser lorsque ces conditions sont remplies.

**Dans Hyperledger Fabric**
*   On appelle le smart contract : **Chaincode**.
*   Il est **déployé sur les peers** du réseau.
*   Il peut être écrit en **Go**, **JavaScript (Node.js)** ou **Java**.
*   Il gère la lecture et la mise à jour du **ledger (registre)**.

**Fonctionnement simplifié**

1.  Une **application cliente** envoie une requête (transaction).
2.  Le **smart contract** (chaincode) s'exécute sur les peers pour :
    *   Lire ou modifier l'état du ledger,
    *   Vérifier les conditions métier.
3.  Si la transaction est validée selon la **policy d'endossement**, elle est enregistrée définitivement dans la blockchain.

**Exemple simple :**

Smart contract pour gérer un actif :
javascript
async CreateAsset(ctx, id, owner) {
  const asset = { ID: id, Owner: owner };
  await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
}

Ce code crée un **actif** sur la blockchain avec un identifiant et un propriétaire.

---


## Page 5

½ Module : Blockchain
Pr. Ikram BENABDELOUAHAB
2ème année Master IASD
2025/2026

&lt;img&gt;Logo with Arabic text "كلية العلوم و التقنيات بابن زیاد" and French text "Faculté des Sciences et Techniques Ben Ziaad"&lt;/img&gt;

# Blockchain Simplified

## Hyperledger Fabric Work Flow

**Company - A**

*   **Peer**
    *   Endorser Peer
*   **Peer**
    *   Anchor Peer
*   **Peer**
    *   General Peer

**Company - B**

*   **Peer**
*   **Client App**
    *   HYPERLEDGER FABRIC

**Client App**

*   **Peer**
*   **Peer**
*   **Peer**

**Ordering Peer**

*   **Peer**
*   **Peer**
*   **Peer**

<mermaid>
graph TD
    subgraph Company - A
        A1[Peer]
        A2[Peer]
        A3[Peer]
        A4[Peer]
        A5[Peer]
        A6[Peer]
        A7[Client App]
        A8[HYPERLEDGER FABRIC]

        A1 -- (2) --> A7
        A7 -- (3) --> A8
        A8 -- (2) --> A1
        A2 -- (6) --> A6
        A3 -- (6) --> A6
        A4 -- (6) --> A6
        A5 -- (6) --> A6
        A6 -- (6) --> A2
        A6 -- (6) --> A3
        A6 -- (6) --> A4
        A6 -- (6) --> A5
    end

    subgraph Company - B
        B1[Peer]
        B2[Peer]
        B3[Peer]
        B4[Client App]
        B5[HYPERLEDGER FABRIC]

        B1 -- (6) --> B2
        B1 -- (6) --> B3
        B2 -- (6) --> B3
        B2 -- (6) --> B4
        B3 -- (6) --> B4
        B4 -- (6) --> B1
        B4 -- (6) --> B2
        B4 -- (6) --> B3
    end

    A7 -- (4) --> B4
    B4 -- (5) --> A7
    A8 -- (1) --> A1
</mermaid>

