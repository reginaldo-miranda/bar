/* eslint-disable no-undef */
 // esse e o primeiro feito pelo vite

/*import { useState } from 'react' 
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/
/* funcionando bem antes do cabecalho
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

*/

/*
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

*/

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Product from "./pages/Product";
import ProductList from "./pages/ProductList";
import ProductEdit from "./pages/ProductEdit";
import Customer from "./pages/Customer";
import CustomerList from "./pages/CustomerList";
import CustomerEdit from "./pages/CustomerEdit";
import Employee from "./pages/Employee";
import EmployeeList from "./pages/EmployeeList";
import PDV from "./pages/PDV";
import Comandas from "./pages/Comandas";
import Mesas from "./pages/Mesas";
import Caixa from "./pages/Caixa";
import CaixaResumo from "./pages/CaixaResumo";
import GroupsUnits from "./pages/GroupsUnits";

function App() {
  return (
    <Router>
      <Header />
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/list" element={<ProductList />} />
          <Route path="/product/edit/:id" element={<ProductEdit />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customer/list" element={<CustomerList />} />
          <Route path="/customer/edit/:id" element={<CustomerEdit />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/employee/list" element={<EmployeeList />} />
          <Route path="/pdv" element={<PDV />} />
          <Route path="/comandas" element={<Comandas />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/caixa-resumo" element={<CaixaResumo />} />
          <Route path="/product/groups-units" element={<GroupsUnits />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
