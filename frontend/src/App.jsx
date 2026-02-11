import { useEffect, useState, useMemo } from 'react'

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

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!selectedProduct) {
      setProductMaterials([])
      return
    }

    request(`/products/${selectedProduct}/materials`)
      .then(setProductMaterials)
      .catch((err) => setError(err.message))
  }, [selectedProduct])

  const submitProduct = async (e) => {
    e.preventDefault()
    try {
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

  const submitMaterial = async (e) => {
  e.preventDefault()

  const name = materialForm.name.trim()
  const stockQuantity = Number(materialForm.stockQuantity)

  if (!name) return setError('Material name is required')
  if (!Number.isFinite(stockQuantity) || stockQuantity <= 0) {
    return setError('Stock must be a number greater than 0')
  }

  try {
    setError('')
    await request('/raw-materials', {
      method: 'POST',
      body: JSON.stringify({ name, stockQuantity })
    })
    setMaterialForm({ name: '', stockQuantity: '' })
    await loadAll()
  } catch (err) {
    setError(err.message)
  }
}


  const submitLink = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
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

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.value) - Number(a.value)),
    [products]
  )

  return (
    <main className="container">
      <h1>Inventory Production Planner</h1>

      {/* Navigation */}
      <nav className="menu">
        <button onClick={() => setPage(PAGES.DASHBOARD)}>Dashboard</button>
        <button onClick={() => setPage(PAGES.PRODUCTS)}>Products</button>
        <button onClick={() => setPage(PAGES.MATERIALS)}>Raw Materials</button>
        <button onClick={() => setPage(PAGES.COMPOSITION)}>Composition</button>
        <button onClick={() => setPage(PAGES.PLANNING)}>Planning</button>
      </nav>

      {error && <p className="error">{error}</p>}

      {/* ================= DASHBOARD ================= */}
      {page === PAGES.DASHBOARD && (
        <section className="grid">
          <article className="card">
            <h2>Products by Value</h2>
            <ul>
              {sortedProducts.map((p) => (
                <li key={p.id}>
                  {p.name} - ${p.value}
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Inventory Stock</h2>
            <ul>
              {materials.map((m) => (
                <li key={m.id}>
                  {m.name} - {m.stockQuantity}
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {/* ================= PRODUCTS ================= */}
      {page === PAGES.PRODUCTS && (
        <section className="card">
          <h2>Products</h2>

          <form onSubmit={submitProduct}>
            <input
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
              placeholder="Name"
              required
            />
            <input
              type="number"
              value={productForm.value}
              onChange={(e) =>
                setProductForm({ ...productForm, value: e.target.value })
              }
              placeholder="Value"
              required
            />
            <button type="submit">Add</button>
          </form>

          <ul>
            {sortedProducts.map((p) => (
              <li key={p.id}>
                {p.name} - ${p.value}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= MATERIALS ================= */}
      {page === PAGES.MATERIALS && (
        <section className="card">
          <h2>Raw Materials</h2>

          <form onSubmit={submitMaterial}>
            <input
              value={materialForm.name}
              onChange={(e) =>
                setMaterialForm({ ...materialForm, name: e.target.value })
              }
              placeholder="Name"
              required
            />
            <input
              type="number"
              value={materialForm.stockQuantity}
              onChange={(e) =>
                setMaterialForm({
                  ...materialForm,
                  stockQuantity: e.target.value
                })
              }
              placeholder="Stock"
              required
            />
            <button type="submit">Add</button>
          </form>

          <ul>
            {materials.map((m) => (
              <li key={m.id}>
                {m.name} - {m.stockQuantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= COMPOSITION ================= */}
      {page === PAGES.COMPOSITION && (
        <section className="card">
          <h2>Product Composition</h2>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <form onSubmit={submitLink}>
            <select
              value={linkForm.rawMaterialId}
              onChange={(e) =>
                setLinkForm({ ...linkForm, rawMaterialId: e.target.value })
              }
              required
            >
              <option value="">Select Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={linkForm.requiredQuantity}
              onChange={(e) =>
                setLinkForm({
                  ...linkForm,
                  requiredQuantity: e.target.value
                })
              }
              placeholder="Required Qty"
              required
            />

            <button type="submit" disabled={!selectedProduct}>
              Link
            </button>
          </form>

          <ul>
            {productMaterials.map((pm) => (
              <li key={pm.id}>
                {pm.rawMaterial.name}: {pm.requiredQuantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================= PLANNING ================= */}
      {page === PAGES.PLANNING && (
        <section className="card">
          <h2>Suggested Production</h2>

          <ul>
            {suggestion.items.map((item) => (
              <li key={item.productId}>
                {item.productName}: {item.producibleQuantity} units - $
                {item.totalValue}
              </li>
            ))}
          </ul>

          <strong>Total: ${suggestion.grandTotalValue}</strong>
        </section>
      )}
    </main>
  )
}
