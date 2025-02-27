import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ShopList from './ShopList';
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Stock from "./StockList";
import Staff from "./StaffLogin";
import StaffSL from "./StaffShopList";
import StaffStockList from "./StaffStockList";
import OwnerStockList from "./OwnerStockList";
import OwnerSales from "./OwnerSales.js";
import Sales from "./Sales";
import StaffManagement from "./StaffManagement";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShopList />} /> {/* Default page is the shops one */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/register" element={<Register />} /> {/* Registeration page */}
        <Route path="/profile" element={<Profile />} /> {/* Profile page */}
        <Route path="/stocklist/:shopId" element={<Stock />} /> {/* Stock page */}
        <Route path="/staffLogin" element={<Staff />} /> {/* Staffs login page */}
        <Route path="/staffsl" element={<StaffSL />} /> {/* Staffs shoplist page */}
        <Route path="/staffstocklist/:shopId" element={<StaffStockList />} /> {/* Staffs stocklist page */}
        <Route path="/ownerstocklist" element={<OwnerStockList />} /> {/* Owners shoplist page */}
        <Route path="/ownersales" element={<OwnerSales />} /> {/* Owners sales page */}
        <Route path="/sales/:stockId" element={<Sales />} /> {/* Sales page */}
        <Route path="/staffmanagement/:shopId" element={<StaffManagement />} /> {/* Add staff page */}
      </Routes>
    </Router>
  );
};

export default App;
