import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VisualAssistant from "./components/VisualAssistant";
import "./App.css";
import PageNotFound from "./components/PageNotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define routes here */}
        <Route path="/" element={<VisualAssistant />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
