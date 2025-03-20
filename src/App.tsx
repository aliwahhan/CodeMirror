import React from "react";
import CodeEditor from "./components/codemirror";
import "./App.css";

const App: React.FC = () => {
  const handleSave = () => {
    alert(" Save Success Code!");
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>Online Code</h1>
        </div>
        <div className="header-right">
          <button onClick={handleSave} className="save-button">
            Save Code
          </button>
        </div>
      </header>
      <div className="editor-container">
        <CodeEditor />
      </div>
    </div>
  );
};

export default App;
