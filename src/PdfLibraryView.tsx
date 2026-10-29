import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  Eye,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PdfDocument } from '../types';

export const PdfLibraryView: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { topics, pdfs, addPdfDoc, deletePdfDoc, pdfsLoading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [previewPdf, setPreviewPdf] = useState<PdfDocument | null>(null);

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [extractedPreview, setExtractedPreview] = useState<string>('');
  const [extractionNote, setExtractionNote] = useState<string>('');

  // Delete modal state
  const [deletingPdf, setDeletingPdf] = useState<PdfDocument | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter PDFs
  const filteredPdfs = pdfs.filter((p) => {
    const matchesTopic =
      selectedTopic === 'all' ||
      p.topic.toLowerCase().includes(selectedTopic.toLowerCase());
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.extractedText && p.extractedText.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const openUploadModal = () => {
    setFile(null);
    setTitle('');
    setTopic(topics[0]?.name ? `${topics[0].name} (${topics[0].nameEn})` : 'உயிரின் இரசாயன மற்றும் கல அடிப்படை (Chemical and Cellular Basis of Life)');
    setDescription('');
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);
    setExtractedPreview('');
    setExtractionNote('');
    setIsUploadOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('PDF வடிவக் கோப்புகளை மட்டுமே பதிவேற்ற முடியும் (.pdf format only).');
      return;
    }

    if (selected.size > 20 * 1024 * 1024) {
      setUploadError('கோப்பின் அளவு 20MB இற்குள் இருக்க வேண்டும் (Max 20MB).');
      return;
    }

    setFile(selected);
    setUploadError(null);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }

    // Trigger server-side PDF text extraction
    setIsExtracting(true);
    setExtractionNote('PDF உரை பிரித்தெடுக்கப்படுகிறது (Extracting text via server)...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/pdf/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64: base64Data, fileName: selected.name }),
          });
          const data = await res.json();
          if (data.success) {
            setExtractedPreview(data.extractedText || '');
            setExtractionNote(data.message || 'உரை வெற்றிகரமாக பிரித்தெடுக்கப்பட்டது.');
          } else {
            setExtractionNote('உரை பிரித்தெடுப்பில் பிழை: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          setExtractionNote('உரை பிரித்தெடுக்க முடியவில்லை. கோப்பு ஆவணமாக சேமிக்கப்படும்.');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(selected);
    } catch (err) {
      setIsExtracting(false);
      setExtractionNote('உரை பிரித்தெடுக்க முடியவில்லை.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setUploadError('PDF கோப்பு மற்றும் தலைப்பை உள்ளிடவும்.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      let downloadUrl = '';

      // Upload to Firebase Storage
      const storageRef = ref(storage, `pdfs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (err) => {
            console.error('Storage upload error:', err);
            // If storage permissions fail or mock required, fallback to persistent object URL or data representation
            reject(err);
          },
          async () => {
            downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      }).catch(async (storageErr) => {
        console.warn('Storage fallback triggered:', storageErr);
        // Fallback: create base64 or safe data URL if direct storage bucket is restricted in demo
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            downloadUrl = reader.result as string;
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      // Save metadata to Firestore
      const ok = await addPdfDoc({
        title: title.trim(),
        topic,
        description: description.trim() || undefined,
        downloadUrl,
        fileName: file.name,
        fileSize: file.size,
        extractedText: extractedPreview.slice(0, 80000),
      });

      if (ok) {
        setUploadSuccess('PDF ஆவணம் வெற்றிகரமாக பதிவேற்றப்பட்டது (PDF saved successfully)!');
        setTimeout(() => setIsUploadOpen(false), 1200);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'PDF பதிவேற்றத்தில் பிழை ஏற்பட்டது.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPdf) return;
    setDeleteLoading(true);
    try {
      const ok = await deletePdfDoc(deletingPdf.id);
      if (ok) {
        if (previewPdf?.id === deletingPdf.id) {
          setPreviewPdf(null);
        }
        setDeletingPdf(null);
      }
    } catch (err: any) {
      alert('நீக்குவதில் பிழை: ' + (err?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>PDF ஆவண நூலகம் (Biology PDF Library)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            A/L உயிரியல் வளப்புத்தகங்கள், சுருக்கக் குறிப்புகள் மற்றும் மாதிரி வினாத்தாள்கள்
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openUploadModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>PDF ஆவணத்தை பதிவேற்றுக (+ Upload PDF)</span>
          </button>
        )}
      </div>

      {/* Search & Topic Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PDF தலைப்பு அல்லது பிரித்தெடுக்கப்பட்ட உரையைத் தேடுக..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full md:w-auto text-xs bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
        >
          <option value="all">அனைத்து அலகுகளும் (All Topics)</option>
          {topics.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name} ({t.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* PDF Cards Grid */}
      {pdfsLoading ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">PDF ஆவணங்கள் ஏற்றப்படுகின்றன...</p>
        </div>
      ) : filteredPdfs.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200/80 text-center space-y-3">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">PDF ஆவணங்கள் எதுவும் கிடைக்கவில்லை</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            தேடல் சொல்லை மாற்றி அல்லது வேறு அலகைத் தெரிவு செய்து தேடவும்.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full line-clamp-1">
                    {pdf.topic}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => setDeletingPdf(pdf)}
                      title="நீக்கு (Delete PDF)"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                      {pdf.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{pdf.fileName}</p>
                  </div>
                </div>

                {pdf.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {pdf.description}
                  </p>
                )}

                {pdf.extractedText ? (
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-emerald-900">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>உரை தேடக்கூடியது & AI-ஆல் பயன்படுத்தப்படும்</span>
                    </div>
                    <p className="line-clamp-2 text-gray-600 italic">
                      "{pdf.extractedText.slice(0, 140)}..."
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic">
                    (ஸ்கேன் செய்யப்பட்ட ஆவணம் / உரை பிரித்தெடுக்கப்படவில்லை)
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 text-[11px]">
                  {pdf.fileSize ? `${Math.round(pdf.fileSize / 1024)} KB` : 'PDF'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPdf(pdf)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>பார்வையிடு</span>
                  </button>

                  <a
                    href={pdf.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>திறக்க</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF In-App Preview Modal */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold truncate max-w-xl">{previewPdf.title}</h3>
                <p className="text-xs text-blue-100">{previewPdf.topic} • {previewPdf.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdf.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold text-white flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>புதிய தாவலில் திற</span>
                </a>
                <button
                  onClick={() => setPreviewPdf(null)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-2 overflow-hidden flex flex-col">
              {/* PDF Embed / Iframe */}
              <iframe
                src={previewPdf.downloadUrl}
                title={previewPdf.title}
                className="w-full flex-1 rounded-xl border border-gray-300 bg-white"
              />

              {previewPdf.extractedText && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 max-h-36 overflow-y-auto">
                  <div className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    பிரித்தெடுக்கப்பட்ட தேடக்கூடிய உரை (Searchable Extracted Text):
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap font-sans">
                    {previewPdf.extractedText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin PDF Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-200" />
                <span>உயிரியல் PDF ஆவணப் பதிவேற்றம் (Upload PDF)</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* File picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PDF கோப்பைத் தெரிவு செய்க (.pdf, அதிகபட்சம் 20MB) *
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl p-1"
                />
              </div>

              {/* Extraction status notice */}
              {extractionNote && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                  {isExtracting ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <span>{extractionNote}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ஆவணத்தின் தலைப்பு (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="எ.கா: கலப் புன்னங்கங்களின் தொழிற்பாடுகள்"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  உயிரியல் அலகு (Biology Unit) *
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={`${t.name} (${t.nameEn})`}>
                      {t.name} ({t.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  விளக்கம் (Description - விருப்பத்தேர்வு)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ஆவணத்தைப் பற்றிய சிறு விளக்கம்..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Upload progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600 font-semibold">
                    <span>பதிவேற்றப்படுகிறது...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  இரத்து செய்க
                </button>

                <button
                  type="submit"
                  disabled={uploadLoading || isExtracting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>பதிவேற்று (Upload PDF)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                PDF ஆவணத்தை நீக்க வேண்டுமா?
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                "{deletingPdf.title}" என்ற PDF ஆவணம் மற்றும் அதன் பிரித்தெடுக்கப்பட்ட உரை நிரந்தரமாக நீக்கப்படும்.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingPdf(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                இரத்து செய்க
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {deleteLoading ? 'நீக்கப்படுகிறது...' : 'ஆம், நீக்குக'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
