const { withGradleProperties } = require("@expo/config-plugins");

/**
 * This plugin modifies the `gradle.properties` file to set the `reactNativeArchitectures` property
 * to the specified architectures.
 * It can help reduce build times by only building the specified architectures instead of all available ones.
 * @param {import('@expo/config-plugins').ConfigPlugin} config - The Expo config object.
 * @param {Object} props - The properties object.
 * @param {string[]} props.architectures - The list of architectures to build.
 * @returns {import('@expo/config-plugins').ConfigPlugin} - The modified Expo config object.
 */
module.exports = function withCustomArchitectures(config, props) {
  return withGradleProperties(config, (config) => {
    const architecturesList = props.architectures.join(",");

    const existingProp = config.modResults.find((item) => item.type === "property" && item.key === "reactNativeArchitectures");

    if (existingProp) {
      existingProp.value = architecturesList;
    } else {
      config.modResults.push({
        type: "property",
        key: "reactNativeArchitectures",
        value: architecturesList,
      });
    }

    return config;
  });
};
