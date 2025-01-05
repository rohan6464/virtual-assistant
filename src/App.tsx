import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VirtualAssistant from "./components/VirtualAssistant";
import "./App.css";
import PageNotFound from "./components/PageNotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<VirtualAssistant />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
