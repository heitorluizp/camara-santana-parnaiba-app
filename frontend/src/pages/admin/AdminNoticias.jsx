import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function AdminNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [form, setForm] = useState({
    id: null,
    titulo: "",
    resumo: "",
    imagemUrl: "",
    conteudo: ""
  });

  useEffect(() => {
    fetch(`${API}/noticias`)
      .then(res => res.json())
      .then(data => setNoticias(data))
      .catch(err => console.error(err));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(n) {
    setForm({
      id: n.id,
      titulo: n.titulo,
      resumo: n.resumo,
      imagemUrl: n.imagemUrl || "",
      conteudo: n.conteudo
    });
  }

  function handleDelete(id) {
    // mock: só remove do estado
    setNoticias(noticias.filter(n => n.id !== id));
    if (form.id === id) {
      setForm({ id: null, titulo: "", resumo: "", imagemUrl: "", conteudo: "" });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.id) {
      setNoticias(
        noticias.map(n =>
          n.id === form.id ? { ...n, ...form } : n
        )
      );
    } else {
      const novo = {
        ...form,
        id: noticias.length ? Math.max(...noticias.map(n => n.id)) + 1 : 1
      };
      setNoticias([...noticias, novo]);
    }
    setForm({ id: null, titulo: "", resumo: "", imagemUrl: "", conteudo: "" });
  }

  return (
    <div>
      <h2>Admin - Notícias (mock)</h2>

      <h3>{form.id ? "Editar notícia" : "Nova notícia"}</h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 480, marginBottom: 24 }}>
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <input
          name="resumo"
          placeholder="Resumo"
          value={form.resumo}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <input
          name="imagemUrl"
          placeholder="URL da imagem (opcional)"
          value={form.imagemUrl}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <textarea
          name="conteudo"
          placeholder="Conteúdo completo"
          value={form.conteudo}
          onChange={handleChange}
          rows={4}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            border: "none",
            background: "#0af",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {form.id ? "Salvar alterações" : "Criar notícia"}
        </button>
      </form>

      <h3>Notícias cadastradas (mock)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #333", textAlign: "left", padding: 8 }}>ID</th>
            <th style={{ borderBottom: "1px solid #333", textAlign: "left", padding: 8 }}>Título</th>
            <th style={{ borderBottom: "1px solid #333", textAlign: "left", padding: 8 }}>Resumo</th>
            <th style={{ borderBottom: "1px solid #333", padding: 8 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map(n => (
            <tr key={n.id}>
              <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{n.id}</td>
              <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{n.titulo}</td>
              <td style={{ borderBottom: "1px solid #333", padding: 8 }}>{n.resumo}</td>
              <td style={{ borderBottom: "1px solid #333", padding: 8, textAlign: "center" }}>
                <button
                  onClick={() => handleEdit(n)}
                  style={{ marginRight: 8, padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "#f55", color: "#000", cursor: "pointer" }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
          {noticias.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 8 }}>Nenhuma notícia.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminNoticias;
