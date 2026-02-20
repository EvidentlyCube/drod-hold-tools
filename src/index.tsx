import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HoldIndexedStorage } from './processor/HoldIndexedStorage';

String.prototype.rDrodFix = function (): string {
  return this.replace(/\r/g, '\n');
};

declare global {
  interface String {
    rDrodFix(): string;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

HoldIndexedStorage.register();
