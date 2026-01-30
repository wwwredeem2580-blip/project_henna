import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Calendar, Clock10, Building2, User, Save, Upload, X, Trash, Loader2 } from 'lucide-react';
import Switch from '@/components/ui/Switch';
import { HostEventDetailsResponse } from '@/lib/api/host-analytics';
import { DocumentUploader } from '@/components/ui/DocumentUploader';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { useNotification } from '@/lib/context/notification';
import { eventsService } from '@/lib/api/events';

interface EventDetailsTabProps {
  data: HostEventDetailsResponse | null;
  onUpdate: (newData: HostEventDetailsResponse) => void;
}

export const EventDetailsTab = ({ data, onUpdate }: EventDetailsTabProps) => {
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [description, setDescription] = useState(data?.event?.description || '');
  const [tagline, setTagline] = useState(data?.event?.tagline || '');
  const [coverImage, setCoverImage] = useState(data?.event?.media?.coverImage?.url || '');
  const [gallery, setGallery] = useState(data?.event?.media?.gallery || []);
  const [scheduleStart, setScheduleStart] = useState(data?.event?.schedule?.startDate || '');
  const [scheduleEnd, setScheduleEnd] = useState(data?.event?.schedule?.endDate || '');
  const { showNotification } = useNotification();
  
  // Save functionality state
  const [saving, setSaving] = useState(false);

  // Sync state with data when data loads
  useEffect(() => {
    if (data?.event) {
        setDescription(data.event.description || '');
        setTagline(data.event.tagline || '');
        setCoverImage(data.event.media?.coverImage?.url || '');
        setGallery(data.event.media?.gallery || []);
        setScheduleStart(data.event.schedule?.startDate || '');
        setScheduleEnd(data.event.schedule?.endDate || '');
    }
  }, [data?.event?._id]);

  // Check if schedule can be modified
  const canModifySchedule = () => {
    const status = data?.event?.status;
    const scheduleModified = data?.event?.schedule?.scheduleModified;
    
    // Only approved events can modify schedule, and only once
    return status === 'approved' && !scheduleModified;
  };

  // Validate schedule change is within ±2 hours
  const validateScheduleChange = (newStart: string, newEnd: string): boolean => {
    if (!data?.event?.schedule) return false;
    
    const originalStart = new Date(data.event.schedule.startDate);
    const originalEnd = new Date(data.event.schedule.endDate);
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newEnd);
    
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    
    const startDiff = Math.abs(newStartDate.getTime() - originalStart.getTime());
    const endDiff = Math.abs(newEndDate.getTime() - originalEnd.getTime());
    
    return startDiff <= TWO_HOURS_MS && endDiff <= TWO_HOURS_MS;
  };

  const handleSave = async () => {
    if (!data?.event) return;
    
    try {
      setSaving(true);
      
      // Validate schedule changes for approved events
      if (canModifySchedule() && (scheduleStart !== data.event.schedule?.startDate || scheduleEnd !== data.event.schedule?.endDate)) {
        if (!validateScheduleChange(scheduleStart, scheduleEnd)) {
          showNotification(
            'error',
            'Invalid Schedule Change',
            'Schedule can only be modified by ±2 hours from the original time.'
          );
          setSaving(false);
          return;
        }
        
        // Show warning for schedule modification
        const confirmed = window.confirm(
          `⚠️ Schedule Modification Warning\n\n` +
          `You are about to modify the event schedule. This can only be done ONCE.\n` +
          `All attendees will be notified of this change.\n\n` +
          `Original: ${new Date(data.event.schedule!.startDate).toLocaleString()}\n` +
          `New: ${new Date(scheduleStart).toLocaleString()}\n\n` +
          `Continue?`
        );
        
        if (!confirmed) {
          setSaving(false);
          return;
        }
      }
      
      // Prepare update data
      const updateData: any = {
        description,
        tagline,
        media: {
          coverImage: {
            url: coverImage,
            alt: data.event.media?.coverImage?.alt || data.event.title,
            thumbnailUrl: data.event.media?.coverImage?.url
          },
          gallery
        }
      };

      // Add schedule if modified
      if (canModifySchedule() && (scheduleStart !== data.event.schedule?.startDate || scheduleEnd !== data.event.schedule?.endDate)) {
        updateData.schedule = {
          ...data.event.schedule,
          startDate: scheduleStart,
          endDate: scheduleEnd,
          scheduleModified: true
        };
      }
      
      // Call backend API
      const result = await eventsService.updateEventByStatus(
        data.event._id,
        data.event.status,
        updateData
      );

      // Handle warnings
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          showNotification('info', 'Notice', warning);
        });
      }

      showNotification('success', 'Changes Saved', result.message || 'Event details have been updated.');
      
      // Update local state with new data
      const updatedData: HostEventDetailsResponse = {
        ...data,
        event: {
          ...data.event,
          description,
          tagline,
          schedule: updateData.schedule || data.event.schedule,
          media: updateData.media
        }
      };
      
      onUpdate(updatedData);
      setMode('preview');
      
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save changes';
      showNotification('error', 'Save Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpload = (url: string) => {
      setGallery(prev => [...prev, { url, caption: '', thumbnailUrl: url, order: prev.length + 1 }]);
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
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 {saving ? (
                   <>
                     <Loader2 size={18} className="animate-spin" />
                     <span className="text-sm font-medium">Saving...</span>
                   </>
                 ) : (
                   <>
                     <Save size={18} />
                     <span className="text-sm font-medium">Save Changes</span>
                   </>
                 )}
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
                      {gallery.map(
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
                  {mode === 'edit' ? (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Event tagline..."
                        className="w-full text-sm text-neutral-600 font-[300] px-3 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 font-[300] line-clamp-2">
                      {data?.event?.tagline || 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'}
                    </p>
                  )}
                  
                  <div className={`flex flex-col gap-2 mt-4 font-[300] text-slate-700 ${mode === 'edit' && !canModifySchedule() ? 'opacity-50' : ''}`}>
                    {mode === 'edit' && canModifySchedule() ? (
                      <>
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 font-medium">⚠️ Schedule can be modified by ±2 hours only once</p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-neutral-600 mb-1">
                              <Calendar size={12} /> Start Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={scheduleStart ? new Date(scheduleStart).toISOString().slice(0, 16) : ''}
                              onChange={(e) => setScheduleStart(new Date(e.target.value).toISOString())}
                              className="w-full text-sm px-3 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-neutral-600 mb-1">
                              <Clock10 size={12} /> End Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={scheduleEnd ? new Date(scheduleEnd).toISOString().slice(0, 16) : ''}
                              onChange={(e) => setScheduleEnd(new Date(e.target.value).toISOString())}
                              className="w-full text-sm px-3 py-2 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-2 text-sm justify-between">
                          <span className="flex items-center gap-2">
                            <Calendar className="text-neutral-600" size={14} strokeWidth={1}/>
                            {data?.event?.schedule?.startDate ? new Date(data.event.schedule.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date'}
                          </span>
                          {mode === 'edit' && !canModifySchedule() && (
                            <span className="text-xs text-slate-400 font-normal px-2 py-1 border rounded-md">
                              {data?.event?.schedule?.scheduleModified ? 'Already Modified' : 'Locked'}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <Clock10 className="text-neutral-600" size={14} strokeWidth={1}/>
                          {data?.event?.schedule?.startDate && data?.event?.schedule?.endDate 
                            ? `${new Date(data.event.schedule.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${new Date(data.event.schedule.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                            : 'Time'
                          }
                        </span>
                      </>
                    )}
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


        {/* Right Column: Verification Documents (Only for Pending Approval) */}
        {data?.event?.status === 'pending_approval' && (
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
        )}
      </div>
    </section>
  );
};
