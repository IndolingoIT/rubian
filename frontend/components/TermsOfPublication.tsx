import React from 'react';

interface TermsProps {
  t: any;
  onBack: () => void;
  lang: 'en' | 'id';
}

const TermsOfPublication: React.FC<TermsProps> = ({ t, onBack, lang }) => {
  const isId = lang === 'id';

  const sections = isId ? [
    {
      title: "1. Integritas Akademik",
      content: "Sebagai platform yang mendukung publikasi internasional, JurnalLingua mewajibkan pengguna untuk hanya mengunggah karya ilmiah orisinal. Pengguna bertanggung jawab penuh atas keabsahan data dan klaim yang ada dalam manuskrip."
    },
    {
      title: "2. Pengungkapan Penggunaan AI",
      content: "Layanan kami menggunakan model bahasa besar (Gemini 3 Pro) untuk membantu terjemahan. Anda setuju bahwa hasil terjemahan adalah hasil kolaborasi AI-Manusia. Beberapa jurnal internasional mungkin mewajibkan Anda untuk mencantumkan penggunaan AI dalam proses penulisan/penerjemahan di bagian Acknowledgments."
    },
    {
      title: "3. Standar Publikasi (Scopus/SINTA)",
      content: "JurnalLingua mengoptimalkan sintaks dan terminologi agar sesuai dengan standar jurnal terindeks Scopus dan SINTA. Namun, keputusan akhir penerimaan artikel tetap berada di tangan Dewan Redaksi jurnal tujuan."
    },
    {
      title: "4. Larangan Plagiarisme",
      content: "Kami menyediakan integrasi Turnitin untuk membantu Anda mendeteksi kemiripan naskah. Pengguna dilarang menyalahgunakan layanan kami untuk memproduksi atau mempublikasikan karya yang mengandung plagiarisme atau fabrikasi data."
    },
    {
      title: "5. Lisensi Penggunaan",
      content: "Dengan menggunakan layanan kami, Anda memberikan izin kepada JurnalLingua untuk memproses naskah Anda semata-mata untuk tujuan penerjemahan dan perbaikan bahasa. Kami tidak memiliki hak komersial atas konten riset Anda."
    }
  ] : [
    {
      title: "1. Academic Integrity",
      content: "As a platform supporting international publication, JurnalLingua requires users to upload only original scholarly work. Users are solely responsible for the validity of the data and claims within the manuscript."
    },
    {
      title: "2. AI Usage Disclosure",
      content: "Our services utilize large language models (Gemini 3 Pro) to assist in translation. You agree that the output is a result of AI-Human collaboration. Some international journals may require you to disclose the use of AI in the writing/translation process within the Acknowledgments section."
    },
    {
      title: "3. Publication Standards (Scopus/SINTA)",
      content: "JurnalLingua optimizes syntax and terminology to align with Scopus and SINTA indexed journal standards. However, the final decision on article acceptance remains with the target journal's Editorial Board."
    },
    {
      title: "4. Plagiarism Prohibition",
      content: "We provide Turnitin integration to help you detect manuscript similarity. Users are prohibited from misusing our services to produce or publish works containing plagiarism or data fabrication."
    },
    {
      title: "5. Usage License",
      content: "By using our service, you grant JurnalLingua permission to process your manuscript solely for translation and language improvement purposes. We hold no commercial rights over your research content."
    }
  ];

  return (
    <div className="p-8 md:p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-feather-pointed text-3xl text-indigo-600"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.termsPublication}</h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-medium">
            Scholarly ethical guidelines for JurnalLingua contributors.
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
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
               <i className="fa-solid fa-graduation-cap"></i>
               Scholarly Ethics Compliant
             </div>
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

export default TermsOfPublication;