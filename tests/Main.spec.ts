import { Client } from "../src/Client";
import { Server } from "../src/Server";
import { helper } from "../src/helpers/helper";
import { IModule } from "../src/tests/Module";

const moduleDescriptorJson = helper.getModuleDescriptor('src/tests/Module.ts')

const server = new Server(moduleDescriptorJson, {});

beforeAll(() => {
    server.serve();
})

test('client-server GET request', async () => {
    const client = new Client<IModule>(moduleDescriptorJson, {
        urlPrefix: 'http://0.0.0.0:59898',
    });

    const resGet = await client.ghost.get('1112');
    expect(resGet).toEqual({ "id": "1112", "prop1": 1, "prop2": "he" });
});

test('client-server POST request', async () => {
    const client = new Client<IModule>(moduleDescriptorJson, {
        urlPrefix: 'http://0.0.0.0:59898',
    });

    const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
    expect(resPost).toEqual({ "prop1": 1, "prop2": "2" });
});

afterAll(() => {
    server.close();
})