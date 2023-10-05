import 'isomorphic-fetch';
import { Client } from "../src/Client";
import { Server } from "../src/LocalServer";
import { helper } from "../src/helpers/helper";
import { IModule, Module } from "../src/tests/Module";
import { fileReflector } from '../src/FileReflector';
import { JSONObject } from 'libx.js/build/types/interfaces';
import { ModuleRouter } from '../src/ModuleRouter';
import { error } from 'itty-router/error';

let moduleDescriptorJson: JSONObject;
let server: Server;

beforeAll(() => {
    moduleDescriptorJson = fileReflector.getModuleDescriptor('src/tests/Module.ts')
    const moduleRouter = ModuleRouter.createRouter(new Module(123), moduleDescriptorJson, { customRoot: 'mod' });
    moduleRouter.all('*', () => error(404));
    server = new Server(moduleRouter, {});
    server.serve();
})

test('client-server GET request', async () => {
    const client = new Client<IModule>(moduleDescriptorJson, {
        urlPrefix: 'http://0.0.0.0:59898',
        customRoot: 'mod',
    });

    const resGet = await client.ghost.get('1112');
    expect(resGet).toEqual({ "id": "1112", "prop1": 1, "prop2": "he" });
});

test('client-server POST request', async () => {
    const client = new Client<IModule>(moduleDescriptorJson, {
        urlPrefix: 'http://0.0.0.0:59898',
        customRoot: 'mod',
    });

    const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
    expect(resPost).toEqual({ "prop1": 1, "prop2": "2" });
});

test('client from server definition url', async () => {
    const client = await Client.fromUrl<IModule>('http://0.0.0.0:59898/mod/definition', {
        urlPrefix: 'http://0.0.0.0:59898',
        customRoot: 'mod',
    });

    const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
    expect(resPost).toEqual({ "prop1": 1, "prop2": "2" });
});

test('client from server definition url - automatic fill', async () => {
    const client = await Client.fromUrl<IModule>('http://0.0.0.0:59898/mod/definition', {
    });

    const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
    expect(resPost).toEqual({ "prop1": 1, "prop2": "2" });
});

test('server from constructor', async () => {
    const moduleDescriptorJson = fileReflector.getModuleDescriptor('src/tests/Module.ts')
    const moduleRouter = new ModuleRouter(new Module(123), moduleDescriptorJson, { customRoot: 'mod' });
    moduleRouter.router.all('*', () => error(404));
    const server = new Server(moduleRouter.router, { port: 59899 });
    server.serve();

    const client = new Client<IModule>(moduleDescriptorJson, {
        urlPrefix: 'http://0.0.0.0:59899',
        customRoot: 'mod',
    });

    const resPost = await client.ghost.update('111', { prop1: 1, prop2: '2' });
    expect(resPost).toEqual({ "prop1": 1, "prop2": "2" });

    server.close();
});

afterAll(() => {
    server.close();
})