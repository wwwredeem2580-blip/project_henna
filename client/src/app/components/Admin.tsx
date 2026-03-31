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

import { useStore } from "../context/StoreContext";

type AdminTab = "bookings" | "orders" | "products" | "designs" | "settings";

export function Admin() {
  const { 
    designs, setDesigns, 
    products, setProducts, 
    bookings, setBookings, 
    orders, setOrders, 
    availabilitySettings, setAvailabilitySettings 
  } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingDesign, setIsEditingDesign] = useState<Design | null>(null);
  const [isAddingDesign, setIsAddingDesign] = useState(false);
  const [confirmingBooking, setConfirmingBooking] = useState<Booking | null>(null);

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "orders", label: "Orders", icon: Package },
    { id: "products", label: "Shop", icon: ShoppingBag },
    { id: "designs", label: "Designs", icon: ImageIcon },
    { id: "settings", label: "Settings", icon: Edit2 },
  ];

  const productCategories = Array.from(new Set(products.map(p => p.category)));
  ["Henna Cone", "Henna Oil", "Hair Mask"].forEach(c => {
    if (!productCategories.includes(c)) productCategories.push(c);
  });

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
                availabilitySettings={availabilitySettings}
                onUpdateStatus={(id, status) => {
                  if (status === "confirmed") {
                    setConfirmingBooking(bookings.find(b => b.id === id) || null);
                  } else {
                    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
                  }
                }} 
              />
            )}
            {activeTab === "orders" && (
              <OrderManagement 
                orders={orders} 
                onUpdateStatus={(id, status) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o))} 
              />
            )}
            {activeTab === "products" && (
              <ProductManagement 
                products={products} 
                onAdd={() => setIsAddingProduct(true)}
                onEdit={setIsEditingProduct}
                onDelete={(id) => setProducts(products.filter(p => p.id !== id))}
              />
            )}
            {activeTab === "designs" && (
              <DesignManagement 
                designs={designs} 
                onAdd={() => setIsAddingDesign(true)}
                onEdit={setIsEditingDesign}
                onDelete={(id) => setDesigns(designs.filter(d => d.id !== id))}
              />
            )}
            {activeTab === "settings" && (
              <SettingsManagement 
                settings={availabilitySettings} 
                onUpdate={setAvailabilitySettings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {isAddingProduct && (
        <ProductModal 
          onClose={() => setIsAddingProduct(false)} 
          onSave={(p) => { setProducts([...products, p]); setIsAddingProduct(false); }}
          existingCategories={productCategories}
        />
      )}
      {isEditingProduct && (
        <ProductModal 
          product={isEditingProduct}
          onClose={() => setIsEditingProduct(null)} 
          onSave={(p) => { setProducts(products.map(old => old.id === p.id ? p : old)); setIsEditingProduct(null); }}
          existingCategories={productCategories}
        />
      )}
      {isAddingDesign && (
        <DesignModal 
          onClose={() => setIsAddingDesign(false)} 
          onSave={(d) => { setDesigns([...designs, d]); setIsAddingDesign(false); }}
        />
      )}
      {isEditingDesign && (
        <DesignModal 
          design={isEditingDesign}
          onClose={() => setIsEditingDesign(null)} 
          onSave={(d) => { setDesigns(designs.map(old => old.id === d.id ? d : old)); setIsEditingDesign(null); }}
        />
      )}
      {confirmingBooking && (
        <ConfirmationModal
          booking={confirmingBooking}
          onClose={() => setConfirmingBooking(null)}
          onConfirm={(startTime, endTime) => {
            setBookings(bookings.map(b => b.id === confirmingBooking.id ? { ...b, status: "confirmed", time: startTime, endTime } : b));
            setConfirmingBooking(null);
          }}
        />
      )}
    </section>
  );
}

function BookingManagement({ bookings, availabilitySettings, onUpdateStatus }: { bookings: Booking[], availabilitySettings: AvailabilitySettings, onUpdateStatus: (id: string, status: BookingStatus) => void }) {
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
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">
              {booking.eventType} • {booking.locationType === "user_location" ? "Artist Goes to Location" : "Come to Service Location"}
            </p>
            <p className="text-xs text-ink-muted">{booking.location}</p>
            {booking.transactionId && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] uppercase tracking-widest text-ink/40">
                  {availabilitySettings.paymentMethods.find(m => m.id === booking.paymentMethodId)?.name || "Payment"}:
                </span>
                <p className="text-[10px] font-mono bg-ink/5 px-2 py-0.5 inline-block rounded-sm">{booking.transactionId}</p>
              </div>
            )}
          </div>
          <div className="text-sm font-light">
            <span className="lg:hidden text-[10px] uppercase tracking-widest text-ink-muted block mb-1">Date & Time</span>
            <p>{booking.date}</p>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest mt-0.5">
              {booking.time} {booking.endTime ? `— ${booking.endTime}` : ""}
            </p>
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

