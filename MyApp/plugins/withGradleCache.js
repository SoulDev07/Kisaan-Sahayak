const { withGradleProperties } = require("@expo/config-plugins");

/**
 * This plugin modifies the `gradle.properties` file to set the `org.gradle.caching` property
 * to enable or disable the Gradle build cache.
 * It can help speed up build times by reusing outputs from previous builds.
 *
 * @param {import('@expo/config-plugins').ConfigPlugin} config - The Expo config object.
 * @param {Object} props - The properties object.
 * @param {boolean} props.cacheEnabled - Whether to enable or disable the Gradle build cache.
 * @returns {import('@expo/config-plugins').ConfigPlugin} - The modified Expo config object.
 */
module.exports = function withGradleCache(config, props) {
  return withGradleProperties(config, (config) => {
    const cacheEnabled = props.cacheEnabled !== undefined ? props.cacheEnabled : false;

    const existingProp = config.modResults.find((item) => item.type === "property" && item.key === "org.gradle.caching");

    if (existingProp) {
      existingProp.value = cacheEnabled;
    } else {
      config.modResults.push({
        type: "property",
        key: "org.gradle.caching",
        value: cacheEnabled,
      });
    }

    return config;
  });
};
