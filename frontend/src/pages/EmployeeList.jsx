import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EmployeeList.css";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/employee/list");
      setEmployees(response.data);
      setLoading(false);
    } catch {
      setError("Erro ao carregar funcionários");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await axios.delete(`http://localhost:4000/api/employee/${id}`);
        setEmployees(employees.filter(employee => employee._id !== id));
      } catch {
        setError("Erro ao excluir funcionário");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/employee/edit/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatSalary = (salary) => {
    if (!salary) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salary);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h1>Lista de Funcionários</h1>
        <button 
          className="btn-new-employee"
          onClick={() => navigate("/employee")}
        >
          Novo Funcionário
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {employees.length === 0 ? (
        <div className="no-employees">
          <p>Nenhum funcionário cadastrado.</p>
        </div>
      ) : (
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Bairro</th>
                <th>Telefone</th>
                <th>Salário</th>
                <th>Data Admissão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.nome || "N/A"}</td>
                  <td>{employee.endereco || "N/A"}</td>
                  <td>{employee.bairro || "N/A"}</td>
                  <td>{employee.telefone || "N/A"}</td>
                  <td>{formatSalary(employee.salario)}</td>
                  <td>{formatDate(employee.dataAdmissao)}</td>
                  <td>
                    <span className={`status ${employee.ativo ? 'active' : 'inactive'}`}>
                      {employee.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(employee._id)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(employee._id)}
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

export default EmployeeList;