function DesignManagement({ designs, onAdd, onEdit, onDelete }: { 
  designs: Design[], 
  onAdd: () => void,
  onEdit: (d: Design) => void,
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
                <button onClick={() => onEdit(design)} className="p-2 bg-bg text-ink rounded-full hover:bg-ink hover:text-bg transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(design.id)} className="p-2 bg-bg text-rose-600 rounded-full hover:bg-rose-600 hover:text-bg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="font-serif text-xl">{design.title}</h3>
              <p className="text-[10px] uppercase tracking-widest text-ink mt-1 font-medium">Tk {design.price}</p>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">{design.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSave, existingCategories }: { product?: Product, onClose: () => void, onSave: (p: Product) => void, existingCategories: string[] }) {
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: "",
    brand: "",
    price: 0,
    images: [""],
    category: "Henna Cone",
    description: "",
    stock: 0,
    sizes: [],
    variantImages: {}
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
    const newSizeImages = { ...(formData.variantImages || {}) };
    const oldSize = newSizes[index];
    if (oldSize && newSizeImages[oldSize]) {
      newSizeImages[val] = newSizeImages[oldSize];
      delete newSizeImages[oldSize];
    }
    newSizes[index] = val;
    setFormData({ ...formData, sizes: newSizes, variantImages: newSizeImages });
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-widest text-ink-muted">Category</label>
                <button 
                  type="button" 
                  onClick={() => setIsCustomCategory(!isCustomCategory)} 
                  className="text-[10px] uppercase tracking-widest text-ink hover:underline border-none bg-transparent"
                >
                  {isCustomCategory ? "Select Existing" : "Add Custom"}
                </button>
              </div>
              {isCustomCategory ? (
                <input 
                  required
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                  placeholder="Enter custom category"
                />
              ) : (
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif"
                >
                  {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
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
                <div key={idx} className="flex space-x-4 items-center">
                  <input 
                    type="text" 
                    value={size}
                    onChange={(e) => handleSizeChange(idx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                    placeholder="e.g. 25g"
                  />
                  <div className="relative w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-dashed border-ink/20 hover:border-ink/50 transition-colors flex items-center justify-center group">
                    {formData.variantImages?.[size] ? (
                      <>
                        <img src={formData.variantImages[size]} alt="Variant" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newSizeImages = { ...(formData.variantImages || {}) };
                            delete newSizeImages[size];
                            setFormData({ ...formData, variantImages: newSizeImages });
                          }} 
                          className="absolute inset-0 bg-rose-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={10} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <input 
                          type="file" 
                          accept="image/*"
                          title="Add Variant Image"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const url = reader.result as string;
                                const newSizeImages = { ...(formData.variantImages || {}), [size]: url };
                                const newImages = Array.from(new Set([...(formData.images || []), url]));
                                setFormData({ ...formData, images: newImages, variantImages: newSizeImages });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <ImageIcon className="text-ink/30" size={14} />
                      </>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const newSizes = formData.sizes?.filter((_, i) => i !== idx) || [];
                      const newSizeImages = { ...(formData.variantImages || {}) };
                      delete newSizeImages[size];
                      setFormData({ ...formData, sizes: newSizes, variantImages: newSizeImages });
                    }}
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
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Product Images</label>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {formData.images?.filter(url => url.length > 0).map((url, idx) => (
                <div key={idx} className="relative aspect-square bg-ink/5 rounded-sm overflow-hidden group">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, images: formData.images?.filter((_, i) => i !== idx) })}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-bg rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              
              <div className="relative aspect-square bg-ink/5 rounded-sm flex flex-col items-center justify-center border border-dashed border-ink/20 hover:border-ink/50 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({
                          ...prev,
                          images: [...(prev.images?.filter(u => u.length > 0) || []), reader.result as string]
                        }));
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
                <Plus className="text-ink/30 group-hover:text-ink/60 transition-colors mb-2" size={24} />
                <span className="text-[10px] uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">Add Image</span>
              </div>
            </div>
            {(!formData.images || formData.images.filter(u => u.length > 0).length === 0) && (
              <p className="text-[10px] text-rose-500 mt-2">* At least one product image is required.</p>
            )}
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

function DesignModal({ design, onClose, onSave }: { design?: Design, onClose: () => void, onSave: (d: Design) => void }) {
  const [formData, setFormData] = useState<Partial<Design>>(design || {
    title: "",
    category: "Traditional",
    images: [""],
    description: "",
    price: 0
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
          <h3 className="text-3xl lg:text-4xl font-serif">{design ? "Edit Design" : "New Design"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: design?.id || Date.now().toString() } as Design); }}>
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
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted">Design Image</label>
            <div className="flex items-center space-x-6">
              {formData.images?.[0] ? (
                <div className="relative w-32 h-32 bg-ink/5 rounded-sm overflow-hidden flex-shrink-0">
                  <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, images: [] })}
                    className="absolute top-2 right-2 p-1 bg-ink text-bg rounded-full hover:scale-110 transition-transform"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 bg-ink/5 rounded-sm flex items-center justify-center border border-dashed border-ink/20 flex-shrink-0">
                  <ImageIcon className="text-ink/20" size={24} />
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  id="design-image"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, images: [reader.result as string] });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="design-image"
                  className="inline-block border border-ink/20 px-6 py-2 text-[10px] uppercase tracking-widest cursor-pointer hover:bg-ink hover:text-bg transition-colors"
                >
                  Choose Image
                </label>
                <p className="text-[10px] text-ink-muted mt-2">Upload a high-quality image of the henna design.</p>
              </div>
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
            {design ? "Save Changes" : "Upload Design"}
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
            <label 
              key={day.value} 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                handleDayToggle(day.value);
              }}
            >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Travel Fee (Tk)</label>
          <input 
            type="number" 
            value={formData.travelFee}
            onChange={(e) => setFormData({ ...formData, travelFee: Number(e.target.value) })}
            className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Pre-payment Amount (Tk)</label>
          <input 
            type="number" 
            value={formData.prepaymentAmount}
            onChange={(e) => setFormData({ ...formData, prepaymentAmount: Number(e.target.value) })}
            className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
          />
        </div>
      </div>

      <div className="space-y-6 pt-12 border-t border-ink/5">
        <h3 className="font-serif text-2xl mb-2">Payment Methods</h3>
        <p className="text-ink-muted text-sm">Manage the payment methods available for pre-booking (bKash, Nagad, etc.) and upload their QR codes.</p>
        
        <div className="space-y-4 mt-6">
          {formData.paymentMethods.map((method, idx) => (
            <div key={method.id} className="p-6 bg-white/50 border border-ink/5 rounded-sm space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Method Name</label>
                    <input 
                      type="text" 
                      value={method.name}
                      onChange={(e) => {
                        const newMethods = [...formData.paymentMethods];
                        newMethods[idx] = { ...method, name: e.target.value };
                        setFormData({ ...formData, paymentMethods: newMethods });
                      }}
                      className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Instruction</label>
                    <input 
                      type="text" 
                      value={method.instruction}
                      onChange={(e) => {
                        const newMethods = [...formData.paymentMethods];
                        newMethods[idx] = { ...method, instruction: e.target.value };
                        setFormData({ ...formData, paymentMethods: newMethods });
                      }}
                      className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setFormData({ ...formData, paymentMethods: formData.paymentMethods.filter(m => m.id !== method.id) })}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors ml-4"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-6">
                <div className="relative w-24 h-24 bg-white border border-ink/10 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {method.qrCode ? (
                    <img src={method.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-ink/10" size={32} />
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted block mb-2 font-bold">QR Code Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newMethods = [...formData.paymentMethods];
                          newMethods[idx] = { ...method, qrCode: reader.result as string };
                          setFormData({ ...formData, paymentMethods: newMethods });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[10px] file:bg-transparent file:border-ink/20 file:px-4 file:py-2 file:text-[10px] file:uppercase file:tracking-widest cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setFormData({ 
              ...formData, 
              paymentMethods: [
                ...formData.paymentMethods, 
                { id: Date.now().toString(), name: "New Method", qrCode: "", instruction: "Enter payment instruction here" }
              ] 
            })}
            className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors mt-4"
          >
            <Plus size={14} />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-12 border-t border-ink/5">
        <h3 className="font-serif text-2xl mb-2">Manual Time Blocks</h3>
        <p className="text-ink-muted text-sm">Block specific times for personal tasks or holidays. These times will be unavailable in the booking form.</p>
        
        <div className="space-y-4 mt-6">
          {formData.blockedSlots.map((slot, idx) => (
            <div key={slot.id} className="p-6 bg-white/50 border border-ink/5 rounded-sm flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Date</label>
                  <input 
                    type="date" 
                    value={slot.date}
                    onChange={(e) => {
                      const newSlots = [...formData.blockedSlots];
                      newSlots[idx] = { ...slot, date: e.target.value };
                      setFormData({ ...formData, blockedSlots: newSlots });
                    }}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-mono text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Start Time</label>
                  <input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => {
                      const newSlots = [...formData.blockedSlots];
                      newSlots[idx] = { ...slot, startTime: e.target.value };
                      setFormData({ ...formData, blockedSlots: newSlots });
                    }}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-mono text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">End Time</label>
                  <input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => {
                      const newSlots = [...formData.blockedSlots];
                      newSlots[idx] = { ...slot, endTime: e.target.value };
                      setFormData({ ...formData, blockedSlots: newSlots });
                    }}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-mono text-sm" 
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Reason (Optional)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="text" 
                    value={slot.reason || ""}
                    onChange={(e) => {
                      const newSlots = [...formData.blockedSlots];
                      newSlots[idx] = { ...slot, reason: e.target.value };
                      setFormData({ ...formData, blockedSlots: newSlots });
                    }}
                    placeholder="e.g. Personal appointment"
                    className="flex-1 bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors italic text-xs" 
                  />
                  <button 
                    onClick={() => setFormData({ ...formData, blockedSlots: formData.blockedSlots.filter(s => s.id !== slot.id) })}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setFormData({ 
              ...formData, 
              blockedSlots: [
                ...formData.blockedSlots, 
                { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], startTime: "09:00", endTime: "10:00", reason: "" }
              ] 
            })}
            className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors mt-4"
          >
            <Plus size={14} />
            <span>Add Manual Block</span>
          </button>
        </div>
      </div>

      <div className="pt-12">
        <button 
          onClick={handleSave}
          className="bg-ink text-bg px-8 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all font-semibold"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}

function ConfirmationModal({ booking, onClose, onConfirm }: { booking: Booking, onClose: () => void, onConfirm: (start: string, end: string) => void }) {
  const [startTime, setStartTime] = useState(booking.time);
  const [endTime, setEndTime] = useState(() => {
    // Default to +2 hours
    const [h, m] = booking.time.split(":").map(Number);
    const date = new Date();
    date.setHours(h + 2, m);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 text-ink">
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
        className="relative bg-bg w-full max-w-md p-8 rounded-sm shadow-2xl space-y-8"
      >
        <div className="space-y-2">
          <h3 className="text-2xl font-serif">Confirm Booking</h3>
          <p className="text-xs text-ink-muted uppercase tracking-widest">Select blocked duration</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-ink-muted font-bold">End Time</label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onConfirm(startTime, endTime)}
            className="w-full bg-ink text-bg py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-ink/90 transition-all font-semibold"
          >
            Confirm & Block Time
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-[10px] uppercase tracking-[0.3em] text-ink-muted hover:text-ink transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
