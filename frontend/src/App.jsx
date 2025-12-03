// frontend/src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";

import RouterSelector from "./routers";

function App() {
  return (
    <BrowserRouter>
      <RouterSelector />
    </BrowserRouter>
  );
}

export default App;
