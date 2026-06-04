# assets/README.md
# Placeholders de assets

Expo requiere que existan estos archivos para compilar:
- icon.png (1024x1024)
- splash.png (1284x2778)
- adaptive-icon.png (1024x1024)

Puedes generarlos con:
  npx expo install expo-asset
  
O simplemente ejecuta:
  npx expo start
  
Expo Go ignorará los assets faltantes en modo desarrollo.
Si obtienes errores de assets, corre:
  npx expo install
