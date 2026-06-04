# 🎮 TicTacToe X — Multiplayer en Tiempo Real
### Expo Go · Firebase Realtime Database · TypeScript

> Juego de Tic-Tac-Toe para 2 jugadores en **diferentes dispositivos**, en tiempo real.
> Jugador 1 = ○ (Círculo, cian) | Jugador 2 = ✕ (Tache, naranja)
> Serie de **5 rondas** — gana quien llegue primero a **3 victorias**

---

## 📋 REQUISITOS PREVIOS

- Node.js ≥ 18
- npm o yarn
- **Expo Go** instalado en ambos teléfonos
  - iOS: https://apps.apple.com/app/expo-go/id982107779
  - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- Cuenta gratuita en Firebase (https://firebase.google.com)

---

## 🔥 PASO 1 — Configurar Firebase (OBLIGATORIO)

El juego usa **Firebase Realtime Database** para sincronizar ambos dispositivos.

### 1.1 Crear proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Clic en **"Agregar proyecto"**
3. Nombre: `tictactoe-juego` (o el que quieras)
4. Desactiva Google Analytics (opcional) → Crear proyecto

### 1.2 Activar Realtime Database

1. En el panel izquierdo → **Build → Realtime Database**
2. Clic **"Crear base de datos"**
3. Selecciona ubicación: **us-central1**
4. Modo de inicio: **"Modo de prueba"** (permite lectura/escritura sin auth)
5. Clic **Habilitar**

### 1.3 Obtener tus credenciales

1. Ve a **Configuración del proyecto** (⚙️ engranaje arriba izquierda)
2. Sección **"Tus apps"** → clic en **</>** (Web)
3. Nombre de app: `tictactoe-web`
4. Clic **Registrar app**
5. Copia el objeto `firebaseConfig` que aparece

### 1.4 Pegar tus credenciales

Abre el archivo `utils/firebase.ts` y reemplaza:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDEMO_REPLACE_WITH_YOUR_KEY",        // ← Tu apiKey
  authDomain: "tictactoe-demo.firebaseapp.com",       // ← Tu authDomain
  databaseURL: "https://tictactoe-demo-default-rtdb.firebaseio.com",  // ← Tu databaseURL
  projectId: "tictactoe-demo",                        // ← Tu projectId
  storageBucket: "tictactoe-demo.appspot.com",        // ← Tu storageBucket
  messagingSenderId: "000000000000",                  // ← Tu messagingSenderId
  appId: "1:000000000000:web:0000000000000000"        // ← Tu appId
};
```

> ⚠️ **IMPORTANTE**: La `databaseURL` debe coincidir con tu región.
> Ejemplo: `https://TU-PROYECTO-default-rtdb.firebaseio.com`

---

## 📦 PASO 2 — Instalar dependencias

```bash
cd tictactoe-multiplayer
npm install
```

---

## 🚀 PASO 3 — Ejecutar el proyecto

```bash
npx expo start
```

Aparecerá un **código QR** en la terminal.

### En cada teléfono:
- **Android**: Abre Expo Go → escanea el QR
- **iOS**: Abre la cámara → escanea el QR → toca la notificación

> 🌐 Ambos dispositivos deben estar en la **misma red WiFi** que tu computadora.

---

## 🎮 CÓMO JUGAR

### Dispositivo 1 (Jugador ○):
1. Toca **"CREAR SALA"**
2. Se genera un código de 6 letras (ej: `KXRM4F`)
3. Comparte ese código con el otro jugador

### Dispositivo 2 (Jugador ✕):
1. Toca **"UNIRSE A SALA"**
2. Escribe el código recibido
3. Toca **"ENTRAR →"**

### Juego:
- El **Jugador 1 (○)** siempre comienza cada ronda
- Se juegan hasta **5 rondas**
- Gana quien llegue primero a **3 victorias de ronda**
- En ronda 5 con empate 2-2, gana el ganador de esa ronda
- Al terminar la serie, el **Jugador 1** puede reiniciar

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
tictactoe-multiplayer/
├── app/
│   ├── _layout.tsx          # Configuración de navegación
│   └── index.tsx            # Pantalla principal (orquestador)
├── components/
│   ├── LobbyScreen.tsx      # Menú inicial: crear/unirse
│   ├── WaitingScreen.tsx    # Espera al segundo jugador
│   ├── GameScreen.tsx       # Pantalla de juego activo
│   ├── Board.tsx            # Tablero 3x3
│   ├── ScoreBoard.tsx       # Marcador y rondas
│   └── RoundOverlay.tsx     # Modal fin de ronda / partida
├── hooks/
│   └── useMultiplayerGame.ts # Lógica Firebase + game state
├── utils/
│   ├── firebase.ts          # Configuración Firebase ← EDITAR ESTO
│   ├── gameLogic.ts         # Lógica del juego (ganadores, etc.)
│   └── theme.ts             # Colores y estilos globales
├── app.json                 # Config Expo
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## 🎨 DISEÑO

- **Tema**: Dark cyberpunk con neón cian (#00D4FF) y naranja (#FF6B35)
- ○ (Círculo) = Jugador 1 en **cian eléctrico** con glow
- ✕ (Tache) = Jugador 2 en **naranja neón** con sombra
- Líneas de grid con efecto de luz
- Animaciones de entrada en modales
- Indicadores de turno en tiempo real

---

## 🐛 SOLUCIÓN DE PROBLEMAS

| Problema | Solución |
|---|---|
| "Sala no encontrada" | Verifica que el código sea exacto (6 caracteres) |
| No sincroniza | Asegúrate de que ambos teléfonos tengan internet |
| Error Firebase | Revisa que el `databaseURL` en `firebase.ts` sea correcto |
| Expo no conecta | Verifica que estés en la misma red WiFi |
| "Permission denied" | En Firebase Console → Rules → cambia `false` por `true` |

### Reglas de Firebase (si hay error de permisos):
En Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## 📱 COMPATIBILIDAD

- ✅ iOS 13+
- ✅ Android 6+
- ✅ Expo Go (sin build nativo necesario)
- ✅ Funciona con hotspot si no hay WiFi compartido

---
