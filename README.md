# MongoDB avec Docker + Compass

## 📦 Lancement du conteneur MongoDB

0 - Installer les dependances
-> npm i

1 - Lancer mongoDB
-> docker compose up --build 
si vous voulez relancer l'installation:
-> docker compose down -v
-> docker compose up --build

2 - Lancer l'api
-> npm run dev