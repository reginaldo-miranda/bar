import { useState } from "react";
import axios from "axios";
import "../styles/Employee.css";

function Employee() {
  const [employee, setEmployee] = useState({
    nome: "",
    endereco: "",
    bairro: "",
    telefone: "",
    salario: "",
    dataAdmissao: "",
    ativo: true
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await axios.post("http://localhost:4000/api/employee/create", employee);
      setSucesso("Funcionário cadastrado com sucesso!");
      
      // Limpar formulário após sucesso
      setEmployee({
        nome: "",
        endereco: "",
        bairro: "",
        telefone: "",
        salario: "",
        dataAdmissao: "",
        ativo: true
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro("Erro ao cadastrar funcionário");
      }
    }
  };

  return (
    <div className="employee-container">
      <h2>Cadastro de Funcionário</h2>
      
      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="top-row">
          <label className="ativo-label">
            <input
              type="checkbox"
              name="ativo"
              checked={employee.ativo}
              onChange={handleChange}
            /> Ativo
          </label>
        </div>

        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={employee.nome}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={employee.endereco}
          onChange={handleChange}
        />

        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={employee.bairro}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="telefone"
          placeholder="Telefone"
          value={employee.telefone}
          onChange={handleChange}
        />

        <input
          type="number"
          name="salario"
          placeholder="Salário"
          value={employee.salario}
          onChange={handleChange}
          step="0.01"
          min="0"
        />

        <input
          type="date"
          name="dataAdmissao"
          placeholder="Data de Admissão"
          value={employee.dataAdmissao}
          onChange={handleChange}
        />

        <button type="submit">Cadastrar Funcionário</button>
      </form>
    </div>
  );
}

export default Employee;