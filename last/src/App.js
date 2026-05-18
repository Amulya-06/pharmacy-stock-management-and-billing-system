import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Logout from "./components/Logout";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout"; // New layout for users
import { Outlet } from "react-router-dom";

// Import shared components
import ManageInvoice from "./components/ManageInvoice";
import AddSupplier from "./components/AddSupplier";
import SalesReport from "./components/SalesReport";
import ManageMedicine from "./components/ManageMedicine";
import Invoicepage from "./components/Invoicepage";
import AddProduct from "./components/AddProduct";
import ManageMedicineStock from "./components/ManageMedicineStock";
import ManagePurchase from "./components/ManagePurchase";
import AddCustomer from "./components/AddCustomer";
import ManageCustomer from "./components/ManageCustomer";
import AddPurchase from "./components/AddPurchase";
import ManageSupplier from "./components/ManageSupplier";
import PurchaseReport from "./components/PurchaseReport";
import ChangeCredentials from "./components/ChangeCredentials";
import ChangeOwnerCredentials from "./components/ChangeAdminCredentials";
import AddCredentials from "./components/AddCredentials";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin layout wrapping all admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="ManageInvoice" element={<ManageInvoice />} />
          <Route path="AddSupplier" element={<AddSupplier />} />
          <Route path="SalesReport" element={<SalesReport />} />
          <Route path="ManageMedicine" element={<ManageMedicine />} />
          <Route path="Invoicepage" element={<Invoicepage />} />
          <Route path="AddProduct" element={<AddProduct />} />
          <Route path="ManageMedicineStock" element={<ManageMedicineStock />} />
          <Route path="ManagePurchase" element={<ManagePurchase />} />
          <Route path="AddCustomer" element={<AddCustomer />} />
          <Route path="ManageCustomer" element={<ManageCustomer />} />
          <Route path="AddPurchase" element={<AddPurchase />} />
          <Route path="ManageSupplier" element={<ManageSupplier />} />
          <Route path="PurchaseReport" element={<PurchaseReport />} />
          <Route path="ChangeCredentials" element={<ChangeCredentials />} />
          <Route path="ChangeOwnerCredentials" element={<ChangeOwnerCredentials />} />
          <Route path="AddCredentials" element={<AddCredentials />} />
        </Route>

        {/* User layout wrapping all user routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="ManageInvoice" element={<ManageInvoice />} />
          <Route path="AddSupplier" element={<AddSupplier />} />
          <Route path="SalesReport" element={<SalesReport />} />
          <Route path="ManageMedicine" element={<ManageMedicine />} />
          <Route path="Invoicepage" element={<Invoicepage />} />
          <Route path="AddProduct" element={<AddProduct />} />
          <Route path="ManageMedicineStock" element={<ManageMedicineStock />} />
          <Route path="ManagePurchase" element={<ManagePurchase />} />
          <Route path="AddCustomer" element={<AddCustomer />} />
          <Route path="ManageCustomer" element={<ManageCustomer />} />
          <Route path="AddPurchase" element={<AddPurchase />} />
          <Route path="ManageSupplier" element={<ManageSupplier />} />
          <Route path="PurchaseReport" element={<PurchaseReport />} />
          <Route path="ChangeCredentials" element={<ChangeCredentials />} />
          <Route path="ChangeOwnerCredentials" element={<ChangeOwnerCredentials />} />
          <Route path="AddCredentials" element={<AddCredentials />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
