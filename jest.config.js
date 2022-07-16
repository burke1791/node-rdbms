
const config = {
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.js'
  ],
  coveragePathIgnorePatterns: [
    './src/utilities/constants.js'
  ]
}

module.exports = config;