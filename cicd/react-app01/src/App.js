import React from 'react';
import logo from './k8logo.png';
import './App.css';
import packageJson from '../package.json';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Howdie PegB!!!
        </p>
      </header>
      <p>
          The current version of this app is: {packageJson.version}
      </p>
    </div>
  );
}
console.log(packageJson.version);
export default App;
