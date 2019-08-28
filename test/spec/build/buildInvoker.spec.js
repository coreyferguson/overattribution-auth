
const { expect, sinon } = require('../../support/TestUtilities');
const BuildInvoker = require('../../../build/buildInvoker').BuildInvoker;
const StubCommand = require('../../support/stubs/build/StubCommand');

describe('buildInvoker', () => {

  const sandbox = sinon.createSandbox();

  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  function createStubbedRunList(ms) {
    const command1 = new StubCommand(1);
    const command2 = new StubCommand(2);
    return [command1, command2];
  }

  beforeEach(() => {
    sandbox.stub(console, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  })

  it('deploy - runs and logs all commands', async () => {
    const runList = createStubbedRunList();
    const invoker = new BuildInvoker({ runList });
    await invoker.deploy('dev');
    expect(runList[0].do).to.be.calledOnce;
    expect(runList[0].undo).to.not.be.called;
    expect(runList[1].do).to.be.calledOnce;
    expect(runList[1].undo).to.not.be.called;
    expect(console.info).to.be.calledWith('Deploying StubCommand1');
    expect(console.info).to.be.calledWith('Completed StubCommand1');
    expect(console.info).to.be.calledWith('Deploying StubCommand2');
    expect(console.info).to.be.calledWith('Completed StubCommand2');
  });

  it('deploy - runs commands in order', async () => {
    const runList = createStubbedRunList();
    const invoker = new BuildInvoker({ runList });
    await invoker.deploy('dev');
    expect(runList[0].do).to.be.calledBefore(runList[1].do);
  });

  it('deploy - runs commands not yet done', async () => {
    const runList = createStubbedRunList();
    runList[0]._isDone = true;
    const invoker = new BuildInvoker({ runList });
    await invoker.deploy('dev');
    expect(runList[0].do).to.not.be.called;
    expect(runList[1].do).to.be.called;
  });

  it('deploy - stage passed to commands', async () => {
    const runList = createStubbedRunList();
    const invoker = new BuildInvoker({ runList });
    await invoker.deploy('dev');
    expect(runList[0].do).to.be.calledWith('dev');
  });

  it('deploy - logs messages to console', async () => {
    const runList = createStubbedRunList();
    const invoker = new BuildInvoker({ runList });
    await invoker.deploy('dev');
  });

  it('remove - runs all commands', async () => {
    const runList = createStubbedRunList();
    runList[0]._isDone = runList[1]._isDone = true;
    const invoker = new BuildInvoker({ runList });
    await invoker.remove('dev');
    expect(runList[0].undo).to.be.calledOnce;
    expect(runList[0].do).to.not.be.called;
    expect(runList[1].undo).to.be.calledOnce;
    expect(runList[1].do).to.not.be.called;
    expect(console.info).to.be.calledWith('Removing StubCommand1');
    expect(console.info).to.be.calledWith('Completed StubCommand1');
    expect(console.info).to.be.calledWith('Removing StubCommand2');
    expect(console.info).to.be.calledWith('Completed StubCommand2');
  });

  it('remove - runs commands in order', async () => {
    const runList = createStubbedRunList();
    runList[0]._isDone = runList[1]._isDone = true;
    const invoker = new BuildInvoker({ runList });
    await invoker.remove('dev');
    expect(runList[1].undo).to.be.calledBefore(runList[0].undo);
  });

  it('remove - runs commands not yet done', async () => {
    const runList = createStubbedRunList();
    runList[1]._isDone = true;
    const invoker = new BuildInvoker({ runList });
    await invoker.remove('dev');
    expect(runList[0].undo).to.not.be.called;
    expect(runList[1].undo).to.be.called;
  });


  it('remove - stage passed to commands', async () => {
    const runList = createStubbedRunList();
    runList[0]._isDone = true;
    runList[1]._isDone = true;
    const invoker = new BuildInvoker({ runList });
    await invoker.remove('dev');
    expect(runList[1].undo).to.be.calledWith('dev');
  });

});
