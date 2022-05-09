import testHelper, { TestFlowsItem } from 'node-red-node-test-helper';
import { GoogleCredentialsNodeDef } from 'src/nodes/shared/types';
import googleCredentialsNode from '../nodes/google-credentials/google-credentials';

type FlowsItem = TestFlowsItem<GoogleCredentialsNodeDef>;
type Flows = Array<FlowsItem>;

describe('google-credentials node', () => {
  beforeEach((done) => {
    testHelper.startServer(done);
  });

  afterEach((done) => {
    testHelper.unload().then(() => {
      testHelper.stopServer(done);
    });
  });

  it('should be loaded', (done) => {
    const flows: Flows = [
      { id: 'n1', type: 'google-credentials', name: 'google-credentials' },
    ];
    testHelper.load(googleCredentialsNode, flows, () => {
      const n1 = testHelper.getNode('n1');
      expect(n1).toBeTruthy();
      expect(n1.name).toEqual('google-credentials');
      done();
    });
  });
});
