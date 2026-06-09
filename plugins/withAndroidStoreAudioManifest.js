const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const AUDIO_SERVICE_NAMES = new Set([
  'expo.modules.audio.service.AudioControlsService',
  'expo.modules.audio.service.AudioRecordingService',
]);

const AUDIO_PERMISSION_NAMES = new Set([
  'android.permission.RECORD_AUDIO',
  'android.permission.FOREGROUND_SERVICE_MICROPHONE',
  'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
]);

function getAndroidName(node) {
  return node?.$?.['android:name'] ?? node?.$?.name ?? '';
}

function normalizeClassName(name) {
  if (name.startsWith('.service.')) {
    return `expo.modules.audio${name}`;
  }
  return name;
}

function removeNamedEntries(entries = [], names) {
  return entries.filter((entry) => !names.has(normalizeClassName(getAndroidName(entry))));
}

module.exports = function withAndroidStoreAudioManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    manifest['uses-permission'] = removeNamedEntries(
      manifest['uses-permission'],
      AUDIO_PERMISSION_NAMES
    );
    application.service = removeNamedEntries(application.service, AUDIO_SERVICE_NAMES);

    return config;
  });
};
