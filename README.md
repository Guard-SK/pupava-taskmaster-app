# 🌼 Pupava Taskmaster

An interactive, real-time quiz game designed for one summer camp activity inspired by the famous show Taskmaster. Built with **Vue.js**, **Node.js (Express)**, and **Socket.io** to enable instant real-time synchronization between the moderator, the scoreboard/projection, and the voting teams.

---

## 🇸🇰 Návod na spustenie a obsluhu (Slovensky)

Aplikácia sa skladá z dvoch častí (server a klientsky frontend), ktoré sa spúšťajú spoločne.

### 📋 Požiadavky
* [Node.js](https://nodejs.org/) (odporúčaná LTS verzia)

### 🚀 Spustenie projektu
1. **Inštalácia závislostí** (nainštaluje backend aj frontend):
   ```bash
   npm install
   ```
2. **Spustenie vývojového servera**:
   ```bash
   npm run dev
   ```
3. V prehliadači otvorte nasledujúce adresy:
   * **Administrátorská konzola (moderátor):** `http://localhost:5173/admin`  
     *(Ovládanie hry, prepínanie otázok, priraďovanie bodov)*
   * **Premietacia stena (projektor):** `http://localhost:5173/projector`  
     *(Umiestnenie pre projektor – zobrazuje priebežné poradie a výsledky)*
   * **Hlasovacia stránka pre tímy:** `http://localhost:5173/client` (alebo skrátene `http://localhost:5173/`)  
     *(Rozhranie pre hráčov)*

> [!NOTE]
> Pre pripojenie detí/tímov z mobilov musia byť všetky zariadenia pripojené na **rovnakú Wi-Fi sieť**. Skutočnú adresu (s IP adresou vášho počítača napr. `http://192.168.1.52:5173/client`) uvidíte v termináli po spustení pod riadkom `Network:`.

---

## 🇬🇧 Getting Started (English)

This project contains a Node.js server in the root and a Vue.js frontend inside the `/client` folder. They run concurrently.

### 📋 Prerequisites
* [Node.js](https://nodejs.org/) (LTS version recommended)

### 🚀 Running the App
1. **Install dependencies** (installs both root server and client packages):
   ```bash
   npm install
   ```
2. **Start the application**:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   * **Admin Panel:** `http://localhost:5173/admin`  
     *(Used by the moderator to control slides and award points)*
   * **Projector Scoreboard:** `http://localhost:5173/projector`  
     *(Show this to the audience on a projector/screen)*
   * **Client View:** `http://localhost:5173/client`  
     *(Used by competing teams on their mobile devices)*

---

## 🛠️ Užitočné príkazy & Riešenie problémov (macOS / Linux)

### 1. Problémy s oprávneniami pri `npm install`
Ak inštalácia zlyhá na prístupových právach (`permission denied`), spustite inštaláciu s povolením superužívateľa:
```bash
sudo npm install --unsafe-perm
```

### 2. Chyba pri zápise stavu (`Permission Denied`)
Ak hra nevie ukladať aktuálny stav do `data/state.json`, nastavte seba ako vlastníka priečinka projektu:
```bash
sudo chown -R $(whoami) .
```

### 3. Zistenie IP adresy pre pripojenie mobilov
Ak potrebujete rýchlo zistiť IP adresu vášho počítača v lokálnej sieti:
```bash
ipconfig getifaddr en0
```
