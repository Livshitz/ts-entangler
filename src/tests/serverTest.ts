import { createServerAdapter } from "@whatwg-node/server";
import { getExpress } from "../helpers/getExpress";
import { error, json, IRequest, Router, withParams, withContent, RouterType, Route, createCors } from 'itty-router';
import { Module } from "./Module";
import { libx } from "libx.js/build/bundles/node.essentials";
import { helper } from "../helpers/helper";
import { Server } from "../LocalServer";
import { fileReflector } from "../FileReflector";
import { ModuleRouter } from "../ModuleRouter";

const moduleDescriptorJson = fileReflector.getModuleDescriptor('src/tests/Module.ts')

const moduleRouter = new ModuleRouter(new Module(123), moduleDescriptorJson, { customRoot: 'mod' })
const server = new Server(moduleRouter.router, {});

moduleRouter.router.all('/x', (request) => json({
	text: 'hello',
	echo: request.body,
})).all('*', () => error(404));

server.serve();

// process.exit(0);

