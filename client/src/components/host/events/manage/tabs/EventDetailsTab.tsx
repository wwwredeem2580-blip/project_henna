import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Calendar, Clock10, Building2, User, Save, Upload, X, Trash } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { DocumentUploader } from '@/components/ui/DocumentUploader';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useNotification } from '@/lib/context/notification';

interface EventDetailsTabProps {
  data: HostEventDetailsResponse | null;
}

export const EventDetailsTab = ({ data }: EventDetailsTabProps) => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [description, setDescription] = useState(data?.event?.description || '');
  const [coverImage, setCoverImage] = useState(data?.event?.media?.coverImage?.url || '');
  const [gallery, setGallery] = useState(data?.event?.media?.gallery || []);
  const { showNotification } = useNotification();

  // Sync state with data when data loads
  useState(() => {
    if (data?.event) {
        setDescription(data.event.description || '');
        setCoverImage(data.event.media?.coverImage?.url || '');
        setGallery(data.event.media?.gallery || []);
    }
  });

  const handleSave = () => {
    // In a real implementation, this would call an API to update the event
    // for now we just show a success message
    showNotification('success', 'Changes Saved', 'Event details have been updated.');
    setMode('preview');
  };

  const handleGalleryUpload = (url: string) => {
      setGallery(prev => [...prev, { url, caption: '' }]);
  };

  const handleRemoveGalleryImage = (index: number) => {
      setGallery(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <section className="space-y-6 animate-slide-up mb-24">
      <div className="flex items-center justify-between">
        <Switch
            label={`${mode === 'preview' ? 'Preview' : 'Edit'}`}
            sub={`${mode === 'preview' ? 'Edit' : 'Preview'}`}
            checked={mode === 'preview'}
            onChange={(checked) => setMode(checked ? 'preview' : 'edit')}
          />
         {mode === 'edit' && (
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-100"
             >
                 <Save size={18} />
                 <span className="text-sm font-medium">Save Changes</span>
             </button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Event Details */}
        <div className="md:col-span-1 space-y-6">
          <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-0 bg-slate-50 border border-slate-100 relative group overflow-hidden"
              >
                {/* Image Section */}
                <div className="aspect-[2/1]">
                  <div className="grid h-full grid-cols-[1fr_minmax(18vw,18vw)] md:grid-cols-[1fr_minmax(7vw,7vw)] lg:grid-cols-[1fr_minmax(5vw,5vw)] xl:grid-cols-[1fr_minmax(6vw,6vw)] 2xl:grid-cols-[1fr_minmax(7vw,7vw)] gap-4">

                    {/* Main Image */}
                    <div className="relative overflow-hidden rounded-tr-lg rounded-bl-lg h-full group/cover">
                       {mode === 'edit' ? (
                           <div className="absolute inset-0 w-full h-full">
                               <ImageUploader 
                                    type="event_cover"
                                    currentImage={coverImage}
                                    onUploadComplete={(url) => setCoverImage(url)}
                                    maxSizeMB={5}
                                    acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                               />
                           </div>
                       ) : (
                            <img
                                src={
                                coverImage ||
                                "https://fastly.picsum.photos/id/1084/536/354.jpg?grayscale&hmac=Ux7nzg19e1q35mlUVZjhCLxqkR30cC-CarVg-nlIf60"
                                }
                                alt={
                                data?.event?.media?.coverImage?.alt ||
                                "Event Cover Image"
                                }
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                       )}

                      {data?.event?.status === "live" && mode === 'preview' && (
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-light text-slate-900 border border-slate-100">
                            <span className="w-1.5 h-1.5 animate-pulse bg-emerald-500 rounded-full" />
                            Live
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gallery */}
                    <div className="flex flex-col gap-2 overflow-y-auto h-full pr-1">
                      {([1, 1, 1]).map(
                        (img: any, idx: number) => (
                          <div
                            key={img?.id || idx}
                            className="relative overflow-hidden rounded-tr-sm rounded-bl-sm flex-shrink-0 group/item h-20 w-full"
                          >
                            <img
                              src={
                                img?.url ||
                                `https://picsum.photos/id/${101 + idx}/200/120.jpg`
                              }
                              alt={img?.caption || "Gallery image"}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                            />
                            {mode === 'edit' && (
                                <button 
                                    onClick={() => handleRemoveGalleryImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            )}
                          </div>
                        )
                      )}
                      
                      {/* Add Gallery Image Button (Edit Mode) */}
                      {mode === 'edit' && (
                          <div className="h-20 w-full flex-shrink-0">
                              <ImageUploader 
                                   type="gallery"
                                   onUploadComplete={(url) => handleGalleryUpload(url)}
                                   maxSizeMB={5}
                                   acceptedFormats={['image/jpeg', 'image/png']}
                              />
                          </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 ml-[-12px] mb-2">
                    <div className="flex items-center gap-2 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-[300] text-slate-900 border border-slate-100">
                      <Music size={16} className="text-brand-500" strokeWidth={1}/>
                      {data?.event?.category ? `${data.event.category.charAt(0).toUpperCase() + data.event.category.slice(1)}` : 'Category'}
                    </div>
                  </div>
                  <h2 className={`text-2xl font-[300] text-neutral-800 flex justify-between items-center tracking-tight ${mode === 'edit' ? 'opacity-50' : ''}`}>
                    {data?.event?.title || 'Event Name'}
                    {mode === 'edit' && <span className="text-xs text-slate-400 font-normal px-2 py-1 border rounded-md">Locked</span>}
                  </h2>
                  <p className={`text-sm text-neutral-500 font-[300] line-clamp-2 ${mode === 'edit' ? 'opacity-50' : ''}`}>
                    {data?.event?.tagline || 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'}
                  </p>
                  
                  <div className={`flex flex-col gap-2 mt-4 font-[300] text-slate-700 ${mode === 'edit' ? 'opacity-50' : ''}`}>
                    <span className="flex items-center gap-2 text-sm ">
                      <Calendar className="text-neutral-600" size={14} strokeWidth={1}/>
                      {data?.event?.schedule?.startDate ? new Date(data.event.schedule.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date'}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Clock10 className="text-neutral-600" size={14} strokeWidth={1}/>
                      {data?.event?.schedule?.startDate && data?.event?.schedule?.endDate 
                        ? `${new Date(data.event.schedule.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(data.event.schedule.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                        : 'Time'
                      }
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 ${mode === 'edit' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <section className="p-3 bg-brand-card rounded-xl border border-brand-divider flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-brand-divider overflow-hidden flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-brand-400" strokeWidth={1}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-600 mb-1">Venue</p>
                            <div className="flex flex-col items-start leading-tight">
                            <p className="text-xs text-neutral-700 font-[400]">{data?.event?.venue?.name || 'Venue Name'}</p>
                            <p className="text-[10px] text-neutral-500 font-[300]">{data?.event?.venue?.address?.city || 'City'}, {data?.event?.venue?.address?.country || 'Country'}</p>
                            </div>
                        </div>
                        </div>
                    </section>
                    <section className="p-3 bg-brand-card rounded-xl border border-brand-divider flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-brand-divider overflow-hidden flex items-center justify-center">
                            <User className="w-5 h-5 text-brand-400" strokeWidth={1}/>
                        </div>
                        <div>
                            <p className="text-[10px] font-[500] uppercase tracking-widest text-neutral-600 mb-1">Organizer</p>
                            <div className="flex flex-col items-start leading-tight">
                            <p className="text-xs text-neutral-700 font-[400]">{data?.event?.organizer?.companyName || 'Compnay Name'}</p>
                            <p className="text-[10px] text-brand-500 font-[300]">View Profile</p>
                            </div>
                        </div>
                        </div>
                    </section>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-8">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-[300] text-slate-800">
                        The Experience
                        </p>
                        {mode === 'edit' && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">Editable</span>}
                    </div>
                    {mode === 'edit' ? (
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[150px] p-4 bg-white border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm font-[300] text-slate-700 leading-relaxed"
                            placeholder="Describe your event experience..."
                        />
                    ) : (
                        <p className="text-sm font-[300] text-neutral-500 leading-relaxed">
                        {description || 'No description provided.'}
                        </p>
                    )}
                  </div>

                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 pointer-events-none" />
                <div className="absolute top-48 left-0 w-32 h-32 bg-brand-500/5 rounded-full -ml-10 -mt-10 transition-transform group-hover:scale-110 pointer-events-none" />
              </motion.div>
        </div>

        {/* Right Column: Verification Documents */}
        <div className="max-w-[400px] mx-auto space-y-6">
            <div className="bg-white p-6 rounded-[2rem] flex flex-col h-full">
               <div className="mb-6">
                    <h3 className="text-lg font-[300] text-slate-800 mb-2">Additional Verification Documents</h3>
                    <p className="text-xs text-slate-500 font-[300]">Upload additional necessary documents for event verification. NOTE: These are for internal review only.</p>
               </div>
               
               <div className="flex-1">
                   <DocumentUploader 
                        onUploadComplete={(files) => {
                            showNotification('success', 'Documents Uploaded', `${files.length} documents uploaded successfully.`);
                        }}
                        onUploadError={(err) => {
                            showNotification('error', 'Upload Failed', err);
                        }}
                        maxFiles={5}
                        maxSizeMB={5}
                   />
               </div>
            </div>
        </div>
      </div>
    </section>
  );
};
