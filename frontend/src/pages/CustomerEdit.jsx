import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Customer.css";

function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    fone: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    ativo: true
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/customer/${id}`);
      const customer = response.data;
      setFormData({
        nome: customer.nome || "",
        endereco: customer.endereco || "",
        cidade: customer.cidade || "",
        estado: customer.estado || "",
        fone: customer.fone || "",
        cpf: customer.cpf || "",
        rg: customer.rg || "",
        dataNascimento: customer.dataNascimento ? customer.dataNascimento.split('T')[0] : "",
        ativo: customer.ativo
      });
      setLoading(false);
    } catch {
      setError("Erro ao carregar dados do cliente");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSucesso("");

    try {
      await axios.put(`http://localhost:4000/api/customer/${id}`, formData);
      setSucesso("Cliente atualizado com sucesso!");
      setTimeout(() => {
        navigate("/customer/list");
      }, 2000);
    } catch {
      setError("Erro ao atualizar cliente. Verifique os dados e tente novamente.");
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="customer-container">
      <div className="customer-header">
        <h1>Editar Cliente</h1>
        <button 
          className="btn-back"
          onClick={() => navigate("/customer/list")}
        >
          Voltar à Lista
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-group">
          <label htmlFor="nome">Nome:</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite o nome"
          />
        </div>

        <div className="form-group">
          <label htmlFor="endereco">Endereço:</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Digite o endereço"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cidade">Cidade:</label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Digite a cidade"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado:</label>
          <input
            type="text"
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            placeholder="Digite o estado"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fone">Telefone:</label>
          <input
            type="text"
            id="fone"
            name="fone"
            value={formData.fone}
            onChange={handleChange}
            placeholder="Digite o telefone"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="Digite o CPF"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rg">RG:</label>
          <input
            type="text"
            id="rg"
            name="rg"
            value={formData.rg}
            onChange={handleChange}
            placeholder="Digite o RG"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dataNascimento">Data de Nascimento:</label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={formData.dataNascimento}
            onChange={handleChange}
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="ativo">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
            />
            Cliente Ativo
          </label>
        </div>

        <button type="submit" className="submit-button">
          Atualizar Cliente
        </button>
      </form>
    </div>
  );
}

export default CustomerEdit;