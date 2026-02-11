import { useEffect, useMemo, useState } from 'react'

const API = 'http://localhost:8080/api'

const PAGES = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  MATERIALS: 'materials',
  COMPOSITION: 'composition',
  PLANNING: 'planning'
}

import { useEffect, useState } from 'react'

const API = 'http://localhost:8080/api'

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

function BarChart({ title, items, valueKey, labelKey, color }) {
  const maxValue = Math.max(...items.map((item) => Number(item[valueKey])), 1)

  return (
    <article className="card">
      <h2>{title}</h2>
      <div className="chart">
        {items.length === 0 && <p className="muted">No data available.</p>}
        {items.map((item) => {
          const value = Number(item[valueKey])
          const width = Math.max((value / maxValue) * 100, 3)
          return (
            <div className="chart-row" key={item.id}>
              <div className="chart-label">{item[labelKey]}</div>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ width: `${width}%`, background: color }} />
              </div>
              <div className="chart-value">{value}</div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

export default function App() {
  const [page, setPage] = useState(PAGES.DASHBOARD)
  const [error, setError] = useState('')

export default function App() {
  const [products, setProducts] = useState([])
  const [materials, setMaterials] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productMaterials, setProductMaterials] = useState([])
  const [suggestion, setSuggestion] = useState({ items: [], grandTotalValue: 0 })

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
    const [p, m, s] = await Promise.all([
      request('/products'),
      request('/raw-materials'),
      request('/production/suggestions')
    ])
    setProducts(p)
    setMaterials(m)
    setSuggestion(s)
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
    if (!selectedProduct) return
    request(`/products/${selectedProduct}/materials`).then(setProductMaterials)
  }, [selectedProduct])

  const submitProduct = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await request('/products', { method: 'POST', body: JSON.stringify({ ...productForm, value: Number(productForm.value) }) })
      setProductForm({ name: '', value: '' })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
    await request('/products', { method: 'POST', body: JSON.stringify({ ...productForm, value: Number(productForm.value) }) })
    setProductForm({ name: '', value: '' })
    loadAll()
  }

  const submitMaterial = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await request('/raw-materials', { method: 'POST', body: JSON.stringify({ ...materialForm, stockQuantity: Number(materialForm.stockQuantity) }) })
      setMaterialForm({ name: '', stockQuantity: '' })
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
    await request('/raw-materials', { method: 'POST', body: JSON.stringify({ ...materialForm, stockQuantity: Number(materialForm.stockQuantity) }) })
    setMaterialForm({ name: '', stockQuantity: '' })
    loadAll()
  }

  const submitLink = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    try {
      setError('')
      await request(`/products/${selectedProduct}/materials`, {
        method: 'POST',
        body: JSON.stringify({ rawMaterialId: Number(linkForm.rawMaterialId), requiredQuantity: Number(linkForm.requiredQuantity) })
      })
      setLinkForm({ rawMaterialId: '', requiredQuantity: '' })
      const data = await request(`/products/${selectedProduct}/materials`)
      setProductMaterials(data)
      await loadAll()
    } catch (err) {
      setError(err.message)
    }
  }

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.value) - Number(a.value)),
    [products]
  )

  return (
    <main className="container">
      <header className="topbar card">
        <h1>Inventory Production Planner</h1>
        <nav className="menu">
          <button type="button" className={page === PAGES.DASHBOARD ? 'active' : ''} onClick={() => setPage(PAGES.DASHBOARD)}>Dashboard</button>
          <button type="button" className={page === PAGES.PRODUCTS ? 'active' : ''} onClick={() => setPage(PAGES.PRODUCTS)}>Products</button>
          <button type="button" className={page === PAGES.MATERIALS ? 'active' : ''} onClick={() => setPage(PAGES.MATERIALS)}>Raw Materials</button>
          <button type="button" className={page === PAGES.COMPOSITION ? 'active' : ''} onClick={() => setPage(PAGES.COMPOSITION)}>Composition</button>
          <button type="button" className={page === PAGES.PLANNING ? 'active' : ''} onClick={() => setPage(PAGES.PLANNING)}>Production</button>
        </nav>
      </header>

      {error && <p className="error">{error}</p>}

      {page === PAGES.DASHBOARD && (
        <section className="grid two-columns">
          <BarChart title="Product Value Chart" items={sortedProducts} valueKey="value" labelKey="name" color="#2b6ef2" />
          <BarChart title="Inventory Stock Chart" items={materials} valueKey="stockQuantity" labelKey="name" color="#0ea5a4" />
        </section>
      )}

      {page === PAGES.PRODUCTS && (
        <section className="card">
    await request(`/products/${selectedProduct}/materials`, {
      method: 'POST',
      body: JSON.stringify({ rawMaterialId: Number(linkForm.rawMaterialId), requiredQuantity: Number(linkForm.requiredQuantity) })
    })
    setLinkForm({ rawMaterialId: '', requiredQuantity: '' })
    const data = await request(`/products/${selectedProduct}/materials`)
    setProductMaterials(data)
    loadAll()
  }

  return (
    <main className="container">
      <h1>Inventory Production Planner</h1>

      <section className="grid">
        <article className="card">
          <h2>Products</h2>
          <form onSubmit={submitProduct} className="form">
            <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Name" required />
            <input value={productForm.value} onChange={(e) => setProductForm({ ...productForm, value: e.target.value })} type="number" min="0.01" step="0.01" placeholder="Value" required />
            <button type="submit">Add Product</button>
          </form>
          <ul>{products.map((p) => <li key={p.id}>{p.name} - ${p.value}</li>)}</ul>
        </section>
      )}

      {page === PAGES.MATERIALS && (
        <section className="card">
        </article>

        <article className="card">
          <h2>Raw Materials</h2>
          <form onSubmit={submitMaterial} className="form">
            <input value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} placeholder="Name" required />
            <input value={materialForm.stockQuantity} onChange={(e) => setMaterialForm({ ...materialForm, stockQuantity: e.target.value })} type="number" min="0" placeholder="Stock" required />
            <button type="submit">Add Material</button>
          </form>
          <ul>{materials.map((m) => <li key={m.id}>{m.name} - Stock: {m.stockQuantity}</li>)}</ul>
        </section>
      )}

      {page === PAGES.COMPOSITION && (
        <section className="card">
        </article>

        <article className="card">
          <h2>Product Composition</h2>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">Select Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <form onSubmit={submitLink} className="form top-gap">
          <form onSubmit={submitLink} className="form">
            <select value={linkForm.rawMaterialId} onChange={(e) => setLinkForm({ ...linkForm, rawMaterialId: e.target.value })} required>
              <option value="">Select Material</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input value={linkForm.requiredQuantity} onChange={(e) => setLinkForm({ ...linkForm, requiredQuantity: e.target.value })} type="number" min="1" placeholder="Required Qty" required />
            <button type="submit" disabled={!selectedProduct}>Link Material</button>
          </form>
          <ul>
            {productMaterials.map((pm) => <li key={pm.id}>{pm.rawMaterial.name}: {pm.requiredQuantity}</li>)}
          </ul>
        </section>
      )}

      {page === PAGES.PLANNING && (
        <section className="card">
          <h2>Suggested Production (higher value first)</h2>
          <ul>
            {suggestion.items.map((item) => (
              <li key={item.productId}>
                {item.productName}: {item.producibleQuantity} units - total ${item.totalValue}
              </li>
            ))}
          </ul>
          <strong>Grand Total Value: ${suggestion.grandTotalValue}</strong>
        </section>
      )}
        </article>
      </section>

      <section className="card">
        <h2>Suggested Production (higher value first)</h2>
        <ul>
          {suggestion.items.map((item) => (
            <li key={item.productId}>
              {item.productName}: {item.producibleQuantity} units - total ${item.totalValue}
            </li>
          ))}
        </ul>
        <strong>Grand Total Value: ${suggestion.grandTotalValue}</strong>
      </section>
    </main>
  )
}
