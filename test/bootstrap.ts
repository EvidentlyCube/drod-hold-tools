import { JSDOM } from 'jsdom';

const dom = new JSDOM();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.window = (dom.window as any);
global.document = dom.window.document;
global.Document = dom.window.Document;
global.Node = dom.window.Node;
global.XMLSerializer = dom.window.XMLSerializer;
