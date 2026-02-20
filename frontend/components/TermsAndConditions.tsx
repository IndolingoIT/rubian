import React from 'react';

interface TermsProps {
  t: any;
  onBack: () => void;
  lang: 'en' | 'id';
}

const TermsAndConditions: React.FC<TermsProps> = ({ t, onBack, lang }) => {
  const isId = lang === 'id';

  const sections = isId ? [
    {
      title: "1. Pendahuluan",
      content: "Selamat datang di JurnalLingua. Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan ini. Kami berkomitmen untuk melindungi integritas akademik dan privasi data Anda sesuai dengan hukum Republik Indonesia."
    },
    {
      title: "2. Pelindungan Data Pribadi (UU No. 27/2022)",
      content: "Sesuai dengan UU PDP, JurnalLingua bertindak sebagai Pengendali Data untuk informasi akun Anda dan Prosesor Data untuk naskah Anda. Kami hanya mengumpulkan data (nama, email, dokumen) untuk tujuan penyediaan layanan terjemahan. Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda kapan saja melalui dashboard akun."
    },
    {
      title: "3. Kepemilikan Kekayaan Intelektual",
      content: "Anda tetap menjadi pemilik tunggal atas hak cipta naskah asli yang diunggah. JurnalLingua tidak mengklaim hak kepemilikan atas hasil terjemahan; hasil tersebut sepenuhnya milik Anda setelah pembayaran diselesaikan."
    },
    {
      title: "4. Kerahasiaan Naskah",
      content: "Kami memahami sensitivitas riset yang belum dipublikasikan. Naskah Anda diproses melalui API aman (Google Gemini) yang mematuhi standar enkripsi industri. Kami tidak akan membagikan atau menjual konten naskah Anda kepada pihak ketiga."
    },
    {
      title: "5. Batasan Tanggung Jawab AI",
      content: "Layanan kami didukung oleh AI canggih. Meskipun kami berupaya memberikan hasil terbaik sesuai standar Scopus/SINTA, kami menyarankan peninjauan kembali oleh pakar bidang ilmu. JurnalLingua tidak bertanggung jawab atas penolakan jurnal oleh penerbit."
    },
    {
      title: "6. Kebijakan Pembayaran & Pengembalian",
      content: "Pembayaran dilakukan di muka berdasarkan jumlah kata. Karena sifat layanan digital yang bersifat instan, pengembalian dana tidak dimungkinkan setelah proses terjemahan penuh dimulai."
    }
  ] : [
    {
      title: "1. Introduction",
      content: "Welcome to JurnalLingua. By using our services, you agree to these terms. We are committed to protecting academic integrity and your data privacy in accordance with Indonesian law."
    },
    {
      title: "2. Personal Data Protection (Law No. 27/2022)",
      content: "In compliance with the PDP Law, JurnalLingua acts as a Data Controller for your account info and a Data Processor for your manuscripts. We only collect data (name, email, documents) for the purpose of providing translation services. You have the right to access, correct, or delete your data at any time via your account dashboard."
    },
    {
      title: "3. Intellectual Property Ownership",
      content: "You remain the sole owner of the copyright of uploaded manuscripts. JurnalLingua claims no ownership over the translated output; it belongs entirely to you upon completion of payment."
    },
    {
      title: "4. Manuscript Confidentiality",
      content: "We understand the sensitivity of unpublished research. Your manuscripts are processed via secure APIs (Google Gemini) adhering to industry encryption standards. We do not share or sell your content to third parties."
    },
    {
      title: "5. AI Limitation of Liability",
      content: "Our service is powered by advanced AI. While we strive for Scopus/SINTA quality, we recommend review by field-specific experts. JurnalLingua is not liable for journal rejections by publishers."
    },
    {
      title: "6. Payment & Refund Policy",
      content: "Payments are made upfront based on word count. Due to the instantaneous nature of digital services, refunds are not possible once the full translation process has commenced."
    }
  ];

  return (
    <div className="p-8 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-scale-balanced text-3xl text-slate-600"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.termsTitle}</h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
            {t.termsSubtitle}
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-16 shadow-xl mb-12">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <section key={idx}>
                <h3 className="text-xl font-black text-slate-900 mb-4">{section.title}</h3>
                <p className="text-slate-600 leading-relaxed text-justify font-serif">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col items-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
               <i className="fa-solid fa-shield-halved"></i>
               Data Protection Verified
             </div>
             <p className="text-[10px] text-slate-400 mt-4 text-center">
                Contact: legal@jurnallingua.com for PDP inquiries.
             </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-10 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;