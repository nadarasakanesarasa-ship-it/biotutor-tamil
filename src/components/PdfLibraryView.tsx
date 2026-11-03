
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PdfDocument } from '../types';

export const PdfLibraryView: React.FC = () => {
  const { isAdmin } = useAuth();
  const { topics, pdfs, addPdfDoc, deletePdfDoc, pdfsLoading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [previewPdf, setPreviewPdf] = useState<PdfDocument | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [deletingPdf, setDeletingPdf] = useState<PdfDocument | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const getPdfUrl = (pdf: PdfDocument) => {
  const safeFileName = pdf.fileName.trim();

  return `https://biotutor-tamil.web.app/pdfs/biology/${encodeURIComponent(
    safeFileName
  )}`;
};

  const filteredPdfs = pdfs.filter((p) => {
    const matchesTopic =
      selectedTopic === 'all' ||
      p.topic.toLowerCase().includes(selectedTopic.toLowerCase());

    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.extractedText &&
        p.extractedText.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTopic && matchesSearch;
  });

  const openUploadModal = () => {
    setFileName('');
    setTitle('');
    setTopic(
      topics[0]?.name
        ? `${topics[0].name} (${topics[0].nameEn})`
        : ''
    );
    setDescription('');
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploadOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeFileName = fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!safeFileName.toLowerCase().endsWith('.pdf')) {
      setUploadError(
        'சரியான PDF கோப்புப் பெயரை உள்ளிடவும். உதாரணம்: cell-biology.pdf'
      );
      return;
    }

    if (!title.trim() || !topic) {
      setUploadError('தலைப்பு மற்றும் உயிரியல் அலகை நிரப்பவும்.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const downloadUrl =
        `https://biotutor-tamil.web.app/pdfs/biology/${encodeURIComponent(safeFileName)}`;

      const ok = await addPdfDoc({
        title: title.trim(),
        topic,
        description: description.trim() || undefined,
        downloadUrl,
        fileName: safeFileName,
      });

      if (ok) {
        setUploadSuccess('PDF விவரங்கள் வெற்றிகரமாகச் சேமிக்கப்பட்டன!');
        setTimeout(() => setIsUploadOpen(false), 1200);
      } else {
        setUploadError('PDF விவரங்களைச் சேமிக்க முடியவில்லை.');
      }
    } catch (err: any) {
      setUploadError(
        err?.message || 'PDF விவரங்களைச் சேமிப்பதில் பிழை ஏற்பட்டது.'
      );
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
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>PDF விவரங்களைச் சேர்க்க (+ Add PDF)</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PDF தலைப்பைத் தேடுக..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full md:w-auto text-xs bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-700 font-semibold"
        >
          <option value="all">அனைத்து அலகுகளும்</option>
          {topics.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name} ({t.nameEn})
            </option>
          ))}
        </select>
      </div>

      {/* PDF List */}
      {pdfsLoading ? (
        <div className="p-12 text-center text-gray-400">
          PDF ஆவணங்கள் ஏற்றப்படுகின்றன...
        </div>
      ) : filteredPdfs.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700 mt-3">
            PDF ஆவணங்கள் எதுவும் கிடைக்கவில்லை
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {pdf.topic}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => setDeletingPdf(pdf)}
                      title="PDF நீக்கு"
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {pdf.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {pdf.fileName}
                    </p>
                  </div>
                </div>

                {pdf.description && (
                  <p className="text-xs text-gray-600">
                    {pdf.description}
                  </p>
                )}

                {pdf.extractedText && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-800">
                    <div className="flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      உரை தேடக்கூடியது
                    </div>
                    <p className="mt-1 text-gray-600">
                      {pdf.extractedText.slice(0, 140)}...
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">
                  {pdf.fileSize
                    ? `${Math.round(pdf.fileSize / 1024)} KB`
                    : 'PDF'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewPdf(pdf)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    பார்வையிடு
                  </button>

                  <a
                    href={getPdfUrl(pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    திறக்க
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col h-[85vh]">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {previewPdf.title}
                </h3>
                <p className="text-xs text-blue-100">
                  {previewPdf.topic} • {previewPdf.fileName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                 href={getPdfUrl(previewPdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/20 text-xs"
                >
                  புதிய தாவலில் திற
                </a>
                <button onClick={() => setPreviewPdf(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-2">
              <iframe
  src={getPdfUrl(previewPdf)}
  title={previewPdf.title}
  className="w-full h-full rounded-xl border bg-white"
  onError={() => console.error('PDF loading failed')}
/>
            </div>
          </div>
        </div>
      )}

      {/* Add PDF Metadata Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="relative w-full max-w-xl bg-white rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                PDF விவரங்களைச் சேர்க்க
              </h3>
              <button onClick={() => setIsUploadOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUploadSubmit}
              className="p-6 overflow-y-auto space-y-4"
            >
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {uploadSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PDF கோப்பின் பெயர் *
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="cell-biology.pdf"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  PDF கோப்பு public/pdfs/biology/ folder-ல் ஏற்கெனவே இருக்க வேண்டும்.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ஆவணத்தின் தலைப்பு *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="எ.கா: கலத்தின் தொழிற்பாடுகள்"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  உயிரியல் அலகு *
                </label>
                <select
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                >
                  <option value="">அலகைத் தெரிவு செய்க</option>
                  {topics.map((t) => (
                    <option
                      key={t.id}
                      value={`${t.name} (${t.nameEn})`}
                    >
                      {t.name} ({t.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  விளக்கம் (விருப்பத்தேர்வு)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ஆவணத்தைப் பற்றிய சிறு விளக்கம்..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                />
              </div>

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
                  disabled={uploadLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadLoading ? 'சேமிக்கப்படுகிறது...' : 'விவரங்களைச் சேமி'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                PDF ஆவணத்தை நீக்க வேண்டுமா?
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                "{deletingPdf.title}" என்ற PDF ஆவணத்தின் விவரங்கள் நீக்கப்படும்.
                Hosting-ல் உள்ள உண்மையான கோப்பு தானாக நீக்கப்படாது.
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
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
