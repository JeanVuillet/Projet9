
#!/bin/bash

# Lancez Jest en mode débogage (ajustez le port si nécessaire)
node --inspect=9230 ./node_modules/jest/bin/jest.js --runInBand /Desktop/Openclassrooms/Projet9/FrontPart/src/__tests__/Bills &

# Ouvrez Chrome avec chrome://inspect/#devices
open chrome://inspect/#devices

# Ouvrez l'inspecteur (facultatif)
open http://127.0.0.1:9230/