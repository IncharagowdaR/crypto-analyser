import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './components/Login';
import Registration from "./components/Registration";
import Market from "./components/Market";
import Protfolio from "./components/Protfolio";
import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/market" element={<Market />} />
        <Route path="/protfolio" element={<Protfolio/>}/>
      </Routes>
      
    </Router>
    </UserProvider>
  );
}

export default App;
