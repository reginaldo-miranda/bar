import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/product/list");
      setProducts(response.data);
      setLoading(false);
    } catch {
      setError("Erro ao carregar produtos");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(`http://localhost:4000/api/product/${id}`);
        setProducts(products.filter(product => product._id !== id));
      } catch {
        setError("Erro ao excluir produto");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/product/edit/${id}`);
  };

  const formatPrice = (price) => {
    if (!price) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Lista de Produtos</h1>
        <button 
          className="btn-new-product"
          onClick={() => navigate("/product")}
        >
          Novo Produto
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="no-products">
          <p>Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço Custo</th>
                <th>Preço Venda</th>
                <th>Grupo</th>
                <th>Unidade</th>
                <th>Quantidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.nome || "N/A"}</td>
                  <td>{product.descricao || "N/A"}</td>
                  <td>{formatPrice(product.precoCusto)}</td>
                  <td>{formatPrice(product.precoVenda)}</td>
                  <td>{product.grupo || "N/A"}</td>
                  <td>{product.unidade || "N/A"}</td>
                  <td>{product.quantidade || "0"}</td>
                  <td>
                    <span className={`status ${product.ativo ? 'active' : 'inactive'}`}>
                      {product.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(product._id)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product._id)}
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

export default ProductList;