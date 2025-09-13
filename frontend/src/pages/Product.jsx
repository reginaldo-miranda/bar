import { useState, useEffect } from "react";
import axios from "axios";
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
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [gruposDisponiveis, setGruposDisponiveis] = useState([]);
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState([]);
  const [modalGrupo, setModalGrupo] = useState(false);
  const [novoGrupo, setNovoGrupo] = useState({ nome: '', descricao: '', icone: '📦' });

  // Carregar grupos e unidades disponíveis
  useEffect(() => {
    carregarGruposEUnidades();
  }, []);

  const carregarGruposEUnidades = async () => {
    try {
      // Carregar grupos da API de grupos
      const gruposResponse = await fetch('http://localhost:4000/api/product-group/list');
      
      if (gruposResponse.ok) {
        const gruposData = await gruposResponse.json();
        const nomesDosGrupos = gruposData.map(grupo => grupo.nome);
        setGruposDisponiveis(nomesDosGrupos);
      } else {
        // Fallback: carregar grupos dos produtos existentes
        const produtosResponse = await fetch('http://localhost:4000/api/product/list');
        if (produtosResponse.ok) {
          const produtos = await produtosResponse.json();
          
          // Extrair grupos únicos dos produtos
          const gruposUnicos = [...new Set(produtos
            .map(produto => produto.grupo)
            .filter(grupo => grupo && grupo.trim() !== '')
          )];
          
          setGruposDisponiveis(gruposUnicos);
        }
      }
      
      // Definir unidades padrão (pode ser expandido para carregar do backend)
      setUnidadesDisponiveis(['un', 'kg', 'lt', 'ml', 'g', 'm', 'cm']);
      
    } catch (error) {
      console.error('Erro ao carregar grupos e unidades:', error);
      // Fallback para grupos padrão
      setGruposDisponiveis(['bebidas', 'comidas', 'limpeza']);
      setUnidadesDisponiveis(['un', 'kg', 'lt']);
    }
  };

  const handleSubmitGrupo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/product-group/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoGrupo),
      });
      
      if (response.ok) {
        setSucesso('Grupo cadastrado com sucesso!');
        setModalGrupo(false);
        setNovoGrupo({ nome: '', descricao: '', icone: '📦' });
        carregarGruposEUnidades(); // Recarregar grupos
      } else {
        setErro('Erro ao cadastrar grupo');
      }
    } catch (error) {
      console.error('Erro ao cadastrar grupo:', error);
      setErro('Erro ao cadastrar grupo');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduto({
      ...produto,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      const response = await axios.post("http://localhost:4000/api/product/create", produto);
      setSucesso("Produto cadastrado com sucesso!");
      console.log("Produto cadastrado:", response.data);
      
      // Limpar formulário após sucesso
      setProduto({
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
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      setErro(error.response?.data?.error || "Erro ao cadastrar produto");
    }
  };

  return (
    <div className="product-container">
      <h2>Cadastro de Produto</h2>
      
      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}
      
     <form onSubmit={handleSubmit}>
  <div className="top-row">
    {/* Checkbox Ativo */}
    <label className="ativo-label">
      <input
        type="checkbox"
        name="ativo"
        checked={produto.ativo}
        onChange={handleChange}
      /> Ativo
    </label>

    {/* ID do Produto */}
    <input
      type="text"
      name="id"
      value={produto.id}
      readOnly
      placeholder="ID do Produto"
    />
  </div>

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

  <div className="input-with-button">
    <select name="grupo" value={produto.grupo} onChange={handleChange}>
      <option value="">Selecione o Grupo</option>
      {gruposDisponiveis.map(grupo => (
        <option key={grupo} value={grupo}>
          {grupo.charAt(0).toUpperCase() + grupo.slice(1)}
        </option>
      ))}
    </select>
    <button 
      type="button" 
      className="btn-add-group"
      onClick={() => setModalGrupo(true)}
      title="Cadastrar novo grupo"
    >
      ➕
    </button>
  </div>

  <select name="unidade" value={produto.unidade} onChange={handleChange}>
    <option value="">Selecione a Unidade</option>
    {unidadesDisponiveis.map(unidade => (
      <option key={unidade} value={unidade}>
        {unidade === 'un' ? 'Unidade' : 
         unidade === 'kg' ? 'Quilograma' :
         unidade === 'lt' ? 'Litro' :
         unidade === 'ml' ? 'Mililitro' :
         unidade === 'g' ? 'Grama' :
         unidade === 'm' ? 'Metro' :
         unidade === 'cm' ? 'Centímetro' :
         unidade.toUpperCase()}
      </option>
    ))}
  </select>

  <input
    type="text"
    name="dadosFiscais"
    placeholder="Dados Fiscais (para NFCe)"
    value={produto.dadosFiscais}
    onChange={handleChange}
  />

  <button type="submit">Cadastrar Produto</button>
</form>

      {/* Modal Novo Grupo */}
      {modalGrupo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📦 Novo Grupo</h3>
              <button 
                className="modal-close"
                onClick={() => setModalGrupo(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitGrupo}>
                <div className="form-group">
                  <label>Nome do Grupo:</label>
                  <input
                    type="text"
                    value={novoGrupo.nome}
                    onChange={(e) => setNovoGrupo({...novoGrupo, nome: e.target.value})}
                    placeholder="Ex: Bebidas"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Descrição:</label>
                  <textarea
                    value={novoGrupo.descricao}
                    onChange={(e) => setNovoGrupo({...novoGrupo, descricao: e.target.value})}
                    placeholder="Descrição do grupo"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>Ícone:</label>
                  <div className="icones-grid">
                    {['📦', '🥤', '🍖', '🧽', '🍰', '🍿', '🍕', '🍺', '☕', '🥗'].map(icone => (
                      <button
                        key={icone}
                        type="button"
                        className={`icone-btn ${novoGrupo.icone === icone ? 'selected' : ''}`}
                        onClick={() => setNovoGrupo({...novoGrupo, icone})}
                      >
                        {icone}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Criar Grupo
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setModalGrupo(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Product;
