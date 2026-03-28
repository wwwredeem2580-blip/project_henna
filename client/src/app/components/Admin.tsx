"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  ShoppingBag, 
  Image as ImageIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Package,
} from "lucide-react";
import { Design, Product, Booking, Order, BookingStatus, OrderStatus, AvailabilitySettings } from "../types";

interface AdminProps {
  designs: Design[];
  products: Product[];
  bookings: Booking[];
  orders: Order[];
  onUpdateDesign: (design: Design) => void;
  onAddDesign: (design: Design) => void;
  onDeleteDesign: (id: string) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  availabilitySettings: AvailabilitySettings;
  onUpdateAvailability: (settings: AvailabilitySettings) => void;
}

type AdminTab = "bookings" | "orders" | "products" | "designs" | "settings";

export function Admin({
  designs,
  products,
  bookings,
  orders,
  onUpdateDesign,
  onAddDesign,
  onDeleteDesign,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateBookingStatus,
  onUpdateOrderStatus,
  availabilitySettings,
  onUpdateAvailability
}: AdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingDesign, setIsAddingDesign] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "orders", label: "Orders", icon: Package },
    { id: "products", label: "Shop", icon: ShoppingBag },
    { id: "designs", label: "Designs", icon: ImageIcon },
    { id: "settings", label: "Settings", icon: Edit2 },
  ];

  return (
    <section className="px-6 lg:px-12 py-12 lg:py-24 min-h-screen bg-bg">
      <div className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-serif mb-4">Management</h2>
          <p className="text-ink-muted uppercase tracking-widest text-xs">Admin Control Center</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-8 lg:space-x-12 mb-12 border-b border-ink/5 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 pb-6 text-[10px] uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? "text-ink font-bold" : "text-ink-muted hover:text-ink"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "bookings" && (
              <BookingManagement 
                bookings={bookings} 
                onUpdateStatus={onUpdateBookingStatus} 
              />
            )}
            {activeTab === "orders" && (
              <OrderManagement 
                orders={orders} 
                onUpdateStatus={onUpdateOrderStatus} 
              />
            )}
            {activeTab === "products" && (
              <ProductManagement 
                products={products} 
                onAdd={() => setIsAddingProduct(true)}
                onEdit={setIsEditingProduct}
                onDelete={onDeleteProduct}
              />
            )}
            {activeTab === "designs" && (
              <DesignManagement 
                designs={designs} 
                onAdd={() => setIsAddingDesign(true)}
                onDelete={onDeleteDesign}
              />
            )}
            {activeTab === "settings" && (
              <SettingsManagement 
                settings={availabilitySettings} 
                onUpdate={onUpdateAvailability}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {isAddingProduct && (
        <ProductModal 
          onClose={() => setIsAddingProduct(false)} 
          onSave={(p) => { onAddProduct(p); setIsAddingProduct(false); }}
        />
      )}
      {isEditingProduct && (
        <ProductModal 
          product={isEditingProduct}
          onClose={() => setIsEditingProduct(null)} 
          onSave={(p) => { onUpdateProduct(p); setIsEditingProduct(null); }}
        />
      )}
      {isAddingDesign && (
        <DesignModal 
          onClose={() => setIsAddingDesign(false)} 
          onSave={(d) => { onAddDesign(d); setIsAddingDesign(false); }}
        />
      )}
    </section>
  );
}

