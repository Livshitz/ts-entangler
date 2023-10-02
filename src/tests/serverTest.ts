import { createServerAdapter } from "@whatwg-node/server";
import { getExpress } from "../helpers/getExpress";
import { error, json, IRequest, Router, withParams, withContent, RouterType, Route, createCors } from 'itty-router';
import { Module } from "./Module";
import { libx } from "libx.js/build/bundles/node.essentials";
import { Reflector } from "ts-reflector";
import { helper } from "../helpers/helper";
import { Server } from "../Server";

const moduleDescriptorJson = helper.getModuleDescriptor('src/tests/Module.ts')

const server = new Server(moduleDescriptorJson, {});

server.router.all('/x', (request) => json({
	text: 'hello',
	echo: request.body,
})).all('*', () => error(404));

server.serve();

// process.exit(0);

