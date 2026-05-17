# SkyCheck

App de previsão do tempo desenvolvido em React Native com Expo, consumindo a Open-Meteo API.

## Funcionalidades

- Busca de cidades com autocomplete
- Temperatura atual, sensação térmica, umidade, vento e precipitação
- Previsão para 7 dias
- Interface com tema escuro

## Tecnologias

- React Native
- Expo SDK 54
- Open-Meteo API (gratuita, sem necessidade de chave)

## Como rodar

### Pré-requisitos

- Node.js instalado
- Expo Go instalado no celular

### Instalação

```bash
npm install --force
npx expo start
```

Escaneie o QR code com o app Expo Go no celular.

## API utilizada

Open-Meteo — https://open-meteo.com

- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Clima: https://api.open-meteo.com/v1/forecast