require('should');
const zapier = require('zapier-platform-core');
const App = require('../../index');
const appTester = zapier.createAppTester(App);
console.log('Available triggers:', Object.keys(App.triggers || {}));
describe('workspace trigger', () => {
  it('should fetch workspaces', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
      },
      inputData: {},
    };

    const results = await appTester(App.triggers.workspace.operation.perform, bundle);
    console.log(JSON.stringify(results, null, 2));

    results.length.should.be.above(0);
    results[0].should.have.property('id');
  });
});