function BookingManagement({ bookings, onUpdateStatus }: { bookings: Booking[], onUpdateStatus: (id: string, status: BookingStatus) => void }) {
  return (
    <div className="space-y-6">
      <div className="hidden lg:grid grid-cols-6 px-6 py-4 text-[10px] uppercase tracking-widest text-ink-muted border-b border-ink/5">
        <div className="col-span-2">Client / Event</div>
        <div>Date</div>
        <div>Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {bookings.map((booking) => (
        <div key={booking.id} className="flex flex-col lg:grid lg:grid-cols-6 px-6 py-8 items-start lg:items-center bg-white/50 border border-ink/5 rounded-sm hover:border-ink/20 transition-all space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 space-y-1">
            <p className="font-serif text-lg">{booking.name}</p>
            <p className="text-xs text-ink-muted">{booking.eventType} • {booking.location}</p>
          </div>
          <div className="text-sm font-light">
            <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Date & Time</span>
            {booking.date} at {booking.time}
          </div>
          <div>
            <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Status</span>
            <span className={`text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border ${
              booking.status === "pending" ? "border-amber-200 text-amber-600 bg-amber-50" :
              booking.status === "confirmed" ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
              booking.status === "completed" ? "border-ink/10 text-ink/40 bg-ink/5" :
              "border-rose-200 text-rose-600 bg-rose-50"
            }`}>
              {booking.status}
            </span>
          </div>
          <div className="lg:col-span-2 flex justify-start lg:justify-end space-x-4 w-full">
            {booking.status === "pending" && (
              <>
                <button 
                  onClick={() => onUpdateStatus(booking.id, "confirmed")}
                  className="flex-1 lg:flex-none flex items-center justify-center space-x-2 p-3 lg:p-2 text-emerald-600 border border-emerald-100 lg:border-none hover:bg-emerald-50 rounded-sm lg:rounded-full transition-colors"
                >
                  <Check size={18} />
                  <span className="lg:hidden text-[10px] uppercase tracking-widest">Confirm</span>
                </button>
                <button 
                  onClick={() => onUpdateStatus(booking.id, "cancelled")}
                  className="flex-1 lg:flex-none flex items-center justify-center space-x-2 p-3 lg:p-2 text-rose-600 border border-rose-100 lg:border-none hover:bg-rose-50 rounded-sm lg:rounded-full transition-colors"
                >
                  <X size={18} />
                  <span className="lg:hidden text-[10px] uppercase tracking-widest">Cancel</span>
                </button>
              </>
            )}
            {booking.status === "confirmed" && (
              <button 
                onClick={() => onUpdateStatus(booking.id, "completed")}
                className="w-full lg:w-auto flex items-center justify-center space-x-2 p-3 lg:p-0 text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink border border-ink/10 lg:border-none rounded-sm lg:rounded-none transition-colors"
              >
                <span>Mark Completed</span>
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderManagement({ orders, onUpdateStatus }: { orders: Order[], onUpdateStatus: (id: string, status: OrderStatus) => void }) {
  return (
    <div className="space-y-6">
      <div className="hidden lg:grid grid-cols-6 px-6 py-4 text-[10px] uppercase tracking-widest text-ink-muted border-b border-ink/5">
        <div className="col-span-2">Customer / Order ID</div>
        <div>Total</div>
        <div>Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {orders.map((order) => (
        <div key={order.id} className="flex flex-col lg:grid lg:grid-cols-6 px-6 py-8 items-start lg:items-center bg-white/50 border border-ink/5 rounded-sm space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 space-y-1">
            <p className="font-serif text-lg">{order.customerName}</p>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">#{order.id}</p>
          </div>
          <div className="text-sm font-medium">
            <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Total</span>
            Tk {order.total.toLocaleString()}
          </div>
          <div>
            <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Status</span>
            <span className="text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border border-ink/10">
              {order.status}
            </span>
          </div>
          <div className="lg:col-span-2 flex justify-start lg:justify-end space-x-4 w-full">
            <div className="w-full lg:w-auto">
              <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Update Status</span>
              <select 
                value={order.status}
                onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                className="w-full lg:w-auto bg-transparent border-b border-ink/10 text-[10px] uppercase tracking-widest py-1 outline-none focus:border-ink"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductManagement({ products, onAdd, onEdit, onDelete }: { 
  products: Product[], 
  onAdd: () => void, 
  onEdit: (p: Product) => void,
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={onAdd}
          className="flex items-center space-x-3 bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all"
        >
          <Plus size={14} />
          <span>New Product</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group bg-white/50 border border-ink/5 p-6 rounded-sm hover:border-ink/20 transition-all">
            <div className="aspect-square overflow-hidden mb-6 bg-ink/5 relative">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(product)} className="p-2 bg-bg text-ink rounded-full hover:bg-ink hover:text-bg transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(product.id)} className="p-2 bg-bg text-rose-600 rounded-full hover:bg-rose-600 hover:text-bg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-serif text-xl">{product.name}</h3>
                <span className="text-sm font-medium">Tk {product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-ink-muted">
                <span>{product.category} • {product.brand}</span>
                <span>Stock: {product.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignManagement({ designs, onAdd, onDelete }: { 
  designs: Design[], 
  onAdd: () => void,
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button 
          onClick={onAdd}
          className="flex items-center space-x-3 bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all"
        >
          <Plus size={14} />
          <span>New Design</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {designs.map((design) => (
          <div key={design.id} className="group bg-white/50 border border-ink/5 p-6 rounded-sm hover:border-ink/20 transition-all">
            <div className="aspect-[4/5] overflow-hidden mb-6 bg-ink/5 relative">
              <img src={design.images[0]} alt={design.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDelete(design.id)} className="p-2 bg-bg text-rose-600 rounded-full hover:bg-rose-600 hover:text-bg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="font-serif text-xl">{design.title}</h3>
              <span className="text-[10px] uppercase tracking-widest text-ink-muted">{design.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product?: Product, onClose: () => void, onSave: (p: Product) => void }) {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: "",
    brand: "",
    price: 0,
    images: [""],
    category: "Henna Cone",
    description: "",
    stock: 0,
    sizes: []
  });

  const handleImageChange = (index: number, val: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = val;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ""] });
  };

  const handleSizeChange = (index: number, val: string) => {
    const newSizes = [...(formData.sizes || [])];
    newSizes[index] = val;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeField = () => {
    setFormData({ ...formData, sizes: [...(formData.sizes || []), ""] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 lg:p-12 rounded-sm shadow-2xl custom-scrollbar"
      >
        <div className="flex justify-between items-start mb-12">
          <h3 className="text-3xl lg:text-4xl font-serif">{product ? "Edit Product" : "New Product"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: product?.id || Date.now().toString() } as Product); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Category</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif"
              >
                <option value="Henna Cone">Henna Cone</option>
                <option value="Henna Oil">Henna Oil</option>
                <option value="Hair Mask">Hair Mask</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Brand</label>
              <input 
                required
                type="text" 
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Price (Tk)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Stock Quantity</label>
              <input 
                required
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Available Sizes (Optional)</label>
            <div className="space-y-4">
              {formData.sizes?.map((size, idx) => (
                <div key={idx} className="flex space-x-4">
                  <input 
                    type="text" 
                    value={size}
                    onChange={(e) => handleSizeChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                    placeholder="e.g. 25g"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, sizes: formData.sizes?.filter((_, i) => i !== idx) })}
                    className="text-rose-600 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={addSizeField}
                className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
              >
                <Plus size={14} />
                <span>Add Size Option</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Product Images (URLs)</label>
            <div className="space-y-4">
              {formData.images?.map((url, idx) => (
                <div key={idx} className="flex space-x-4">
                  <input 
                    required
                    type="url" 
                    value={url}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                    placeholder="https://..."
                  />
                  {idx > 0 && (
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== idx) })}
                      className="text-rose-600 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button"
                onClick={addImageField}
                className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
              >
                <Plus size={14} />
                <span>Add Another Image</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors resize-none font-serif" 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-bg py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-all"
          >
            {product ? "Save Changes" : "Create Product"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function DesignModal({ onClose, onSave }: { onClose: () => void, onSave: (d: Design) => void }) {
  const [formData, setFormData] = useState<Partial<Design>>({
    title: "",
    category: "Traditional",
    images: [""],
    description: ""
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-bg w-full max-w-2xl p-6 lg:p-12 rounded-sm shadow-2xl"
      >
        <div className="flex justify-between items-start mb-12">
          <h3 className="text-3xl lg:text-4xl font-serif">New Design</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: Date.now().toString() } as Design); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Design Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ink-muted">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif"
              >
                <option value="Traditional">Traditional</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Arabic">Arabic</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Image URL</label>
            <input 
              required
              type="url" 
              value={formData.images?.[0]}
              onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Description</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors resize-none font-serif" 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-bg py-6 text-[10px] uppercase tracking-[0.4em] hover:bg-ink/90 transition-all"
          >
            Upload Design
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function SettingsManagement({ settings, onUpdate }: { settings: AvailabilitySettings, onUpdate: (s: AvailabilitySettings) => void }) {
  const [formData, setFormData] = useState<AvailabilitySettings>(settings);

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const handleDayToggle = (day: number) => {
    if (formData.availableDays.includes(day)) {
      setFormData({ ...formData, availableDays: formData.availableDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, availableDays: [...formData.availableDays, day].sort() });
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-2xl bg-white/50 border border-ink/5 p-8 lg:p-12 rounded-sm space-y-12">
      <div>
        <h3 className="font-serif text-2xl mb-2">Availability Schedule</h3>
        <p className="text-ink-muted text-sm">Configure which days and times you are available for bookings. These settings automatically update the pre-booking calendar.</p>
      </div>

      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Enabled Days</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {daysOfWeek.map(day => (
            <label key={day.value} className="flex items-center space-x-3 cursor-pointer group">
              <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                formData.availableDays.includes(day.value) ? "bg-ink border-ink text-bg" : "border-ink/20 group-hover:border-ink/50"
              }`}>
                {formData.availableDays.includes(day.value) && <Check size={14} />}
              </div>
              <span className="text-sm font-serif select-none">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Start Time</label>
          <input 
            type="time" 
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">End Time</label>
          <input 
            type="time" 
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all font-semibold"
      >
        Save Settings
      </button>
    </div>
  );
}
