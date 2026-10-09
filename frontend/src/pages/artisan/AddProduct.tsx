import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, UploadCloud, CheckCircle, ArrowRight, ArrowLeft,
  Image as ImageIcon, Sparkles, Tag, DollarSign, X,
  AlertTriangle, Info, Activity, Square, Loader
} from "lucide-react";
import { apiCall, uploadCall } from "../../api";
import { useLanguage } from "../../i18n/LanguageContext";
import ArtisanLayout from "../../components/ArtisanLayout";

export default function AddProduct() {
  const { t } = useLanguage();
  const STEPS = [
    t("addProduct.stepPhoto", "Photo"),
    t("addProduct.stepDescribe", "Describe"),
    t("addProduct.stepCatalog", "Details"),
    t("addProduct.stepPricing", "Pricing"),
    t("addProduct.stepPublish", "Publish")
  ];
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [productId, setProductId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [catalog, setCatalog] = useState<any>({});
  const [pricing, setPricing] = useState<any>({ recommended: 0, suggested_min: 0, suggested_max: 0, explanation: "" });
  const [finalPrice, setFinalPrice] = useState(0);
  const [productHealth, setProductHealth] = useState<any>(null);

  const [recordingError, setRecordingError] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const recordingStartRef = useRef<number>(0);
  const isUploadingRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }, []);

  const MIN_RECORDING_MS = 1500;
  const MIN_BLOB_BYTES = 2048;

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (transcribing || isUploadingRef.current) return;

    setRecordingError("");
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recordingStartRef.current = Date.now();

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setIsRecording(false);

        const durationMs = Date.now() - recordingStartRef.current;

        if (durationMs < MIN_RECORDING_MS) {
          setRecordingError("Recording was too short. Hold the button for at least 2 seconds while speaking.");
          return;
        }

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size < MIN_BLOB_BYTES) {
          setRecordingError("No audio was captured. Check your microphone and try again.");
          return;
        }

        if (isUploadingRef.current) return;
        isUploadingRef.current = true;
        setTranscribing(true);

        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await uploadCall("/ai/transcribe", fd);

          if (res.no_speech) {
            setRecordingError(res.message || "No speech detected. Please try again and speak clearly.");
          } else if (res.text) {
            setTranscript(res.text);
            setDescription(prev => (prev.trim() ? prev.trim() + " " + res.text : res.text));
          } else if (res.detail) {
            setRecordingError("Transcription error: " + res.detail);
          }
        } catch (err: any) {
          setRecordingError("Transcription failed: " + (err.message || "Unknown error") + ". Please type your description instead.");
        } finally {
          setTranscribing(false);
          isUploadingRef.current = false;
        }
      };

      recorder.start(1000);
      setIsRecording(true);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setRecordingError("Microphone access was denied. Please allow microphone access in your browser settings.");
      } else if (err?.name === "NotFoundError") {
        setRecordingError("No microphone found. Please connect a microphone and try again.");
      } else {
        setRecordingError("Could not access microphone: " + err.message);
      }
    }
  };

  const handleUploadImage = async () => {
    if (!file) return;
    setLoading(true);
    try {
      let pid = productId;
      if (!pid) {
        const p = await apiCall("/products", { method: "POST", body: JSON.stringify({}) });
        pid = p.id;
        setProductId(p.id);
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadCall(`/products/${pid}/image`, fd);
      setImageAnalysis(res.analysis);
      if (!res.analysis?.needs_attention) setStep(2);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCatalog = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const res = await apiCall("/ai/generate-catalog", { method: "POST", body: JSON.stringify({ description }) });
      setCatalog(res);
      setStep(3);
    } catch (err: any) {
      alert("Catalog generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePricing = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/ai/recommend-price", {
        method: "POST",
        body: JSON.stringify({ materials: catalog.materials, category: catalog.category, description })
      });
      setPricing(res);
      setFinalPrice(res.recommended);
      if (productId) {
        await apiCall(`/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify({ name: catalog.name, category: catalog.category, description: catalog.description, materials: catalog.materials, color: catalog.color, production_time: catalog.production_time, tags: catalog.tags, ai_suggested_price: res.recommended, final_price: res.recommended })
        });
        const health = await apiCall(`/products/${productId}/health`);
        setProductHealth(health);
      }
      setStep(4);
    } catch (err: any) {
      alert("Pricing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await apiCall(`/products/${productId}`, { method: "PUT", body: JSON.stringify({ is_published: true, final_price: finalPrice }) });
      navigate("/artisan/products");
    } catch (err: any) {
      alert("Publish failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [
    <ImageIcon size={15} />,
    <Mic size={15} />,
    <Tag size={15} />,
    <DollarSign size={15} />,
    <CheckCircle size={15} />
  ];

  return (
    <ArtisanLayout>
      <div className="max-w-2xl mx-auto px-2 pb-12">
        {/* Back link */}
        <button
          onClick={() => navigate("/artisan/products")}
          className="mb-6 flex items-center gap-1.5 text-[#6B6860] hover:text-[#0B0B0F] transition text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t("nav.catalogue", "Back to My Catalogue")}
        </button>

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            {t("addProduct.title", "Add New Handcrafted Product")}
          </h1>
          <p className="text-[#6B6860] text-sm mt-1">{t("brand.tagline", "Follow the steps to list your craft on the marketplace.")}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-1">
          {STEPS.map((label, i) => {
            const isCompleted = step > i + 1;
            const isActive = step === i + 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                {/* connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-1/2 top-4 w-full h-px transition-colors ${step > i + 1 ? "bg-[#7CE25B]" : "bg-[#E8E6E1]"}`} style={{ left: "50%", width: "calc(100% - 2rem)" }} />
                )}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-[#7CE25B] text-[#0B0B0F]"
                    : isActive
                    ? "bg-[#0B0B0F] text-white ring-4 ring-[#0B0B0F]/10"
                    : "bg-white border border-[#E8E6E1] text-[#6B6860]"
                }`}>
                  {isCompleted ? <CheckCircle size={14} /> : stepIcons[i]}
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors hidden sm:block ${
                  isActive ? "text-[#0B0B0F]" : isCompleted ? "text-[#7CE25B]" : "text-[#6B6860]"
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step cards */}
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 sm:p-8 min-h-[420px] flex flex-col">

          {/* ── Step 1: Photo ── */}
          {step === 1 && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Upload Product Photo</h2>
                <p className="text-[#6B6860] text-sm mt-1">A clear, well-lit photo builds trust and helps AI understand your product.</p>
              </div>

              {/* Drop zone */}
              <label className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 mb-5 cursor-pointer transition-all ${
                preview
                  ? "border-[#7CE25B]/50 bg-[#7CE25B]/5"
                  : "border-[#E8E6E1] hover:border-[#0B0B0F]/30 hover:bg-[#F7F5F0]"
              }`}>
                {!preview ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#F7F5F0] border border-[#E8E6E1] flex items-center justify-center mb-4">
                      <UploadCloud className="w-7 h-7 text-[#6B6860]" />
                    </div>
                    <span className="text-[#0B0B0F] font-semibold text-sm">Click or drag to upload</span>
                    <p className="text-[#6B6860] text-xs mt-1.5">JPG, PNG up to 10 MB</p>
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        setPreview(URL.createObjectURL(e.target.files[0]));
                        setImageAnalysis(null);
                      }
                    }} />
                  </>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setPreview(""); setFile(null); setImageAnalysis(null); }}
                      className="absolute -top-3 -right-3 bg-[#0B0B0F] text-white rounded-full p-1 hover:bg-[#333] z-10 transition"
                    >
                      <X size={12} />
                    </button>
                    <img src={preview} alt="Preview" className="max-h-52 rounded-xl object-contain shadow-sm" />
                  </div>
                )}
              </label>

              {/* Image analysis */}
              {imageAnalysis && (
                <div className={`mb-5 p-4 rounded-xl border flex items-start gap-3 ${
                  imageAnalysis.needs_attention
                    ? "bg-orange-50 border-orange-200"
                    : "bg-[#7CE25B]/10 border-[#7CE25B]/30"
                }`}>
                  {imageAnalysis.needs_attention
                    ? <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    : <CheckCircle className="w-5 h-5 text-[#4caf30] flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className={`font-semibold text-sm ${imageAnalysis.needs_attention ? "text-orange-800" : "text-[#2d6e1f]"}`}>
                      Image Quality Score: {imageAnalysis.score}/100
                    </p>
                    <p className={`text-sm mt-0.5 ${imageAnalysis.needs_attention ? "text-orange-700" : "text-[#3d8a28]"}`}>
                      {imageAnalysis.recommendation}
                    </p>
                    {imageAnalysis.needs_attention && (
                      <button onClick={() => setStep(2)} className="mt-2 text-xs font-semibold text-orange-700 underline">
                        Continue anyway →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(!imageAnalysis || !imageAnalysis.needs_attention) && (
                <button
                  onClick={handleUploadImage}
                  disabled={!file || loading}
                  className="w-full bg-[#7CE25B] text-[#0B0B0F] font-semibold py-3 rounded-xl hover:bg-[#6dd44f] disabled:opacity-40 flex items-center justify-center gap-2 transition"
                >
                  {loading
                    ? <><Loader className="w-4 h-4 animate-spin text-[#0B0B0F]" /> Uploading…</>
                    : <>Upload & Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          )}

          {/* ── Step 2: Describe ── */}
          {step === 2 && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Describe Your Craft</h2>
                <p className="text-[#6B6860] text-sm mt-1">Speak or type — share the materials, process, and story behind this product.</p>
              </div>

              {/* Mic area */}
              <div className={`rounded-2xl border p-6 mb-5 flex flex-col items-center transition-all ${
                isRecording
                  ? "bg-red-50 border-red-200"
                  : transcribing
                  ? "bg-[#3FC7E9]/10 border-[#3FC7E9]/30"
                  : "bg-[#F7F5F0] border-[#E8E6E1]"
              }`}>
                <button
                  onClick={toggleRecording}
                  disabled={transcribing || isUploadingRef.current}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all shadow-md ${
                    isRecording
                      ? "bg-red-500 text-white scale-110 ring-4 ring-red-300 animate-pulse"
                      : transcribing
                      ? "bg-[#E8E6E1] text-[#6B6860] cursor-not-allowed"
                      : "bg-[#0B0B0F] text-white hover:scale-105 ring-4 ring-[#7CE25B]/30"
                  }`}
                >
                  {transcribing
                    ? <Loader className="w-8 h-8 animate-spin" />
                    : isRecording
                    ? <Square className="w-7 h-7" />
                    : <Mic className="w-7 h-7" />}
                </button>
                <p className={`font-semibold text-sm ${
                  isRecording ? "text-red-700" : transcribing ? "text-[#3FC7E9]" : "text-[#0B0B0F]"
                }`}>
                  {isRecording
                    ? "Recording… tap to stop"
                    : transcribing
                    ? "Transcribing — please wait…"
                    : "Tap to start recording"}
                </p>
                <p className="text-xs text-[#6B6860] mt-1">
                  {isRecording ? "Speak clearly, hold for at least 2 seconds" : "Supports Hindi & English"}
                </p>
              </div>

              {recordingError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium text-sm">{recordingError}</p>
                    <button onClick={() => setRecordingError("")} className="text-xs text-red-600 underline mt-1">Dismiss</button>
                  </div>
                </div>
              )}

              {transcript && !isRecording && !transcribing && (
                <div className="mb-4 p-4 bg-[#7CE25B]/10 border border-[#7CE25B]/30 rounded-xl">
                  <p className="text-xs font-bold text-[#2d6e1f] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Transcript captured — added below
                  </p>
                  <p className="text-[#0B0B0F] text-sm italic">"{transcript}"</p>
                  <p className="text-xs text-[#6B6860] mt-1">Review and edit before generating the catalogue.</p>
                </div>
              )}

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8E6E1]" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-[#6B6860]">or type below</span></div>
              </div>

              <textarea
                className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white resize-none h-32 text-[#0B0B0F] placeholder-[#6B6860] mb-2"
                placeholder="E.g. This is a hand-woven silk saree made from pure mulberry silk. It took about 3 weeks to weave on a traditional loom..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <p className="text-xs text-[#6B6860] mb-6">The AI catalogue will only use what you write here. Nothing will be added without your approval.</p>

              <div className="flex justify-between mt-auto">
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2.5 text-[#6B6860] hover:text-[#0B0B0F] font-medium text-sm transition rounded-xl hover:bg-[#F7F5F0]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleGenerateCatalog}
                  disabled={loading || !description.trim() || transcribing}
                  className="bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6dd44f] disabled:opacity-40 flex items-center gap-2 transition"
                >
                  {loading
                    ? <><Loader className="w-4 h-4 animate-spin" /> Generating…</>
                    : <>Generate Catalog <Sparkles className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Catalog Review ── */}
          {step === 3 && (
            <div className="flex flex-col flex-1">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 bg-[#0B0B0F] text-[#7CE25B] text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generated Catalog
                </span>
                <h2 className="text-xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Review & Edit Details</h2>
                <p className="text-[#6B6860] text-sm mt-1">These details were crafted from your description. Edit anything before proceeding.</p>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-[#6B6860] uppercase tracking-wider mb-1.5">Product Title</label>
                  <input
                    type="text"
                    className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white font-semibold text-[#0B0B0F]"
                    value={catalog.name || ""}
                    onChange={e => setCatalog({ ...catalog, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6860] uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white resize-none h-24 text-[#0B0B0F]"
                    value={catalog.description || ""}
                    onChange={e => setCatalog({ ...catalog, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "category", label: "Category" },
                    { key: "materials", label: "Materials" },
                    { key: "color", label: "Color" },
                    { key: "tags", label: "Tags" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[#6B6860] uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="text"
                        className="w-full border border-[#E8E6E1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0B0B0F] transition bg-white text-[#0B0B0F]"
                        value={(catalog as any)[key] || ""}
                        onChange={e => setCatalog({ ...catalog, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2.5 text-[#6B6860] hover:text-[#0B0B0F] font-medium text-sm transition rounded-xl hover:bg-[#F7F5F0]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handlePricing}
                  disabled={loading || !catalog.name}
                  className="bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6dd44f] disabled:opacity-40 flex items-center gap-2 transition"
                >
                  {loading
                    ? <><Loader className="w-4 h-4 animate-spin" /> Calculating…</>
                    : <>Get Price Recommendation <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Pricing ── */}
          {step === 4 && (
            <div className="flex flex-col flex-1">
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Smart Pricing</h2>
                <p className="text-[#6B6860] text-sm mt-1">Earn what your craft is worth.</p>
              </div>

              {/* AI suggestion card */}
              <div className="bg-[#0B0B0F] rounded-2xl p-6 mb-5 relative overflow-hidden">
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-[#7CE25B] text-[#0B0B0F] text-xs font-bold px-2.5 py-1 rounded-full">
                  <Sparkles size={10} /> AI Suggested
                </span>
                <p className="text-[#6B6860] text-xs font-semibold uppercase tracking-wider mb-1">Recommended Price</p>
                <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>₹{pricing.recommended}</p>
                <p className="text-[#6B6860] text-sm mb-4">Market Range: ₹{pricing.suggested_min} – ₹{pricing.suggested_max}</p>
                <div className="bg-white/10 rounded-xl p-4 text-sm text-white/80">
                  <strong className="text-white">Explanation: </strong>{pricing.explanation}
                </div>
              </div>

              {/* Manual price input */}
              <div className="border border-[#E8E6E1] rounded-2xl p-5 mb-5 bg-white">
                <label className="block text-sm font-semibold text-[#0B0B0F] mb-3">Set Your Final Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6860] font-semibold text-lg">₹</span>
                  <input
                    type="number"
                    className="w-full pl-9 border border-[#E8E6E1] rounded-xl py-3 text-2xl font-bold text-[#0B0B0F] focus:outline-none focus:border-[#0B0B0F] transition bg-white"
                    value={finalPrice}
                    onChange={e => setFinalPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-auto">
                <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-4 py-2.5 text-[#6B6860] hover:text-[#0B0B0F] font-medium text-sm transition rounded-xl hover:bg-[#F7F5F0]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="bg-[#7CE25B] text-[#0B0B0F] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6dd44f] flex items-center gap-2 transition"
                >
                  Review & Publish <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Publish ── */}
          {step === 5 && (
            <div className="flex flex-col flex-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#7CE25B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#4caf30]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0B0B0F]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Ready to Publish!</h2>
                <p className="text-[#6B6860] text-sm mt-2">Your product has been cataloged and priced. Publish to make it visible to buyers.</p>
              </div>

              {/* Summary card */}
              <div className="bg-[#F7F5F0] border border-[#E8E6E1] rounded-2xl p-5 mb-5 flex items-start gap-4">
                {preview && (
                  <img src={preview} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-[#E8E6E1]" />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[#0B0B0F] text-base truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{catalog.name}</h4>
                  <p className="text-[#6B6860] text-sm">{catalog.category}</p>
                  {catalog.materials && <p className="text-xs text-[#6B6860] mt-0.5">Materials: {catalog.materials}</p>}
                  <p className="text-[#7CE25B] font-bold text-xl mt-2" style={{ fontFamily: "Space Grotesk, sans-serif" }}>₹{finalPrice}</p>
                </div>
              </div>

              {productHealth && (
                <div className={`mb-5 p-4 rounded-2xl border flex items-start gap-3 ${
                  productHealth.score >= 80
                    ? "bg-[#7CE25B]/10 border-[#7CE25B]/30"
                    : productHealth.score >= 60
                    ? "bg-[#3FC7E9]/10 border-[#3FC7E9]/30"
                    : "bg-amber-50 border-amber-200"
                }`}>
                  <Activity className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    productHealth.score >= 80 ? "text-[#4caf30]" : productHealth.score >= 60 ? "text-[#3FC7E9]" : "text-amber-500"
                  }`} />
                  <div>
                    <p className="font-semibold text-[#0B0B0F] text-sm">
                      Product Health: {productHealth.score}/100 · {productHealth.label}
                    </p>
                    {productHealth.recommendations?.map((r: any, i: number) => (
                      <p key={i} className="text-xs text-[#6B6860] mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3 opacity-60" />{r.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 border border-[#E8E6E1] rounded-xl font-semibold text-[#0B0B0F] hover:bg-[#F7F5F0] transition text-sm"
                >
                  ← Edit
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="flex-1 bg-[#7CE25B] text-[#0B0B0F] font-bold py-3 rounded-xl hover:bg-[#6dd44f] disabled:opacity-50 transition text-base flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader className="w-4 h-4 animate-spin" /> Publishing…</> : "Approve & Publish"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`.fade-in{animation:fadeIn .3s ease-out}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </ArtisanLayout>
  );
}
