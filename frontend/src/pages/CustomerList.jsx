import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CustomerList.css";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/customer/list");
      setCustomers(response.data);
      setLoading(false);
    } catch {
      setError("Erro ao carregar clientes");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await axios.delete(`http://localhost:4000/api/customer/${id}`);
        setCustomers(customers.filter(customer => customer._id !== id));
      } catch {
        setError("Erro ao excluir cliente");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/customer/edit/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h1>Lista de Clientes</h1>
        <button 
          className="btn-new-customer"
          onClick={() => navigate("/customer")}
        >
          Novo Cliente
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {customers.length === 0 ? (
        <div className="no-customers">
          <p>Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Data Nascimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.nome || "N/A"}</td>
                  <td>{customer.cpf || "N/A"}</td>
                  <td>{customer.fone || "N/A"}</td>
                  <td>{customer.cidade || "N/A"}</td>
                  <td>{customer.estado || "N/A"}</td>
                  <td>{formatDate(customer.dataNascimento)}</td>
                  <td>
                    <span className={`status ${customer.ativo ? 'active' : 'inactive'}`}>
                      {customer.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(customer._id)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(customer._id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerList;