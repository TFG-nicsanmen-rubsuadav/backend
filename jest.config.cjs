module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  coverageReporters: ["clover", "json", "lcov", ["text", { skipFull: true }]],
};
