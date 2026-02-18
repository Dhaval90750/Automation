
module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/support/*.ts', 'features/steps/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['json:cucumber-report.json'],
    publishQuiet: true
  }
};
