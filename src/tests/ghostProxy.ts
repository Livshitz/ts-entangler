import { GhostProxy, CustomHandler } from "../GhostProxy";

console.log('------')

const myHandler: CustomHandler = (path, ...args) => {
	console.log(`Custom handler called instead of ${path}() with arguments:`, args);
}

const ghost = GhostProxy.create(myHandler);

console.log(1);
ghost.a.b([1, 2, 3]); // This will call the custom handler() method instead of the original method()
console.log(2);