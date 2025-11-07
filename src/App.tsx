import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import GenerateQR from './pages/GenerateQR';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GenerateQR />} />
        <Route path="/register/:code" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
