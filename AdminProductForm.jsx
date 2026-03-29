import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    category: '',
    colors: [],
    sizes: [],
    images: [],
    stock: '',
    featured: false
  });
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discount: product.discount.toString(),
        category: product.category,
        colors: product.colors || [],
        sizes: product.sizes || [],
        images: product.images || [],
        stock: product.stock.toString(),
        featured: product.featured
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/products');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const handleRemoveSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);
      const response = await axios.post(`${API}/admin/upload-image`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.image_url}`;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url?.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock) || 0
      };

      if (isEdit) {
        await axios.put(`${API}/admin/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/admin/products`, payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-product-form">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-zinc-400 hover:text-white"
          data-testid="back-btn"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="heading-lg">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card-surface p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label-text block mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full input-field"
                placeholder="Enter product name"
                required
                data-testid="product-name-input"
              />
            </div>

            <div>
              <label className="label-text block mb-2">Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full input-field"
                placeholder="e.g., Blazers, Dresses"
                required
                data-testid="product-category-input"
              />
            </div>

            <div>
              <label className="label-text block mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full input-field"
                placeholder="0"
                min="0"
                data-testid="product-stock-input"
              />
            </div>

            <div>
              <label className="label-text block mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full input-field"
                placeholder="0"
                min="0"
                step="0.01"
                required
                data-testid="product-price-input"
              />
            </div>

            <div>
              <label className="label-text block mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full input-field"
                placeholder="0"
                min="0"
                max="100"
                data-testid="product-discount-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-text block mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full input-field min-h-[100px]"
                placeholder="Enter product description"
                data-testid="product-description-input"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="label-text block mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.colors.map((color) => (
                <span key={color} className="flex items-center gap-1 bg-zinc-800 px-3 py-1 text-sm">
                  {color}
                  <button type="button" onClick={() => handleRemoveColor(color)} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="flex-1 input-field"
                placeholder="Add color"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                data-testid="add-color-input"
              />
              <button type="button" onClick={handleAddColor} className="btn-secondary" data-testid="add-color-btn">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="label-text block mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.sizes.map((size) => (
                <span key={size} className="flex items-center gap-1 bg-zinc-800 px-3 py-1 text-sm">
                  {size}
                  <button type="button" onClick={() => handleRemoveSize(size)} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="flex-1 input-field"
                placeholder="Add size (e.g., S, M, L)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                data-testid="add-size-input"
              />
              <button type="button" onClick={handleAddSize} className="btn-secondary" data-testid="add-size-btn">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label-text block mb-2">Images</label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-[3/4] bg-zinc-800">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/80 flex items-center justify-center text-white hover:bg-red-500"
                    data-testid={`remove-image-${index}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* Upload Button */}
              <label className="aspect-[3/4] border-2 border-dashed border-zinc-700 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload size={24} className="text-zinc-500 mb-2" />
                <span className="text-xs text-zinc-500">
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  data-testid="upload-image-input"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-sm text-zinc-400 hover:text-white"
              data-testid="add-image-url"
            >
              + Add image by URL
            </button>
          </div>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-5 h-5"
              data-testid="product-featured-checkbox"
            />
            <span className="text-sm">Mark as Featured Product</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            data-testid="save-product-btn"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
