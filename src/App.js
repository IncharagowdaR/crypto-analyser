import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './components/Login';
import Registration from "./components/Registration";
import Market from "./components/Market";
import Protfolio from "./components/Protfolio";
import Admin from "./components/Admin";
import AdminLogin from "./components/AdminLogin"
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
        <Route path="/admin-login" element={<AdminLogin/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>
      
    </Router>
    </UserProvider>
  );
}

export default App;
