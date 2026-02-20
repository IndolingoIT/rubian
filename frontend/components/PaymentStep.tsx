import React, { useState, useEffect } from 'react';

interface PaymentStepProps {
  onSuccess: (isUsingCredits?: boolean) => void;
  onCancel: () => void;
  amount: number;
  currency: string;
  t: any;
  userCredits?: number;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onSuccess, onCancel, amount, currency, t, userCredits }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qris' | 'credits'>(userCredits && userCredits > 0 ? 'credits' : 'qris');
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(paymentMethod === 'credits');
    }, 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAmount = currency === 'IDR' 
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
    : `$${amount.toFixed(2)}`;

  // CRC16 CCITT Algorithm for valid QRIS payload
  const crc16 = (data: string) => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  const generateQrisData = (amt: number) => {
    const amountStr = Math.floor(amt).toString();
    const amountTag = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
    // Common QRIS Static Payload Template
    const payloadBase = "00020101021126610014ID.CO.QRIS.WWW0215ID10254244309530303A01520400005303360";
    const payloadMiddle = "5802ID5921MOCH HIKMAT GUMILAR 6007BANDUNG6105401162070703A01";
    const payloadWithAmount = `${payloadBase}${amountTag}${payloadMiddle}6304`;
    const checkSum = crc16(payloadWithAmount);
    return `${payloadWithAmount}${checkSum}`;
  };

  return (
    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Summary & Selection */}
        <div className="lg:w-1/2">
          <div className="mb-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
              <i className="fa-solid fa-lock text-2xl text-emerald-600"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.secureCheckout}</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">{t.standardTrans}</p>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-[2rem] p-8 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/50">
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{t.standardTrans}</span>
              <span className="font-bold text-slate-900 text-sm">{formattedAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-900 font-black text-lg">{t.total}</span>
              <span className="text-indigo-600 font-black text-2xl">{formattedAmount}</span>
            </div>
          </div>

          <div className="space-y-4">
            {userCredits !== undefined && (
              <div 
                onClick={() => setPaymentMethod('credits')}
                className={`border-2 rounded-[1.5rem] p-5 flex items-center gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'credits' ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100/50' : 'border-slate-100 bg-white hover:border-indigo-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${paymentMethod === 'credits' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'}`}>
                  {paymentMethod === 'credits' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div className="flex-grow">
                  <div className="font-black text-slate-900 text-sm">{t.useCredits}</div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                    {t.availableCredits.replace('{count}', userCredits.toLocaleString()).replace('{cost}', (amount / 10).toLocaleString())}
                  </div>
                </div>
                <i className="fa-solid fa-coins text-amber-400 text-xl"></i>
              </div>
            )}

            <div 
              onClick={() => setPaymentMethod('qris')}
              className={`border-2 rounded-[1.5rem] p-5 flex items-center gap-4 cursor-pointer transition-all ${
                paymentMethod === 'qris' ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100/50' : 'border-slate-100 bg-white hover:border-indigo-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${paymentMethod === 'qris' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'}`}>
                {paymentMethod === 'qris' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex-grow">
                <div className="font-black text-slate-900 text-sm">QRIS (GoPay, OVO, DANA)</div>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" className="h-4" alt="QRIS" />
            </div>

            <div 
              onClick={() => setPaymentMethod('card')}
              className={`border-2 rounded-[1.5rem] p-5 flex items-center gap-4 cursor-pointer transition-all ${
                paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-100/50' : 'border-slate-100 bg-white hover:border-indigo-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'}`}>
                {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex-grow">
                <div className="font-black text-slate-900 text-sm">Credit / Debit Card</div>
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={loading}
            className="mt-8 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left text-[8px]"></i>
            {t.goBack}
          </button>
        </div>

        {/* Right Side */}
        <div className="lg:w-1/2 flex flex-col">
          {paymentMethod === 'qris' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden h-full flex flex-col">
               <div className="bg-slate-900 p-8 text-white">
                  <div className="flex justify-between items-start mb-6">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" className="h-6 brightness-0 invert" alt="QRIS" />
                    <div className="text-right">
                       <p className="text-sm font-black text-indigo-400 font-mono tracking-tighter">{formatTime(countdown)}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{t.qrisMerchant}</h3>
               </div>
               <div className="p-8 flex-grow flex flex-col items-center justify-center text-center">
                  <div className="w-56 h-56 bg-white border border-slate-100 p-4 rounded-[2rem] shadow-xl mb-6">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(generateQrisData(amount))}`} 
                      alt="QRIS" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mb-4 italic">{t.paymentNote}</p>
                  <button 
                    onClick={handleCopyAmount}
                    className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xl font-black text-slate-900 hover:border-indigo-200 transition-all"
                  >
                    {formattedAmount}
                    <i className="fa-solid fa-copy text-slate-300"></i>
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-indigo-700 transition-all"
                  >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : t.confirmPayment}
                  </button>
               </div>
            </div>
          )}

          {(paymentMethod === 'credits' || paymentMethod === 'card') && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 flex flex-col items-center justify-center text-center h-full animate-in fade-in slide-in-from-right-4 shadow-2xl">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-10 border border-indigo-100">
                <i className={`fa-solid ${paymentMethod === 'credits' ? 'fa-coins' : 'fa-credit-card'} text-4xl text-indigo-600`}></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                {paymentMethod === 'credits' ? t.redeemCredits : "Credit/Debit Card"}
              </h3>
              <p className="text-sm text-slate-400 mb-12 max-w-xs leading-relaxed">
                {paymentMethod === 'credits' 
                  ? t.availableCredits.replace('{count}', userCredits?.toLocaleString() || '0').replace('{cost}', (amount / 10).toLocaleString())
                  : t.standardTrans}
              </p>
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-indigo-700 transition-all"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (paymentMethod === 'credits' ? "Confirm Usage" : t.payAndTranslate.replace('{amount}', formattedAmount))}
              </button>
              {paymentMethod === 'credits' && (
                <button onClick={() => setPaymentMethod('qris')} className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600">
                  {t.payInstead}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;