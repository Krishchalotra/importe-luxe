import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['watches', 'perfumes', 'apparel', 'accessories', 'jewelry', 'handbags', 'footwear'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', brand: '', category: 'watches', price: '', stock: '', isFeatured: false });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=50');
      setProducts(res.data.data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append('images', img));

      if (editProduct) {
        await api.patch(`/products/${editProduct._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm({ name: '', description: '', brand: '', category: 'watches', price: '', stock: '', isFeatured: false });
      setImages([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, description: product.description, brand: product.brand, category: product.category, price: product.price, stock: product.stock, isFeatured: product.isFeatured });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl text-luxury-text">Products</h1>
        <button onClick={() => { setShowForm(true); setEditProduct(null); }} className="btn-primary">
          + Add Product
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-luxury-dark border border-luxury-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl text-luxury-text">{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-luxury-subtext hover:text-luxury-text">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', key: 'name', colSpan: 2 },
                  { label: 'Brand', key: 'brand' },
                  { label: 'Price', key: 'price', type: 'number' },
                  { label: 'Stock', key: 'stock', type: 'number' },
                ].map(({ label, key, type = 'text', colSpan }) => (
                  <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required className="input-luxury" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-luxury capitalize">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-gold-500" />
                  <label htmlFor="featured" className="text-sm text-luxury-subtext">Featured</label>
                </div>
              </div>
              <div>
                <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="input-luxury resize-none" />
              </div>
              {!editProduct && (
                <div>
                  <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">Images</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="text-sm text-luxury-subtext" required />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded" />)}</div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-luxury-border">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-luxury-subtext tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-luxury-charcoal transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]?.url} alt={product.name} className="w-10 h-10 object-cover" />
                      <div>
                        <p className="text-luxury-text font-medium truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-luxury-subtext">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-luxury-subtext capitalize">{product.category}</td>
                  <td className="px-4 py-3 text-gold-400">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${product.stock <= 5 ? 'text-red-400' : 'text-green-400'}`}>{product.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    {product.isFeatured ? <span className="text-xs text-gold-400">Yes</span> : <span className="text-xs text-luxury-subtext">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(product)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
