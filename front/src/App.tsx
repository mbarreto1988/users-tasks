import React from "react";
import "./styles/App.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRouter from "./router";
import { BrowserRouter } from "react-router-dom";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <AppRouter />
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
