const React = require('react');
const { View } = require('react-native');

function SvgMock({ style, testID }) {
  return React.createElement(View, { style, testID });
}

module.exports = SvgMock;
module.exports.default = SvgMock;
