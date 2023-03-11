import os from 'socket:os';
import React from 'react';

const App = () => {
  return <h1>Hello, {os.platform()}!</h1>;
};
export default App;
