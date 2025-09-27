// Shim to provide a module for 'missing-asset-registry-path'
// Re-export RN's AssetRegistry implementation so Metro can resolve asset imports
module.exports = require('react-native/Libraries/Image/AssetRegistry');
