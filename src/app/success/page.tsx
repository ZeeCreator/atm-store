'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <>
      <Navbar />
      <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-12 md:py-20">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
            <FontAwesomeIcon icon="check-circle" className="text-4xl md:text-5xl text-green-500" />
          </div>

          <h1 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-3 md:mb-4">
            Order Submitted!
          </h1>

          <p className="text-white/60 text-base md:text-lg mb-2 px-4">
            Thank you for your order
          </p>

          {orderNumber && (
            <p className="text-primary-container font-headline font-bold mb-6 md:mb-8 text-sm md:text-base">
              Order Number: {orderNumber}
            </p>
          )}

          <div className="bg-surface-container-low p-6 md:p-8 mb-6 md:mb-8 text-left">
            <h2 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
              Next Steps
            </h2>
            <ol className="space-y-3 md:space-y-4 text-white/80 text-xs md:text-sm">
              <li className="flex items-start gap-2 md:gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>
                  You have been redirected to WhatsApp. Send the pre-filled message to our admin.
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>
                  Our admin will confirm product availability and shipping cost.
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>
                  Complete payment via bank transfer as instructed by admin.
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <span className="w-5 h-5 md:w-6 md:h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </span>
                <span>
                  Once payment is confirmed, your order will be processed and shipped.
                </span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link
              href="/products"
              className="bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform text-sm md:text-base"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="bg-surface-container-highest px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-white border border-white/10 rounded-md hover:bg-surface-bright transition-colors text-sm md:text-base"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FontAwesomeIcon icon="circle-notch" spin className="text-5xl text-primary-container" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
