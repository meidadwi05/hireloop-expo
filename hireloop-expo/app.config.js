const {readFileSync} = require('node:fs');

module.exports = ({config}) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  const requiresFirebase = process.env.EAS_BUILD_PLATFORM === 'android'
    && ['production', 'production-apk'].includes(process.env.EAS_BUILD_PROFILE);
  if (requiresFirebase) {
    if (!googleServicesFile) {
      throw new Error('GOOGLE_SERVICES_JSON must be an EAS file variable for the production Android build.');
    }
    let firebase;
    try {
      firebase = JSON.parse(readFileSync(googleServicesFile, 'utf8'));
    } catch {
      throw new Error('GOOGLE_SERVICES_JSON must point to a readable Firebase JSON file.');
    }
    const packageName = config.android?.package;
    const matchingClient = Array.isArray(firebase?.client) && firebase.client.some(entry => {
      const client = entry?.client_info;
      return client?.android_client_info?.package_name === packageName && client?.mobilesdk_app_id;
    });
    if (!matchingClient) {
      throw new Error(`GOOGLE_SERVICES_JSON does not contain a Firebase client for ${packageName}.`);
    }
  }
  if (!googleServicesFile) return config;
  return {...config, android: {...config.android, googleServicesFile}};
};
