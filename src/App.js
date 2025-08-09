import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // Your admin dashboard component
// Import other pages/components as needed

function App() {
  return (
    <Router>
      <Routes>
        {/* Add your other app routes here */}
        <Route path="/admin-dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
