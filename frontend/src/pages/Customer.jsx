import { useState } from "react";
import axios from "axios";
import "../styles/Customer.css";

function Customer() {
  const [customer, setCustomer] = useState({
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

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomer(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await axios.post("http://localhost:4000/api/customer/create", customer);
      setSucesso("Cliente cadastrado com sucesso!");
      
      // Limpar formulário após sucesso
      setCustomer({
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
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro("Erro ao cadastrar cliente");
      }
    }
  };

  return (
    <div className="customer-container">
      <h2>Cadastro de Cliente</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="top-row">
          <label className="ativo-label">
            <input
              type="checkbox"
              name="ativo"
              checked={customer.ativo}
              onChange={handleChange}
            /> Ativo
          </label>
        </div>

        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={customer.nome}
          onChange={handleChange}
        />

        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={customer.endereco}
          onChange={handleChange}
        />

        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={customer.cidade}
          onChange={handleChange}
        />

        <select name="estado" value={customer.estado} onChange={handleChange}>
          <option value="">Selecione o Estado</option>
          <option value="AC">Acre</option>
          <option value="AL">Alagoas</option>
          <option value="AP">Amapá</option>
          <option value="AM">Amazonas</option>
          <option value="BA">Bahia</option>
          <option value="CE">Ceará</option>
          <option value="DF">Distrito Federal</option>
          <option value="ES">Espírito Santo</option>
          <option value="GO">Goiás</option>
          <option value="MA">Maranhão</option>
          <option value="MT">Mato Grosso</option>
          <option value="MS">Mato Grosso do Sul</option>
          <option value="MG">Minas Gerais</option>
          <option value="PA">Pará</option>
          <option value="PB">Paraíba</option>
          <option value="PR">Paraná</option>
          <option value="PE">Pernambuco</option>
          <option value="PI">Piauí</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="RN">Rio Grande do Norte</option>
          <option value="RS">Rio Grande do Sul</option>
          <option value="RO">Rondônia</option>
          <option value="RR">Roraima</option>
          <option value="SC">Santa Catarina</option>
          <option value="SP">São Paulo</option>
          <option value="SE">Sergipe</option>
          <option value="TO">Tocantins</option>
        </select>

        <input
          type="tel"
          name="fone"
          placeholder="Telefone"
          value={customer.fone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={customer.cpf}
          onChange={handleChange}
        />

        <input
          type="text"
          name="rg"
          placeholder="RG"
          value={customer.rg}
          onChange={handleChange}
        />

        <input
          type="date"
          name="dataNascimento"
          placeholder="Data de Nascimento"
          value={customer.dataNascimento}
          onChange={handleChange}
        />

        <button type="submit">Cadastrar Cliente</button>
      </form>

      {erro && <p className="error-message">{erro}</p>}
      {sucesso && <p className="success-message">{sucesso}</p>}
    </div>
  );
}

export default Customer;