import React from "react";
import EEGChart from "./EEGChart"; // this imports your chart component

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>EEG Data Visualization</h1>
      <EEGChart /> {/* your EEG chart will render here */}
    </div>
  );
}

export default App;
