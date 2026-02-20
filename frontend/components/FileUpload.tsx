
import React, { useRef, useState } from 'react';
import { FileData } from '../types';

declare const mammoth: any;
declare const pdfjsLib: any;

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  onTryDemo?: () => void;
  selectedFile: FileData | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTryDemo, selectedFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateWords = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } else if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }

      const wordCount = calculateWords(extractedText);

      onFileSelect({
        name: file.name,
        size: file.size,
        type: file.type,
        content: extractedText,
        wordCount: wordCount
      });
    } catch (err) {
      alert("Error processing file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
        className={`flex-grow border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all min-h-[350px] ${
          dragActive ? 'border-indigo-600 bg-indigo-50/30' : 
          selectedFile ? 'border-emerald-400 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-400'
        }`}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" />

        {isProcessing ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-800">Calculating words...</p>
          </div>
        ) : !selectedFile ? (
          <>
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-file-upload text-2xl text-indigo-600"></i>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Journal Manuscript</h3>
            <p className="text-xs text-slate-500 mb-8">Drop PDF or Word document here</p>
            
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <button 
                onClick={() => inputRef.current?.click()} 
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-indigo-600 transition-all active:scale-95"
              >
                Choose File
              </button>
              
              <div className="flex items-center gap-3 w-full py-2">
                <div className="h-[1px] bg-slate-100 flex-grow"></div>
                <span className="text-[9px] font-black text-slate-300 uppercase">OR</span>
                <div className="h-[1px] bg-slate-100 flex-grow"></div>
              </div>

              <button 
                onClick={onTryDemo}
                className="w-full py-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-magic-wand-sparkles text-[10px]"></i>
                Try with Demo File
              </button>
            </div>
          </>
        ) : (
          <div className="w-full text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase">
              <i className="fa-solid fa-check"></i> Analysis Ready
            </div>
            <p className="font-bold text-slate-900 truncate max-w-xs mx-auto mb-1">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 font-bold">{selectedFile.wordCount} words detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
