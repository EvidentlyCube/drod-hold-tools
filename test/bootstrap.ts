import { JSDOM } from "jsdom";

const dom = new JSDOM();

// biome-ignore lint: It works
global.window = dom.window as any;
global.document = dom.window.document;
global.Document = dom.window.Document;
global.Node = dom.window.Node;
global.XMLSerializer = dom.window.XMLSerializer;
