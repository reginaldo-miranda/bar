import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/GroupsUnits.css';

function GroupsUnits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('grupos');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  
  // Estados para Grupos
  const [grupos, setGrupos] = useState([]);
  const [novoGrupo, setNovoGrupo] = useState({ nome: '', descricao: '', icone: '📦' });
  const [editandoGrupo, setEditandoGrupo] = useState(null);
  
  // Estados para Unidades
  const [unidades, setUnidades] = useState([]);
  const [novaUnidade, setNovaUnidade] = useState({ nome: '', sigla: '', descricao: '' });
  const [editandoUnidade, setEditandoUnidade] = useState(null);
  
  // Ícones disponíveis para grupos
  const iconesDisponiveis = [
    '🍺', '🍷', '🥤', '☕', '🧊', // Bebidas
    '🍖', '🍗', '🥩', '🍕', '🍔', '🌮', '🥗', '🍝', // Comidas
    '🍰', '🧁', '🍪', '🍫', '🍭', // Sobremesas
    '🧽', '🧴', '🧻', '🧼', // Limpeza
    '📦', '📋', '🏷️', '⚙️', '🔧' // Outros
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  // Detectar parâmetro da URL para definir aba ativa
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'grupos' || tabParam === 'unidades') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar grupos da API de grupos
      const gruposResponse = await fetch('http://localhost:4000/api/product-group/list');
      if (gruposResponse.ok) {
        const gruposData = await gruposResponse.json();
        setGrupos(gruposData);
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
          
          // Converter para formato do estado
          const gruposFormatados = gruposUnicos.map((grupo, index) => ({
            _id: (index + 1).toString(),
            nome: grupo.charAt(0).toUpperCase() + grupo.slice(1),
            descricao: `Grupo ${grupo}`,
            icone: '📦'
          }));
          
          setGrupos(gruposFormatados);
        }
      }
      
      setUnidades([
        { _id: '1', nome: 'Unidade', sigla: 'UN', descricao: 'Unidade individual' },
        { _id: '2', nome: 'Quilograma', sigla: 'KG', descricao: 'Peso em quilogramas' },
        { _id: '3', nome: 'Litro', sigla: 'L', descricao: 'Volume em litros' },
        { _id: '4', nome: 'Metro', sigla: 'M', descricao: 'Comprimento em metros' }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Funções para Grupos
  const handleSubmitGrupo = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    
    try {
      if (editandoGrupo) {
        // Atualizar grupo existente
        const response = await fetch(`http://localhost:4000/api/product-group/update/${editandoGrupo._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoGrupo)
        });
        
        if (response.ok) {
          setSucesso('Grupo atualizado com sucesso!');
          setEditandoGrupo(null);
          carregarDados();
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao atualizar grupo');
        }
      } else {
        // Criar novo grupo
        const response = await fetch('http://localhost:4000/api/product-group/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoGrupo)
        });
        
        if (response.ok) {
          setSucesso('Grupo criado com sucesso! Agora você pode usá-lo no cadastro de produtos.');
          carregarDados();
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao criar grupo');
        }
      }
      
      setNovoGrupo({ nome: '', descricao: '', icone: '📦' });
      setTimeout(() => {
        setSucesso('');
        setErro('');
      }, 5000);
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      setErro('Erro ao conectar com o servidor');
    }
  };

  const editarGrupo = (grupo) => {
    setEditandoGrupo(grupo);
    setNovoGrupo({ nome: grupo.nome, descricao: grupo.descricao, icone: grupo.icone });
  };

  const excluirGrupo = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/product-group/delete/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setSucesso('Grupo excluído com sucesso!');
          carregarDados();
        } else {
          const errorData = await response.json();
          setErro(errorData.error || 'Erro ao excluir grupo');
        }
      } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        setErro('Erro ao conectar com o servidor');
      }
    }
  };

  const cancelarEdicaoGrupo = () => {
    setEditandoGrupo(null);
    setNovoGrupo({ nome: '', descricao: '', icone: '📦' });
  };

  // Funções para Unidades
  const handleSubmitUnidade = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    
    try {
      if (editandoUnidade) {
        // Atualizar unidade existente
        const unidadesAtualizadas = unidades.map(unidade => 
          unidade._id === editandoUnidade._id 
            ? { ...unidade, ...novaUnidade }
            : unidade
        );
        setUnidades(unidadesAtualizadas);
        setSucesso('Unidade atualizada com sucesso!');
        setEditandoUnidade(null);
      } else {
        // Criar nova unidade
        const novaUnidadeObj = {
          _id: Date.now().toString(),
          ...novaUnidade
        };
        setUnidades([...unidades, novaUnidadeObj]);
        setSucesso('Unidade criada com sucesso! (Nota: Para usar esta unidade em produtos, você precisará implementar a API de unidades)');
      }
      
      setNovaUnidade({ nome: '', sigla: '', descricao: '' });
    } catch {
      setErro('Erro ao salvar unidade');
    }
  };

  const editarUnidade = (unidade) => {
    setEditandoUnidade(unidade);
    setNovaUnidade({ nome: unidade.nome, sigla: unidade.sigla, descricao: unidade.descricao });
  };

  const excluirUnidade = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      setUnidades(unidades.filter(unidade => unidade._id !== id));
      setSucesso('Unidade excluída com sucesso!');
    }
  };

  const cancelarEdicaoUnidade = () => {
    setEditandoUnidade(null);
    setNovaUnidade({ nome: '', sigla: '', descricao: '' });
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="groups-units-container">
      <div className="groups-units-header">
        <h1>⚙️ Gerenciar Grupos e Unidades</h1>
        <button 
          className="btn-back"
          onClick={() => navigate('/product/list')}
        >
          ← Voltar aos Produtos
        </button>
      </div>

      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'grupos' ? 'active' : ''}`}
          onClick={() => setActiveTab('grupos')}
        >
          📦 Grupos de Produtos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unidades' ? 'active' : ''}`}
          onClick={() => setActiveTab('unidades')}
        >
          📏 Unidades de Medida
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="tab-content">
        {activeTab === 'grupos' && (
          <div className="grupos-section">
            <div className="section-layout">
              {/* Formulário de Grupos */}
              <div className="form-section">
                <h3>{editandoGrupo ? 'Editar Grupo' : 'Novo Grupo'}</h3>
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
                      {iconesDisponiveis.map(icone => (
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
                      {editandoGrupo ? 'Atualizar' : 'Criar'} Grupo
                    </button>
                    {editandoGrupo && (
                      <button type="button" className="btn-secondary" onClick={cancelarEdicaoGrupo}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista de Grupos */}
              <div className="list-section">
                <h3>Grupos Cadastrados ({grupos.length})</h3>
                <div className="items-list">
                  {grupos.map(grupo => (
                    <div key={grupo._id} className="item-card">
                      <div className="item-info">
                        <div className="item-header">
                          <span className="item-icon">{grupo.icone}</span>
                          <h4>{grupo.nome}</h4>
                        </div>
                        <p className="item-description">{grupo.descricao}</p>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => editarGrupo(grupo)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => excluirGrupo(grupo._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {grupos.length === 0 && (
                    <div className="no-items">
                      <p>Nenhum grupo cadastrado ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'unidades' && (
          <div className="unidades-section">
            <div className="section-layout">
              {/* Formulário de Unidades */}
              <div className="form-section">
                <h3>{editandoUnidade ? 'Editar Unidade' : 'Nova Unidade'}</h3>
                <form onSubmit={handleSubmitUnidade}>
                  <div className="form-group">
                    <label>Nome da Unidade:</label>
                    <input
                      type="text"
                      value={novaUnidade.nome}
                      onChange={(e) => setNovaUnidade({...novaUnidade, nome: e.target.value})}
                      placeholder="Ex: Quilograma"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Sigla:</label>
                    <input
                      type="text"
                      value={novaUnidade.sigla}
                      onChange={(e) => setNovaUnidade({...novaUnidade, sigla: e.target.value.toUpperCase()})}
                      placeholder="Ex: KG"
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Descrição:</label>
                    <textarea
                      value={novaUnidade.descricao}
                      onChange={(e) => setNovaUnidade({...novaUnidade, descricao: e.target.value})}
                      placeholder="Descrição da unidade"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      {editandoUnidade ? 'Atualizar' : 'Criar'} Unidade
                    </button>
                    {editandoUnidade && (
                      <button type="button" className="btn-secondary" onClick={cancelarEdicaoUnidade}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista de Unidades */}
              <div className="list-section">
                <h3>Unidades Cadastradas ({unidades.length})</h3>
                <div className="items-list">
                  {unidades.map(unidade => (
                    <div key={unidade._id} className="item-card">
                      <div className="item-info">
                        <div className="item-header">
                          <span className="item-sigla">{unidade.sigla}</span>
                          <h4>{unidade.nome}</h4>
                        </div>
                        <p className="item-description">{unidade.descricao}</p>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-edit"
                          onClick={() => editarUnidade(unidade)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => excluirUnidade(unidade._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {unidades.length === 0 && (
                    <div className="no-items">
                      <p>Nenhuma unidade cadastrada ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupsUnits;