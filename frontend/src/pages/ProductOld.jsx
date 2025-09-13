import { useState } from "react";
import "../styles/product.css";

function Product() {
  const [produto, setProduto] = useState({
    nome: "",
    descricao: "",
    precoCusto: "",
    precoVenda: "",
    grupo: "",
    unidade: "",
    ativo: true,
    dadosFiscais: "",
    quantidade: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduto({
      ...produto,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Produto cadastrado:", produto);
    // aqui você pode enviar para a API
  };

  return (
    <div className="product-container">
      <h2>Cadastro de Produto</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome do produto *"
          value={produto.nome}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="precoCusto"
          placeholder="Preço de Custo *"
          value={produto.precoCusto}
          onChange={handleChange}
          step="0.01"
          required
        />

        <input
          type="number"
          name="precoVenda"
          placeholder="Preço de Venda *"
          value={produto.precoVenda}
          onChange={handleChange}
          step="0.01"
          required
        />

        <input
          type="number"
          name="quantidade"
          placeholder="Quantidade"
          value={produto.quantidade}
          onChange={handleChange}
        />

        <textarea
          name="descricao"
          placeholder="Descrição"
          value={produto.descricao}
          onChange={handleChange}
          rows={3}
        />

        <select name="grupo" value={produto.grupo} onChange={handleChange}>
          <option value="">Selecione o Grupo</option>
          <option value="bebidas">Bebidas</option>
          <option value="comidas">Comidas</option>
          <option value="limpeza">Limpeza</option>
        </select>

        <select name="unidade" value={produto.unidade} onChange={handleChange}>
          <option value="">Selecione a Unidade</option>
          <option value="un">Unidade</option>
          <option value="kg">Kg</option>
          <option value="lt">Litro</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="ativo"
            checked={produto.ativo}
            onChange={handleChange}
          /> Ativo
        </label>

        <input
          type="text"
          name="dadosFiscais"
          placeholder="Dados Fiscais (para NFCe)"
          value={produto.dadosFiscais}
          onChange={handleChange}
        />

        <button type="submit">Cadastrar Produto</button>
      </form>
    </div>
  );
}

export default Product;
