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
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Design, Product, Booking, Order, BookingStatus, OrderStatus, AvailabilitySettings } from "../types";

import { useStore } from "../context/StoreContext";

type AdminTab = "bookings" | "orders" | "products" | "designs" | "categories" | "settings";

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
    { id: "categories", label: "Categories", icon: Package },
    { id: "settings", label: "Settings", icon: Edit2 },
  ];

  const productCategoriesList = availabilitySettings.productCategories || [];
  const designCategoriesList = availabilitySettings.designCategories || [];

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-12 lg:py-24 min-h-screen bg-bg w-full overflow-x-hidden">
      <div className="mb-16 flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Management</h2>
          <p className="text-ink/80 uppercase tracking-widest text-xs">Admin Control Center</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-8 lg:space-x-12 mb-12 border-b border-ink/5 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 pb-6 text-xs uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? "text-ink font-bold" : "text-ink/80 hover:text-ink"
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
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: -8, pointerEvents: "none" }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "bookings" && (
              <BookingManagement 
                bookings={bookings} 
                availabilitySettings={availabilitySettings}
                onUpdateStatus={(id, status) => {
                  if (status === "confirmed") {
                    setConfirmingBooking(bookings.find(b => b.id === id) || null);
                  } else {
                    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
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
            {activeTab === "categories" && (
              <CategoryManagement 
                productCategories={productCategoriesList}
                designCategories={designCategoriesList}
                onUpdate={(type, cats) => {
                  setAvailabilitySettings({
                    ...availabilitySettings,
                    [type === 'product' ? 'productCategories' : 'designCategories']: cats
                  });
                }}
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
          existingCategories={productCategoriesList.map(c => c.name)}
        />
      )}
      {isEditingProduct && (
        <ProductModal 
          product={isEditingProduct}
          onClose={() => setIsEditingProduct(null)} 
          onSave={(p) => { setProducts(products.map(old => old.id === p.id ? p : old)); setIsEditingProduct(null); }}
          existingCategories={productCategoriesList.map(c => c.name)}
        />
      )}
      {isAddingDesign && (
        <DesignModal 
          onClose={() => setIsAddingDesign(false)} 
          onSave={(d) => { setDesigns([...designs, d]); setIsAddingDesign(false); }}
          designCategories={designCategoriesList.map(c => c.name)}
        />
      )}
      {isEditingDesign && (
        <DesignModal 
          design={isEditingDesign}
          onClose={() => setIsEditingDesign(null)} 
          onSave={(d) => { setDesigns(designs.map(old => old.id === d.id ? d : old)); setIsEditingDesign(null); }}
          designCategories={designCategoriesList.map(c => c.name)}
        />
      )}
      {confirmingBooking && (
        <ConfirmationModal
          booking={confirmingBooking}
          onClose={() => setConfirmingBooking(null)}
          onConfirm={(startTime, endTime) => {
            if (confirmingBooking) {
              setBookings(prev => prev.map(b => b.id === confirmingBooking.id ? { ...b, status: "confirmed", time: startTime, endTime } : b));
            }
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
      <div className="hidden lg:grid grid-cols-6 px-6 py-4 text-xs uppercase tracking-widest text-ink/80 font-bold border-b border-ink/5">
        <div className="col-span-2">Client / Event</div>
        <div>Date</div>
        <div>Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {bookings.map((booking) => (
        <div key={booking.id} className="flex flex-col lg:grid lg:grid-cols-6 px-4 sm:px-6 py-6 lg:py-8 items-start lg:items-center bg-white/50 border border-ink/5 rounded-sm hover:border-ink/20 transition-all space-y-4 lg:space-y-0">
          <div className="lg:col-span-2 space-y-1">
            <p className="font-medium text-lg">{booking.name}</p>
            <p className="text-xs uppercase tracking-widest text-ink/80 font-bold">
              {booking.eventType} • {booking.locationType === "user_location" ? "Artist Goes to Location" : "Come to Service Location"}
            </p>
            <p className="text-sm text-ink/70">{booking.location}</p>
            {booking.transactionId && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] uppercase tracking-widest text-ink/40">
                  {availabilitySettings.paymentMethods.find(m => m.id === booking.paymentMethodId)?.name || "Payment"}:
                </span>
                <p className="text-[10px] font-mono bg-ink/5 px-2 py-0.5 inline-block rounded-sm">{booking.transactionId}</p>
              </div>
            )}
          </div>
          <div className="text-sm">
            <span className="lg:hidden text-xs uppercase tracking-widest text-ink/80 font-bold block mb-1">Date & Time</span>
            <p>{booking.date}</p>
            <p className="text-xs text-ink uppercase tracking-widest mt-0.5 font-bold">
              {booking.time} {booking.endTime ? `— ${booking.endTime}` : ""}
            </p>
          </div>
          <div>
            <span className="lg:hidden text-xs uppercase tracking-widest text-ink/80 font-bold block mb-1">Status</span>
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
                className="w-full lg:w-auto flex items-center justify-center space-x-2 p-3 lg:p-0 text-xs uppercase tracking-widest text-ink/80 font-bold hover:text-ink border border-ink/10 lg:border-none rounded-sm lg:rounded-none transition-colors"
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
      <div className="hidden lg:grid grid-cols-6 px-6 py-4 text-xs uppercase tracking-widest text-ink/80 font-bold border-b border-ink/5">
        <div className="col-span-2">Customer / Order ID</div>
        <div>Total</div>
        <div>Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {orders.map((order) => (
        <div key={order.id} className="flex flex-col lg:grid lg:grid-cols-6 px-6 py-8 items-start lg:items-center bg-white/50 border border-ink/5 rounded-sm space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 space-y-1">
            <p className="font-medium text-lg">{order.customerName}</p>
            <p className="text-[10px] text-ink-muted uppercase tracking-widest">#{order.id}</p>
          </div>
          <div className="text-sm font-medium">
            <span className="lg:hidden text-xs uppercase tracking-widest text-ink/80 font-bold block mb-1">Total</span>
            Tk {order.total.toLocaleString()}
          </div>
          <div>
            <span className="lg:hidden text-xs uppercase tracking-widest text-ink/80 font-bold block mb-1">Status</span>
            <span className="text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border border-ink/10">
              {order.status}
            </span>
          </div>
          <div className="lg:col-span-2 flex justify-start lg:justify-end space-x-4 w-full">
            <div className="w-full lg:w-auto">
              <span className="lg:hidden text-xs uppercase tracking-widest text-ink/80 font-bold block mb-1">Update Status</span>
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
                <h3 className="font-semibold text-xl">{product.name}</h3>
                <span className="text-sm font-medium">Tk {product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-ink/80 font-bold">
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
              <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(design)} className="p-2 bg-bg text-ink rounded-full hover:bg-ink hover:text-bg transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(design.id)} className="p-2 bg-bg text-rose-600 rounded-full hover:bg-rose-600 hover:text-bg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-xl">{design.title}</h3>
              <p className="text-xs uppercase tracking-widest font-bold">Tk {design.price}</p>
            </div>
            <p className="text-xs uppercase tracking-widest text-ink/80 font-bold">{design.category}</p>
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
    variantImages: {},
    secondaryName: ""
  });

  const handleImageChange = (index: number, val: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = val;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ""] });
  };

  const handleSizeChange = (index: number, field: 'size' | 'price', val: any) => {
    const newSizes = [...(formData.sizes || [])];
    const newSizeImages = { ...(formData.variantImages || {}) };
    const oldSize = newSizes[index]?.size;
    
    if (field === 'size') {
      const newSizeName = val as string;
      if (oldSize && newSizeImages[oldSize]) {
        newSizeImages[newSizeName] = newSizeImages[oldSize];
        delete newSizeImages[oldSize];
      }
      newSizes[index] = { ...newSizes[index], size: newSizeName };
    } else {
      newSizes[index] = { ...newSizes[index], price: Number(val) };
    }
    
    setFormData({ ...formData, sizes: newSizes, variantImages: newSizeImages });
  };

  const addSizeField = () => {
    setFormData({ ...formData, sizes: [...(formData.sizes || []), { size: "", price: 0 }] });
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
          <h3 className="text-3xl lg:text-4xl font-semibold">{product ? "Edit Product" : "New Product"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: product?.id || Date.now().toString() } as Product); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Product Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Secondary Title (e.g. Bengali)</label>
              <input 
                type="text" 
                value={formData.secondaryName}
                onChange={(e) => setFormData({ ...formData, secondaryName: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Category</label>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Brand</label>
              <input 
                required
                type="text" 
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Previous Price (Tk)</label>
              <input 
                type="number" 
                value={formData.originalPrice || ""}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Current Price (Tk)</label>
              <input 
                required
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Stock Quantity</label>
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
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Available Sizes & Prices (Optional)</label>
            <div className="space-y-4">
              {formData.sizes?.map((sizeObj, idx) => {
                // Handle cases where sizes might be string (migration) or object
                const s = typeof sizeObj === 'string' ? sizeObj : sizeObj.size;
                const p = typeof sizeObj === 'string' ? 0 : sizeObj.price;
                
                return (
                  <div key={idx} className="flex space-x-4 items-center">
                    <input 
                      type="text" 
                      value={s}
                      onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                      className="flex-1 bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                      placeholder="e.g. 25g"
                    />
                    <div className="flex items-center bg-ink/[0.03] border-b border-ink/10 px-2 min-w-[120px]">
                      <span className="text-xs text-ink/50 mr-1">Tk</span>
                      <input 
                        type="number" 
                        value={p}
                        onChange={(e) => handleSizeChange(idx, 'price', e.target.value)}
                        className="w-full bg-transparent py-2 focus:border-ink outline-none transition-colors font-serif text-sm" 
                        placeholder="Price"
                      />
                    </div>
                    <div className="relative w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-dashed border-ink/20 hover:border-ink/50 transition-colors flex items-center justify-center group">
                      {formData.variantImages?.[s] ? (
                        <>
                          <img src={formData.variantImages[s]} alt="Variant" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newSizeImages = { ...(formData.variantImages || {}) };
                              delete newSizeImages[s];
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
                                  const newSizeImages = { ...(formData.variantImages || {}), [s]: url };
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
                        delete newSizeImages[s];
                        setFormData({ ...formData, sizes: newSizes, variantImages: newSizeImages });
                      }}
                      className="text-rose-600 p-2 hover:bg-rose-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
              <button 
                type="button"
                onClick={addSizeField}
                className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-ink hover:underline font-bold"
              >
                <Plus size={14} />
                <span>Add Size Option</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Product Images</label>
            
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
                <span className="text-xs uppercase tracking-widest text-ink/80 font-bold group-hover:text-ink transition-colors">Add Image</span>
              </div>
            </div>
            {(!formData.images || formData.images.filter(u => u.length > 0).length === 0) && (
              <p className="text-[10px] text-rose-500 mt-2">* At least one product image is required.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Description</label>
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

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const designCategories = ["Traditional", "Contemporary", "Arabic", "Minimal"];

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
          <h3 className="text-3xl lg:text-4xl font-semibold">{design ? "Edit Design" : "New Design"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, id: design?.id || Date.now().toString() } as Design); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Design Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Category</label>
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
                  <option value="">Select Category</option>
                  {designCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Price (Tk)</label>
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
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Design Image</label>
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
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Description</label>
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
  const [activeSubTab, setActiveSubTab] = useState<"schedule" | "payments" | "blocks" | "tour">("schedule");

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
    <div className="max-w-4xl space-y-8 lg:space-y-12 w-full">
      <div className="flex overflow-x-auto space-x-6 lg:space-x-12 border-b border-ink/5 scrollbar-hide pb-1">
        {(["schedule", "payments", "blocks", "tour", "policy"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-shrink-0 whitespace-nowrap pb-4 text-[10px] uppercase tracking-[0.2em] transition-all relative ${
              activeSubTab === tab ? "text-ink font-bold" : "text-ink/40 hover:text-ink/60"
            }`}
          >
            {tab === "schedule" ? "Schedule" : 
             tab === "payments" ? "Payment Methods" : 
             tab === "blocks" ? "Manual Blocks" : 
             tab === "tour" ? "Tour & Stories" : "Booking Policy"}
            {activeSubTab === tab && (
              <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white/50 border border-ink/5 p-8 lg:p-12 rounded-sm min-h-[400px]">
        {activeSubTab === "schedule" && (
          <div className="space-y-12">
            <div>
              <h3 className="font-semibold text-2xl mb-2">Availability Schedule</h3>
              <p className="text-ink-muted text-sm">Configure which days and times you are available for bookings.</p>
            </div>

            <div className="space-y-6">
              <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Enabled Days</label>
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
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Start Time</label>
                <input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">End Time</label>
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
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Travel Fee (Tk)</label>
                <input 
                  type="number" 
                  value={formData.travelFee}
                  onChange={(e) => setFormData({ ...formData, travelFee: Number(e.target.value) })}
                  className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Pre-payment Amount (Tk)</label>
                <input 
                  type="number" 
                  value={formData.prepaymentAmount}
                  onChange={(e) => setFormData({ ...formData, prepaymentAmount: Number(e.target.value) })}
                  className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "payments" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-2xl mb-2">Payment Methods</h3>
              <p className="text-ink-muted text-sm">Manage methods and QR codes for pre-payment.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {formData.paymentMethods.map((method, idx) => (
                <div key={method.id} className="p-6 bg-white border border-ink/5 rounded-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Method Name</label>
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
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Instruction</label>
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

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative w-24 h-24 bg-white border border-ink/10 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {method.qrCode ? (
                        <img src={method.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-ink/10" size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs uppercase tracking-widest text-ink/80 font-bold block mb-2 font-bold">QR Code Image</label>
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
                className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-bold"
              >
                <Plus size={14} />
                <span>Add Payment Method</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === "blocks" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-2xl mb-2">Manual Time Blocks</h3>
              <p className="text-ink-muted text-sm">Block specific times for personal tasks or holidays.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {formData.blockedSlots.map((slot, idx) => (
                <div key={slot.id} className="p-6 bg-white border border-ink/5 rounded-sm flex flex-col md:flex-row md:items-end gap-6">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Date</label>
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
                      <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Start Time</label>
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
                      <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">End Time</label>
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
                    <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Reason (Optional)</label>
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
                className="flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-bold"
              >
                <Plus size={14} />
                <span>Add Manual Block</span>
              </button>
            </div>
          </div>
        )}
        {activeSubTab === "tour" && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end space-y-4 lg:space-y-0">
              <div>
                <h3 className="font-semibold text-2xl mb-2">Tour & Stories Management</h3>
                <p className="text-ink-muted text-sm">Manage the imagery, descriptions, and sequence of your Take a Tour gallery.</p>
              </div>
              <button 
                onClick={() => setFormData({ 
                  ...formData, 
                  tourItems: [
                    ...formData.tourItems, 
                    { id: Date.now().toString(), title: "New Gallery Item", subtitle: "Genre/Subtitle", category: "Category", description: "", image: "", order: formData.tourItems.length + 1 }
                  ] 
                })}
                className="flex items-center space-x-2 bg-ink text-bg px-6 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-ink/90 transition-all font-bold"
              >
                <Plus size={14} />
                <span>Add New Item</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {[...formData.tourItems].sort((a, b) => a.order - b.order).map((item, idx) => (
                <div key={item.id} className="p-4 sm:p-8 pt-16 sm:pt-16 lg:pt-8 bg-white border border-ink/5 rounded-sm space-y-8 relative group">
                  <div className="absolute top-4 right-4 flex space-x-1 sm:space-x-2">
                    <button 
                      disabled={idx === 0}
                      onClick={() => {
                        const newItems = [...formData.tourItems].sort((a, b) => a.order - b.order);
                        const tempOrder = newItems[idx].order;
                        newItems[idx].order = newItems[idx-1].order;
                        newItems[idx-1].order = tempOrder;
                        setFormData({ ...formData, tourItems: newItems });
                      }}
                      className="p-2 text-ink/40 hover:text-ink disabled:opacity-20 transition-colors"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      disabled={idx === formData.tourItems.length - 1}
                      onClick={() => {
                        const newItems = [...formData.tourItems].sort((a, b) => a.order - b.order);
                        const tempOrder = newItems[idx].order;
                        newItems[idx].order = newItems[idx+1].order;
                        newItems[idx+1].order = tempOrder;
                        setFormData({ ...formData, tourItems: newItems });
                      }}
                      className="p-2 text-ink/40 hover:text-ink disabled:opacity-20 transition-colors"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, tourItems: formData.tourItems.filter(i => i.id !== item.id) })}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-colors ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    <div className="lg:w-1/3 flex flex-col space-y-4">
                      <div className="relative aspect-[3/4] bg-bg border border-ink/10 flex items-center justify-center overflow-hidden group/image">
                        {item.image ? (
                          <img src={item.image} alt="Tour Item" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-ink/10" size={48} />
                        )}
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="bg-bg text-ink px-4 py-2 text-[10px] uppercase tracking-widest cursor-pointer hover:bg-ink hover:text-bg transition-colors">
                              Change Media
                              <input 
                                type="file" 
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newItems = [...formData.tourItems];
                                      const itemIdx = newItems.findIndex(i => i.id === item.id);
                                      newItems[itemIdx] = { ...item, image: reader.result as string };
                                      setFormData({ ...formData, tourItems: newItems });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                           </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Video URL (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. legacy_video.mp4"
                          value={item.videoUrl || ""}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, videoUrl: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors text-sm text-ink/80 font-serif italic" 
                        />
                      </div>
                    </div>

                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 content-start">
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Item Title</label>
                        <input 
                          type="text" 
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, title: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif text-xl" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Genre / Subtitle</label>
                        <input 
                          type="text" 
                          value={item.subtitle}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, subtitle: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Category (Tab)</label>
                        <input 
                          type="text" 
                          value={item.category}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, category: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif text-rose-800" 
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Full Description</label>
                        <textarea 
                          rows={3}
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, description: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border border-ink/10 p-4 focus:border-ink outline-none transition-colors font-serif leading-relaxed text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">CTA Link (URL)</label>
                        <input 
                          type="text" 
                          placeholder="/booking or https://..."
                          value={item.link || ""}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, link: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors text-sm text-ink/80 font-serif italic" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">CTA Button Text</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Book Now"
                          value={item.linkText || ""}
                          onChange={(e) => {
                            const newItems = [...formData.tourItems];
                            const itemIdx = newItems.findIndex(i => i.id === item.id);
                            newItems[itemIdx] = { ...item, linkText: e.target.value };
                            setFormData({ ...formData, tourItems: newItems });
                          }}
                          className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors text-sm text-ink/80 font-serif italic" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeSubTab === "policy" && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-2xl mb-2">Booking Policy</h3>
              <p className="text-ink/80 text-sm">Update the terms and conditions shown on the pre-booking page.</p>
            </div>
            
            <div className="space-y-4">
              {(formData.bookingPolicy || []).map((policy, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-white p-4 border border-ink/5 rounded-sm group">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={policy}
                      onChange={(e) => {
                        const newPolicy = [...(formData.bookingPolicy || [])];
                        newPolicy[idx] = e.target.value;
                        setFormData({ ...formData, bookingPolicy: newPolicy });
                      }}
                      className="w-full bg-transparent py-2 focus:border-ink outline-none transition-colors font-serif text-sm" 
                    />
                  </div>
                  <button 
                    onClick={() => setFormData({ 
                      ...formData, 
                      bookingPolicy: (formData.bookingPolicy || []).filter((_, i) => i !== idx) 
                    })}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => setFormData({ 
                  ...formData, 
                  bookingPolicy: [...(formData.bookingPolicy || []), "New policy point"] 
                })}
                className="flex items-center space-x-2 bg-ink/5 text-ink px-6 py-4 text-xs uppercase tracking-widest hover:bg-ink hover:text-bg transition-all font-bold w-full justify-center border border-dashed border-ink/10"
              >
                <Plus size={14} />
                <span>Add Policy Point</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-ink text-bg px-12 py-4 text-xs uppercase tracking-[0.3em] font-bold"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}

function CategoryManagement({ 
  productCategories, 
  designCategories, 
  onUpdate 
}: { 
  productCategories: CategoryMetadata[], 
  designCategories: CategoryMetadata[], 
  onUpdate: (type: 'product' | 'design', cats: CategoryMetadata[]) => void 
}) {
  const [editingCategory, setEditingCategory] = useState<{ type: 'product' | 'design', category?: CategoryMetadata } | null>(null);

  const handleDelete = (type: 'product' | 'design', id: string) => {
    const cats = type === 'product' ? productCategories : designCategories;
    onUpdate(type, cats.filter(c => c.id !== id));
  };

  const handleSave = (type: 'product' | 'design', cat: CategoryMetadata) => {
    const cats = type === 'product' ? productCategories : designCategories;
    const exists = cats.find(c => c.id === cat.id);
    if (exists) {
      onUpdate(type, cats.map(c => c.id === cat.id ? cat : c));
    } else {
      onUpdate(type, [...cats, cat]);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-16">
      {/* Product Categories */}
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Shop Categories</h3>
            <p className="text-xs uppercase tracking-widest text-ink/80 font-bold">Manage categories for your products</p>
          </div>
          <button 
            onClick={() => setEditingCategory({ type: 'product' })}
            className="flex items-center space-x-3 bg-ink text-bg px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold"
          >
            <Plus size={14} />
            <span>New Product Category</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {productCategories.map((cat) => (
            <div key={cat.id} className="group relative aspect-square bg-white shadow-sm border border-ink/5 rounded-xl overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-ink/20 opacity-40 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => setEditingCategory({ type: 'product', category: cat })}
                  className="bg-bg text-ink p-2 rounded-full hover:bg-ink hover:text-bg transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleDelete('product', cat.id)}
                  className="bg-bg text-rose-600 p-2 rounded-full hover:bg-rose-600 hover:text-bg transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-bg/90 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold text-center line-clamp-1">{cat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-ink/5" />

      {/* Design Categories */}
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Design Categories</h3>
            <p className="text-xs uppercase tracking-widest text-ink/80 font-bold">Manage categories for your art portfolio</p>
          </div>
          <button 
            onClick={() => setEditingCategory({ type: 'design' })}
            className="flex items-center space-x-3 bg-ink text-bg px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold"
          >
            <Plus size={14} />
            <span>New Design Category</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {designCategories.map((cat) => (
            <div key={cat.id} className="group relative aspect-square bg-white shadow-sm border border-ink/5 rounded-xl overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-ink/20 opacity-40 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                <button 
                  onClick={() => setEditingCategory({ type: 'design', category: cat })}
                  className="bg-bg text-ink p-2 rounded-full hover:bg-ink hover:text-bg transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleDelete('design', cat.id)}
                  className="bg-bg text-rose-600 p-2 rounded-full hover:bg-rose-600 hover:text-bg transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-bg/90 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wider font-bold text-center line-clamp-1">{cat.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingCategory && (
        <CategoryModal 
          type={editingCategory.type}
          category={editingCategory.category}
          onClose={() => setEditingCategory(null)}
          onSave={(cat) => handleSave(editingCategory.type, cat)}
        />
      )}
    </div>
  );
}

function CategoryModal({ 
  type, 
  category, 
  onClose, 
  onSave 
}: { 
  type: 'product' | 'design', 
  category?: CategoryMetadata, 
  onClose: () => void, 
  onSave: (cat: CategoryMetadata) => void 
}) {
  const [formData, setFormData] = useState<CategoryMetadata>(category || {
    id: Date.now().toString(),
    name: "",
    image: ""
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
        className="relative bg-bg w-full max-w-lg p-8 rounded-sm shadow-2xl space-y-8"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{category ? "Edit Category" : "New Category"}</h3>
            <p className="text-xs uppercase tracking-widest text-ink/80 font-bold">For {type === 'product' ? 'Shop' : 'Designs'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Category Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
              placeholder="e.g. Traditional Arabic"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Category Image</label>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-ink/5 rounded-xl overflow-hidden border border-ink/5 flex-shrink-0">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/20">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  required
                  type="text" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full text-[10px] bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors" 
                  placeholder="Paste image URL or use upload →"
                />
                <div className="relative inline-block">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="bg-ink/5 px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-semibold flex items-center space-x-2">
                    <ImageIcon size={14} />
                    <span>Upload Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-ink text-bg py-4 text-xs uppercase tracking-[0.3em] font-bold"
          >
            Save Category
          </button>
        </form>
      </motion.div>
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 text-ink">
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
          <h3 className="text-2xl font-semibold">Confirm Booking</h3>
          <p className="text-sm text-ink/70 uppercase tracking-widest">Select blocked duration</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-transparent border-b border-ink/10 py-2 focus:border-ink outline-none transition-colors font-serif" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-ink/80 font-bold">End Time</label>
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
            className="w-full bg-ink text-bg py-4 text-xs uppercase tracking-[0.3em] font-bold"
          >
            Confirm & Block Time
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-xs uppercase tracking-[0.3em] text-ink/80 hover:text-ink transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
