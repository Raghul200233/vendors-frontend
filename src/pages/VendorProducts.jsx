import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Package, Upload, Image as ImageIcon, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    basePrice: '',
    compareAtPrice: '',
    inventory: '',
    attributes: {},
    sizeInventory: []
  });
  
  const { token } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/vendor/myproducts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  // Handle image upload
  const handleImageUpload = async (productId, files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await axios.post(`${API_URL}/products/${productId}/images`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(`Uploaded ${files.length} image(s)`);
      fetchProducts(); // Refresh product list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDeleteImage = async (productId, imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`${API_URL}/products/${productId}/images/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Image deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  // Set primary image
  const handleSetPrimary = async (productId, imageId) => {
    try {
      await axios.put(`${API_URL}/products/${productId}/images/${imageId}/primary`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Primary image updated');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update primary image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: parseFloat(formData.basePrice),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        attributes: formData.attributes || {}
      };
      
      if (formData.category === 'Clothing') {
        const sizeInventory = formData.sizeInventory.map(item => ({
          size: item.size,
          quantity: parseInt(item.quantity) || 0,
          price: item.price ? parseFloat(item.price) : parseFloat(formData.basePrice)
        }));
        submitData.sizeInventory = sizeInventory;
        submitData.inventory = sizeInventory.reduce((sum, item) => sum + item.quantity, 0);
      } else {
        submitData.inventory = parseInt(formData.inventory) || 0;
      }
      
      let response;
      if (editingProduct) {
        response = await axios.put(`${API_URL}/products/${editingProduct._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        response = await axios.post(`${API_URL}/products`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
        
        // If product created successfully, prompt for image upload
        const newProduct = response.data.data;
        setTimeout(() => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.multiple = true;
          fileInput.accept = 'image/*';
          fileInput.onchange = (e) => {
            if (e.target.files.length > 0) {
              handleImageUpload(newProduct._id, e.target.files);
            }
          };
          fileInput.click();
        }, 500);
      }
      
      fetchProducts();
      setShowModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Electronics',
      basePrice: '',
      compareAtPrice: '',
      inventory: '',
      attributes: {},
      sizeInventory: []
    });
    setEditingProduct(null);
    setSelectedCategory('Electronics');
  };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Beauty', 'Sports', 'Toys', 'Other'];

  // Add size for clothing
  const addSize = () => {
    setFormData({
      ...formData,
      sizeInventory: [...formData.sizeInventory, { size: 'M', quantity: 0, price: 0 }]
    });
  };

  const updateSize = (index, field, value) => {
    const updatedSizes = [...formData.sizeInventory];
    updatedSizes[index][field] = value;
    setFormData({ ...formData, sizeInventory: updatedSizes });
  };

  const removeSize = (index) => {
    const updatedSizes = formData.sizeInventory.filter((_, i) => i !== index);
    setFormData({ ...formData, sizeInventory: updatedSizes });
  };

  const renderCategoryFields = () => {
    if (formData.category === 'Clothing') {
      return (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium">Size & Inventory</label>
              <button type="button" onClick={addSize} className="text-blue-600 text-sm hover:underline">
                + Add Size
              </button>
            </div>
            {formData.sizeInventory.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-2 p-2 bg-gray-50 rounded">
                <select
                  value={item.size}
                  onChange={(e) => updateSize(index, 'size', e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="3XL">3XL</option>
                </select>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => updateSize(index, 'quantity', e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="number"
                  placeholder="Price (optional)"
                  value={item.price}
                  onChange={(e) => updateSize(index, 'price', e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <button type="button" onClick={() => removeSize(index)} className="text-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and images</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>
      
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Image Gallery */}
              <div className="relative">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {/* Image count badge */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {product.images.length} image(s)
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Image upload button */}
                <label className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(product._id, e.target.files)}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                
                {/* Image previews */}
                {product.images && product.images.length > 0 && (
                  <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.url}
                          alt={`${product.name} ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded cursor-pointer"
                          onClick={() => window.open(img.url, '_blank')}
                        />
                        {img.isPrimary && (
                          <Star className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition">
                          <button
                            onClick={() => handleSetPrimary(product._id, img._id)}
                            className="text-white text-xs bg-blue-600 px-1 rounded"
                            title="Set as primary"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(product._id, img._id)}
                            className="text-white text-xs bg-red-600 px-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-blue-600">
                    ${product.basePrice}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.inventory}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setFormData(product);
                      setSelectedCategory(product.category);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Product Modal - Same as before but without image upload here */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setSelectedCategory(e.target.value);
                  }}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compare at Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Original price"
                  />
                </div>
              </div>
              
              {renderCategoryFields()}
              
              {formData.category !== 'Clothing' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Inventory Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Tip: After creating the product, you can upload multiple images from the product card.
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Uploading images...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;