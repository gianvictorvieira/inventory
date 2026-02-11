import { useEffect, useMemo, useState } from 'react'

const API = 'http://localhost:8080/api'

const PAGES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  MATERIALS: 'materials',
  COMPOSITION: 'composition',
  PLANNING: 'planning'
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? 'Request failed')
  }

  if (response.status === 204) return null
  return response.json()
}

function BarChart({ title, items, valueKey, labelKey, formatValue = (v) => String(v) }) {
  const maxValue = Math.max(...items.map((i) => Number(i[valueKey] ?? 0)), 1)

  return (
    <article className="card">
      <h2>{title}</h2>

      <div className="chart">
        {items.length === 0 && <p className="muted">No data.</p>}

        {items.map((item) => {
          const raw = Number(item[valueKey] ?? 0)
          const width = Math.max((raw / maxValue) * 100, 3)

          return (
            <div className="chart-row" key={item.id}>
              <div className="chart-label">{item[labelKey]}</div>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ width: `${width}%`, background: '#2563eb' }} />
              </div>
              <div className="chart-value">{formatValue(raw)}</div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function money(n) {
  const v = Number(n)
  if (Number.isNaN(v)) return '0.00'
  return v.toFixed(2)
}

export default function App() {
  const [products, setProducts] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productMaterials, setProductMaterials] = useState([])
  const [suggestion, setSuggestion] = useState({ items: [], grandTotalValue: 0 })

  const [page, setPage] = useState(PAGES.DASHBOARD)
  const [error, setError] = useState('')

  const [productForm, setProductForm] = useState({ name: '', value: '' })
  const [materialForm, setMaterialForm] = useState({ name: '', stockQuantity: '' })
  const [linkForm, setLinkForm] = useState({ rawMaterialId: '', requiredQuantity: '' })

  async function loadAll() {
    try {
      setError('')
      const [p, m, s] = await Promise.all([
        request('/products'),
        request('/raw-materials'),
        request('/production/suggestions')
      ])
      setProducts(p)
      setMaterials(m)
      setSuggestion(s)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    if (!selectedProduct) {
      setProductMaterials([])
      return
    }

    request(`/products/${selectedProduct}/materials`)
      .then(setProductMaterials)
      .catch((err) => setError(err.message))
  }, [selectedProduct])

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.value) - Number(a.value)),
    [products]
  )

  const submitProduct = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await request('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: productForm.name,
          value: Number(productForm.value)
        })
      })
      setProductForm({ name: '', value: '' })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteProduct = async (id) => {
    try {
      setError('')
      await request(`/products/${id}`, { method: 'DELETE' })
      if (String(selectedProduct) === String(id)) setSelectedProduct('')
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const submitMaterial = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await request('/raw-materials', {
        method: 'POST',
        body: JSON.stringify({
          name: materialForm.name,
          stockQuantity: Number(materialForm.stockQuantity)
        })
      })
      setMaterialForm({ name: '', stockQuantity: '' })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteMaterial = async (id) => {
    try {
      setError('')
      await request(`/raw-materials/${id}`, { method: 'DELETE' })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const submitLink = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      setError('')
      await request(`/products/${selectedProduct}/materials`, {
        method: 'POST',
        body: JSON.stringify({
          rawMaterialId: Number(linkForm.rawMaterialId),
          requiredQuantity: Number(linkForm.requiredQuantity)
        })
      })

      setLinkForm({ rawMaterialId: '', requiredQuantity: '' })

      const data = await request(`/products/${selectedProduct}/materials`)
      setProductMaterials(data)

      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const refreshPlanning = async () => {
    await loadAll()
  }

  return (
    <main className="container">
      <header className="topbar card">
        <h1>Inventory Production Planner</h1>

        <nav className="menu">
          <button className={page === PAGES.DASHBOARD ? 'active' : ''} onClick={() => setPage(PAGES.DASHBOARD)}>Dashboard</button>
          <button className={page === PAGES.PRODUCTS ? 'active' : ''} onClick={() => setPage(PAGES.PRODUCTS)}>Products</button>
          <button className={page === PAGES.MATERIALS ? 'active' : ''} onClick={() => setPage(PAGES.MATERIALS)}>Raw Materials</button>
          <button className={page === PAGES.COMPOSITION ? 'active' : ''} onClick={() => setPage(PAGES.COMPOSITION)}>Composition</button>
          <button className={page === PAGES.PLANNING ? 'active' : ''} onClick={() => setPage(PAGES.PLANNING)}>Planning</button>
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      {/* ================= DASHBOARD (SÓ GRÁFICOS) ================= */}
      {page === PAGES.DASHBOARD && (
        <section className="grid two-columns">
          <BarChart
            title="Products (higher value first)"
            items={sortedProducts}
            valueKey="value"
            labelKey="name"
            formatValue={(v) => `$${money(v)}`}
          />

          <BarChart
            title="Inventory Stock"
            items={materials}
            valueKey="stockQuantity"
            labelKey="name"
            formatValue={(v) => String(Math.trunc(v))}
          />
        </section>
      )}

      {/* ================= PRODUCTS ================= */}
      {page === PAGES.PRODUCTS && (
        <section className="card">
          <h2>Products</h2>

          <form className="form" onSubmit={submitProduct}>
            <div className="form-row">
              <div>
                <label>Name</label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Table"
                  required
                />
              </div>

              <div>
                <label>Value</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.value}
                  onChange={(e) => setProductForm({ ...productForm, value: e.target.value })}
                  placeholder="e.g. 20.00"
                  required
                />
              </div>

              <button className="btn" type="submit">Add</button>
            </div>
          </form>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Name</th>
                <th className="num">Value</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td className="num">${money(p.value)}</td>
                  <td className="actions">
                    <button className="btn danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {sortedProducts.length === 0 && (
                <tr><td colSpan="4" className="muted">No products.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= MATERIALS ================= */}
      {page === PAGES.MATERIALS && (
        <section className="card">
          <h2>Raw Materials</h2>

          <form className="form" onSubmit={submitMaterial}>
            <div className="form-row two">
              <div>
                <label>Name</label>
                <input
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  placeholder="e.g. Wood"
                  required
                />
              </div>

              <div>
                <label>Stock quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={materialForm.stockQuantity}
                  onChange={(e) => setMaterialForm({ ...materialForm, stockQuantity: e.target.value })}
                  placeholder="e.g. 35"
                  required
                />
              </div>

              <button className="btn" type="submit">Add</button>
            </div>
          </form>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Name</th>
                <th className="num">Stock</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.name}</td>
                  <td className="num">{m.stockQuantity}</td>
                  <td className="actions">
                    <button className="btn danger" onClick={() => deleteMaterial(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan="4" className="muted">No raw materials.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= COMPOSITION ================= */}
      {page === PAGES.COMPOSITION && (
        <section className="grid">
          <article className="card">
            <h2>Select product</h2>

            <div className="form">
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>
                ))}
              </select>

              <h2 style={{ marginTop: 10 }}>Link raw material</h2>

              <form className="form" onSubmit={submitLink}>
                <div className="form-row three">
                  <div>
                    <label>Material</label>
                    <select
                      value={linkForm.rawMaterialId}
                      onChange={(e) => setLinkForm({ ...linkForm, rawMaterialId: e.target.value })}
                      required
                    >
                      <option value="">Select Material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} (stock {m.stockQuantity})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Required qty</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={linkForm.requiredQuantity}
                      onChange={(e) => setLinkForm({ ...linkForm, requiredQuantity: e.target.value })}
                      placeholder="e.g. 2"
                      required
                    />
                  </div>

                  <button className="btn" type="submit" disabled={!selectedProduct}>
                    Save link
                  </button>
                </div>

                <p className="helper">
                  Tip: linking the same material again should UPDATE the required quantity (no duplicates).
                </p>
              </form>
            </div>
          </article>

          <article className="card">
            <h2>Composition</h2>

            <table className="table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th className="num">Required qty</th>
                </tr>
              </thead>
              <tbody>
                {productMaterials.map((pm) => (
                  <tr key={pm.id}>
                    <td>{pm.rawMaterial?.name ?? '-'}</td>
                    <td className="num">{pm.requiredQuantity}</td>
                  </tr>
                ))}
                {selectedProduct && productMaterials.length === 0 && (
                  <tr><td colSpan="2" className="muted">No composition yet.</td></tr>
                )}
                {!selectedProduct && (
                  <tr><td colSpan="2" className="muted">Select a product to view composition.</td></tr>
                )}
              </tbody>
            </table>
          </article>
        </section>
      )}

      {/* ================= PLANNING ================= */}
      {page === PAGES.PLANNING && (
        <section className="card">
          <h2>Suggested Production</h2>

          <button className="btn secondary" onClick={refreshPlanning}>Refresh</button>

          <div style={{ height: 10 }} />

          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Qty</th>
                <th className="num">Unit</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {suggestion.items.map((item) => {
                // suportar nomes diferentes vindos do backend
                const unit = item.unitValue ?? item.productValue ?? item.value ?? 0
                const qty = item.producibleQuantity ?? item.qty ?? item.quantity ?? 0
                const total = item.totalValue ?? (Number(qty) * Number(unit))

                return (
                  <tr key={item.productId ?? item.id}>
                    <td>{item.productName ?? item.name}</td>
                    <td className="num">{qty}</td>
                    <td className="num">${money(unit)}</td>
                    <td className="num">${money(total)}</td>
                  </tr>
                )
              })}

              {suggestion.items.length === 0 && (
                <tr><td colSpan="4" className="muted">No producible items with current stock.</td></tr>
              )}
            </tbody>
          </table>

          <div className="kpi">
            <span className="muted">Grand total</span>
            <strong>${money(suggestion.grandTotalValue)}</strong>
          </div>
        </section>
      )}
    </main>
  )
}
