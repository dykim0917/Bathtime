const { withGradleProperties } = require('expo/config-plugins');

const RELEASE_PROPERTIES = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
};

function setProperty(properties, key, value) {
  const existingProperty = properties.find((property) => property.type === 'property' && property.key === key);
  if (existingProperty) {
    existingProperty.value = value;
    return properties;
  }

  properties.push({
    type: 'property',
    key,
    value,
  });
  return properties;
}

module.exports = function withAndroidReleaseOptimization(config) {
  return withGradleProperties(config, (config) => {
    for (const [key, value] of Object.entries(RELEASE_PROPERTIES)) {
      setProperty(config.modResults, key, value);
    }
    return config;
  });
};
