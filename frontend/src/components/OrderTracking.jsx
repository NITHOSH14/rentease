import React from 'react';

const OrderTracking = ({ currentStatus, deliveryDate }) => {
  const steps = ['Pending', 'Approved', 'Out for Delivery', 'Delivered'];
  const isRejected = currentStatus === 'Rejected';
  
  if (isRejected) {
    return (
      <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center text-red-600 font-bold">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Order was Rejected
      </div>
    );
  }

  const currentIndex = steps.indexOf(currentStatus);
  const progressPercentage = currentIndex === -1 ? 0 : (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="mt-8 relative w-full pt-4">
      {/* Progress Bar Track */}
      <div className="absolute top-8 left-[10%] right-[10%] h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="relative z-10 flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex flex-col items-center w-1/4 group">
              <div 
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-sm font-black transition-all duration-500 shadow-sm
                  ${isCompleted ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}
                  ${isCurrent ? 'ring-4 ring-indigo-100' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className={`text-xs sm:text-sm font-bold transition-colors duration-500
                  ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {currentStatus === 'Delivered' ? (
        <div className="mt-6 flex items-center justify-center text-green-600 font-bold bg-green-50 p-3 rounded-xl animate-fade-in-up">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          🎉 Delivered successfully! Enjoy your rental.
        </div>
      ) : deliveryDate ? (
         <div className="mt-6 text-center text-sm font-medium text-gray-500">
           Estimated Delivery: <span className="font-bold text-gray-800">{new Date(deliveryDate).toLocaleDateString()}</span>
         </div>
      ) : null}
    </div>
  );
};

export default OrderTracking;
