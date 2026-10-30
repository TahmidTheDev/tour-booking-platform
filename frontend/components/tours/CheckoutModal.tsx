'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingService } from '@/services/booking.service';
import { Tour } from '@/types';
import { useRouter } from 'next/navigation';

export default function CheckoutModal({
  tour,
  onClose
}: {
  tour: Tour;
  onClose: () => void;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/26');
  const [cvc, setCvc] = useState('123');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsProcessing(true);
    setError('');

    try {
      // Simulate network delay for payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      await bookingService.createBooking({
        tour: tour._id,
        user: user._id,
        price: tour.price,
        paid: true
      });
      
      router.push('/profile/bookings');
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Order Summary Sidebar */}
        <div className="bg-gray-50 p-8 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-6">Order Summary</h3>
          <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
            <img 
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}/img/tours/${tour.imageCover}`} 
              alt={tour.name}
              className="w-full h-32 object-cover"
            />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">{tour.name}</h4>
          <p className="text-sm text-gray-500 mb-6">{tour.duration} Days • {tour.difficulty}</p>
          
          <div className="mt-auto space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Price per person</span>
              <span>${tour.price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes & Fees</span>
              <span>$0.00</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${tour.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-8 w-full md:w-2/3 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
              <input 
                type="text" 
                required 
                value={cardName} 
                onChange={e => setCardName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <input 
                type="text" 
                required 
                value={cardNumber} 
                onChange={e => setCardNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-widest"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input 
                  type="text" 
                  required 
                  value={expiry} 
                  onChange={e => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                <input 
                  type="text" 
                  required 
                  value={cvc} 
                  onChange={e => setCvc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  `Complete Payment & Book - $${tour.price}`
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              This is a secure, simulated checkout. No real charges will be made.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
