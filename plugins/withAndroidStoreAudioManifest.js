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

function ensureRemoveEntry(entries = [], androidName) {
  const nextEntries = removeNamedEntries(entries, new Set([androidName]));
  nextEntries.push({
    $: {
      'android:name': androidName,
      'tools:node': 'remove',
    },
  });
  return nextEntries;
}

module.exports = function withAndroidStoreAudioManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

    manifest.$ = {
      ...manifest.$,
      'xmlns:tools': 'http://schemas.android.com/tools',
    };

    manifest['uses-permission'] = [...AUDIO_PERMISSION_NAMES].reduce(
      (permissions, permissionName) => ensureRemoveEntry(permissions, permissionName),
      manifest['uses-permission'] ?? []
    );
    application.service = [...AUDIO_SERVICE_NAMES].reduce(
      (services, serviceName) => ensureRemoveEntry(services, serviceName),
      application.service ?? []
    );

    return config;
  });
};
