const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v12 ships CJS files with .cjs extension — Metro needs to recognize them.
config.resolver.sourceExts.push('cjs');

module.exports = config;
