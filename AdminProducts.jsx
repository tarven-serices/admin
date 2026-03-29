import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products?limit=100`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast.success('Product deleted');
      setDeleteDialog({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div data-testid="admin-products">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="heading-lg">Products</h1>
        <Link to="/admin/products/add" className="btn-primary flex items-center gap-2" data-testid="add-product-btn">
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="card-surface p-4 mb-6">
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full input-field pl-12"
            data-testid="product-search"
          />
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="body-text">No products found</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Product</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Stock</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Featured</th>
                  <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20" data-testid={`product-row-${product.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-zinc-800 flex-shrink-0">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.colors?.length || 0} colors • {product.sizes?.length || 0} sizes</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{product.category}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white">₹{product.final_price?.toLocaleString()}</p>
                        {product.discount > 0 && (
                          <p className="text-xs text-zinc-500 line-through">₹{product.price?.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.featured ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1">Yes</span>
                      ) : (
                        <span className="text-xs text-zinc-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                          data-testid={`edit-product-${product.id}`}
                        >
                          <Pencil size={16} />
                        </Link>
                        <Dialog open={deleteDialog.open && deleteDialog.product?.id === product.id} onOpenChange={(open) => setDeleteDialog({ open, product: open ? product : null })}>
                          <DialogTrigger asChild>
                            <button
                              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                              data-testid={`delete-product-${product.id}`}
                            >
                              <Trash size={16} />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0F0F11] border-zinc-800 max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="heading-sm">Delete Product</DialogTitle>
                            </DialogHeader>
                            <p className="body-text my-4">
                              Are you sure you want to delete "{product.name}"? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <DialogClose asChild>
                                <button className="flex-1 btn-secondary">Cancel</button>
                              </DialogClose>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="flex-1 bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600 transition-colors"
                                data-testid="confirm-delete"
                              >
                                Delete
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-500 mt-4">
        Showing {filteredProducts.length} of {products.length} products
      </p>
    </div>
  );
};
