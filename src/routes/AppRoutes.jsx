import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Settings/Profile";
import ProtectedRoute from "../components/ProtectedRoute";
import JoinGroup from "../pages/Groups/JoinGroup";
import GroupPage from "../pages/Groups/GroupPage";
import Transactions from "../pages/Transactions/Transactions";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";

const AppRoutes = () => {
  return (
    <BrowserRouter>
     <Navbar />
      <Routes>
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/join/:inviteCode" element={<JoinGroup />} />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/transactions" element={<Transactions />} />
       
        
      </Routes>
        <Footer />
    </BrowserRouter>
  );
};

export default AppRoutes;
