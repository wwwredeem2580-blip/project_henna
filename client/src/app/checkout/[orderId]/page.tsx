'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckoutBKash } from '@/components/events/CheckoutBKash';
import { orderService } from '@/lib/api/order';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await orderService.getOrder(orderId);
        
        // Check if order is already confirmed
        if (orderData.status === 'confirmed') {
          router.push(`/events/${orderData.eventId._id}?payment=success`);
          return;
        }

        // Check if order has expired
        if (orderData.expiresAt && new Date(orderData.expiresAt) < new Date()) {
          setError('This order has expired. Please create a new order.');
          setLoading(false);
          return;
        }

        // Check if order is cancelled
        if (orderData.status === 'cancelled') {
          setError('This order has been cancelled.');
          setLoading(false);
          return;
        }

        setOrder(orderData);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // Handle payment success (called from CheckoutBKash component)
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      setProcessing(true);
      
      // Call the callback API to process payment
      const result = await orderService.processPaymentCallback(orderId, paymentId);

      if (result.success) {
        // Redirect to event page with success message
        router.push(`/events/${order.eventId._id}?payment=success&orderId=${orderId}`);
      } else {
        setError(result.message || 'Payment processing failed');
        setProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      setError(err.message || 'Failed to process payment');
      setProcessing(false);
    }
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    router.push(`/events/${order?.eventId?._id || ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="text-slate-600 font-[300]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-tr-lg rounded-bl-lg p-8 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-[400] text-slate-900">Checkout Error</h2>
            <p className="text-sm text-slate-600 font-[300]">{error}</p>
          </div>
          <button
            onClick={() => router.push('/events')}
            className="w-full bg-brand-500 text-white py-3 rounded-tr-lg rounded-bl-lg font-[400] hover:bg-brand-600 transition-all"
          >
            Browse Events
          </button>
        </motion.div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto" />
          <p className="text-slate-600 font-[300]">Processing payment...</p>
          <p className="text-xs text-slate-400">Please do not close this window</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CheckoutBKash
        amount={order.pricing.subtotal}
        eventName={order.eventId.title}
        tierName={`${order.tickets.reduce((sum: number, t: any) => sum + t.quantity, 0)} Ticket(s)`}
        onClose={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        orderId={orderId}
      />
    </div>
  );
}
