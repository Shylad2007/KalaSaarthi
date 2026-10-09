import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, UploadCloud, CheckCircle, ArrowRight, ArrowLeft, Image as ImageIcon, Sparkles, Tag, DollarSign, X, AlertTriangle, Info, Activity, Square, Loader } from "lucide-react";
import { apiCall, uploadCall } from "../../api";
import ArtisanLayout from "../../components/ArtisanLayout";

const STEPS = ["Photo", "Describe", "Catalog", "Pricing", "Publish"];

export default function AddProduct() {
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
  const isUploadingRef = useRef(false); // prevent duplicate submissions

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }, []);

  const MIN_RECORDING_MS = 1500; // minimum 1.5 seconds — prevents near-silent blobs
  const MIN_BLOB_BYTES = 2048;   // minimum meaningful audio payload

  const toggleRecording = async () => {
    // Stop if already recording
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    // Don't start a new recording while transcription is in progress
    if (transcribing || isUploadingRef.current) return;

    setRecordingError("");
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer opus/webm for compact size; fall back to browser default
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

        // Guard: if recording was too short, it's almost certainly empty
        if (durationMs < MIN_RECORDING_MS) {
          setRecordingError("Recording was too short. Hold the button for at least 2 seconds while speaking.");
          return;
        }

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        // Guard: check blob size before wasting an API call
        if (blob.size < MIN_BLOB_BYTES) {
          setRecordingError("No audio was captured. Check your microphone and try again.");
          return;
        }

        // Prevent duplicate uploads
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
            // Append to description, separated by a space if description already has text
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

      recorder.start(1000); // collect data every second
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

  const stepIcons = [<ImageIcon size={16}/>, <Mic size={16}/>, <Tag size={16}/>, <DollarSign size={16}/>, <CheckCircle size={16}/>];

  return (
    <ArtisanLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/artisan/products")} className="mb-6 flex items-center text-gray-500 hover:text-primary transition font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalogue
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step bar */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between">
              {STEPS.map((label, i) => (
                <div key={i} className={`flex items-center space-x-2 ${step > i ? "text-primary" : "text-gray-400"} ${step === i + 1 ? "font-bold" : ""}`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all
                    ${step > i ? "bg-primary text-white" : step === i+1 ? "ring-2 ring-primary ring-offset-2 bg-white text-primary" : "bg-gray-200 text-gray-400"}`}>
                    {step > i ? <CheckCircle size={14}/> : stepIcons[i]}
                  </div>
                  <span className="hidden md:inline text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 min-h-[500px] flex flex-col justify-center">
            {/* Step 1 - Photo */}
            {step === 1 && (
              <div className="max-w-xl mx-auto w-full text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Add Product Photo</h2>
                <p className="text-gray-500 mb-8">A clear photo builds trust with buyers and helps the AI understand your product better.</p>

                <div className={`border-2 ${preview ? "border-primary/30 bg-primary/5" : "border-dashed border-gray-300 hover:border-primary/40 hover:bg-green-50/30"} rounded-2xl p-8 mb-6 transition cursor-pointer`}>
                  {!preview ? (
                    <label className="cursor-pointer block">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-lg font-bold text-primary">Click to upload photo</span>
                      <p className="text-gray-400 mt-2 text-sm">JPG, PNG up to 10MB</p>
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        if (e.target.files?.[0]) { setFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); setImageAnalysis(null); }
                      }} />
                    </label>
                  ) : (
                    <div className="relative">
                      <button onClick={() => { setPreview(""); setFile(null); setImageAnalysis(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 z-10">
                        <X size={14}/>
                      </button>
                      <img src={preview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow object-contain" />
                    </div>
                  )}
                </div>

                {imageAnalysis && (
                  <div className={`mb-6 p-4 rounded-xl text-left ${imageAnalysis.needs_attention ? "bg-orange-50 border border-orange-200" : "bg-green-50 border border-green-200"}`}>
                    <div className="flex items-start">
                      {imageAnalysis.needs_attention ? <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"/> : <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"/>}
                      <div>
                        <p className={`font-bold text-sm ${imageAnalysis.needs_attention ? "text-orange-800" : "text-green-800"}`}>
                          Image Quality Score: {imageAnalysis.score}/100
                        </p>
                        <p className={`text-sm mt-1 ${imageAnalysis.needs_attention ? "text-orange-700" : "text-green-700"}`}>{imageAnalysis.recommendation}</p>
                        {imageAnalysis.needs_attention && (
                          <button onClick={() => setStep(2)} className="mt-2 text-xs font-bold text-orange-800 underline">Continue anyway →</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(!imageAnalysis || !imageAnalysis.needs_attention) && (
                  <button onClick={handleUploadImage} disabled={!file || loading} className="w-full sm:w-auto mx-auto bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-secondary disabled:opacity-50 flex items-center justify-center shadow-lg shadow-primary/25 transition">
                    {loading ? <><Loader className="w-5 h-5 animate-spin mr-2"/>Uploading...</> : <>Upload & Continue <ArrowRight className="ml-2 w-5 h-5"/></>}
                  </button>
                )}
              </div>
            )}

            {/* Step 2 - Describe */}
            {step === 2 && (
              <div className="max-w-xl mx-auto w-full">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Describe Your Craft</h2>
                <p className="text-gray-500 mb-6 text-center">Speak or type — tell us about the materials, process, and story behind this product.</p>

                {/* Microphone */}
                <div className={`p-6 rounded-2xl mb-4 text-center border transition-all ${isRecording ? "bg-red-50 border-red-200" : transcribing ? "bg-blue-50 border-blue-200" : "bg-primary/5 border-primary/20"}`}>
                  <button
                    onClick={toggleRecording}
                    disabled={transcribing || isUploadingRef.current}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md transition-all
                      ${isRecording ? "bg-red-500 text-white scale-110 animate-pulse" : "bg-white text-primary border border-gray-200 hover:scale-105"}
                      ${transcribing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {transcribing ? <Loader className="w-8 h-8 animate-spin text-blue-600"/> : isRecording ? <Square className="w-8 h-8"/> : <Mic className="w-8 h-8"/>}
                  </button>
                  <p className={`font-bold ${isRecording ? "text-red-700" : transcribing ? "text-blue-700" : "text-gray-800"}`}>
                    {isRecording ? "Recording… tap to stop" : transcribing ? "Transcribing — please wait…" : "Tap microphone to speak"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRecording ? "Speak clearly, hold for at least 2 seconds" : "Supports Hindi & English"}
                  </p>
                </div>

                {/* Error message */}
                {recordingError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-red-800 font-medium text-sm">{recordingError}</p>
                      <button onClick={() => setRecordingError("")} className="text-xs text-red-600 underline mt-1">Dismiss</button>
                    </div>
                  </div>
                )}

                {/* Last transcript — shows what was just captured so artisan can verify */}
                {transcript && !isRecording && !transcribing && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5"/>Transcript captured (added to description below)
                    </p>
                    <p className="text-green-900 text-sm italic">"{transcript}"</p>
                    <p className="text-xs text-green-600 mt-1">Review and edit the description below before generating the catalogue.</p>
                  </div>
                )}

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or type below</span></div>
                </div>

                <textarea
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 h-36 focus:border-primary focus:outline-none resize-none text-gray-800 placeholder-gray-400 text-base mb-2 transition"
                  placeholder="E.g. This is a hand-woven silk saree made from pure mulberry silk. It took about 3 weeks to weave on a traditional loom..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <p className="text-xs text-gray-400 mb-6">
                  The AI catalogue will only use what you write here. Nothing will be added or changed without your approval.
                </p>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition">Back</button>
                  <button onClick={handleGenerateCatalog} disabled={loading || !description.trim() || transcribing} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary disabled:opacity-50 flex items-center shadow-lg shadow-primary/25 transition">
                    {loading ? <><Loader className="w-4 h-4 animate-spin mr-2"/>Generating...</> : <>Generate Catalog <Sparkles className="ml-2 w-4 h-4"/></>}
                  </button>
                </div>
              </div>
            )}


            {/* Step 3 - Catalog Review */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto w-full">
                <div className="text-center mb-8">
                  <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                    <Sparkles className="w-4 h-4 mr-2"/>AI Generated Catalog
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900">Review & Edit</h2>
                  <p className="text-gray-500 text-sm mt-1">These details were crafted from your description. Edit anything before proceeding.</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-5 border border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
                    <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 font-bold text-lg focus:border-primary focus:outline-none bg-white" value={catalog.name || ""} onChange={e => setCatalog({...catalog, name: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28 focus:border-primary focus:outline-none bg-white resize-none text-gray-700" value={catalog.description || ""} onChange={e => setCatalog({...catalog, description: e.target.value})}/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-primary focus:outline-none bg-white text-gray-700" value={catalog.category || ""} onChange={e => setCatalog({...catalog, category: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Materials</label>
                      <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-primary focus:outline-none bg-white text-gray-700" value={catalog.materials || ""} onChange={e => setCatalog({...catalog, materials: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                      <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-primary focus:outline-none bg-white text-gray-700" value={catalog.color || ""} onChange={e => setCatalog({...catalog, color: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                      <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-primary focus:outline-none bg-white text-gray-700" value={catalog.tags || ""} onChange={e => setCatalog({...catalog, tags: e.target.value})}/>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition">Back</button>
                  <button onClick={handlePricing} disabled={loading || !catalog.name} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary disabled:opacity-50 flex items-center shadow-lg shadow-primary/25 transition">
                    {loading ? <><Loader className="w-4 h-4 animate-spin mr-2"/>Calculating...</> : <>Get Price Recommendation <ArrowRight className="ml-2 w-4 h-4"/></>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 - Pricing */}
            {step === 4 && (
              <div className="max-w-xl mx-auto w-full">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Smart Pricing</h2>
                <p className="text-gray-500 mb-6 text-center">Earn what your craft is worth.</p>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 text-center relative overflow-hidden">
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center"><Sparkles size={10} className="mr-1"/>AI Suggested</span>
                  <p className="text-primary font-bold text-sm uppercase tracking-wider mb-2">Recommended Price</p>
                  <p className="text-5xl font-extrabold text-gray-900 mb-3">₹{pricing.recommended}</p>
                  <p className="text-gray-500 text-sm mb-4">Market Range: ₹{pricing.suggested_min} – ₹{pricing.suggested_max}</p>
                  <div className="bg-white/70 rounded-xl p-4 text-left text-sm text-gray-700 border border-primary/10">
                    <strong>Explanation: </strong>{pricing.explanation}
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-6">
                  <label className="block font-bold text-gray-900 mb-3">Set Your Final Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">₹</span>
                    <input
                      type="number"
                      className="w-full pl-10 border-2 border-gray-200 rounded-xl p-4 text-2xl font-bold text-gray-900 focus:border-primary focus:outline-none transition"
                      value={finalPrice}
                      onChange={e => setFinalPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition">Back</button>
                  <button onClick={() => setStep(5)} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary flex items-center shadow-lg shadow-primary/25 transition">
                    Review & Publish <ArrowRight className="ml-2 w-4 h-4"/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 - Publish */}
            {step === 5 && (
              <div className="max-w-xl mx-auto w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600"/>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Ready to Publish!</h2>
                <p className="text-gray-500 mb-8">Your product has been cataloged and priced. Publish it to make it visible to buyers.</p>

                <div className="bg-gray-50 rounded-2xl p-5 mb-6 flex items-center text-left border border-gray-100">
                  {preview && <img src={preview} alt="" className="w-20 h-20 object-cover rounded-xl mr-4 shadow-sm flex-shrink-0"/>}
                  <div>
                    <h4 className="font-extrabold text-gray-900">{catalog.name}</h4>
                    <p className="text-gray-500 text-sm">{catalog.category}</p>
                    <p className="text-primary font-extrabold text-xl mt-1">₹{finalPrice}</p>
                  </div>
                </div>

                {productHealth && (
                  <div className={`mb-6 p-4 rounded-2xl border text-left flex items-start ${productHealth.score >= 80 ? "bg-green-50 border-green-200" : productHealth.score >= 60 ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"}`}>
                    <Activity className={`w-6 h-6 mr-3 mt-0.5 flex-shrink-0 ${productHealth.score >= 80 ? "text-green-600" : productHealth.score >= 60 ? "text-blue-600" : "text-yellow-600"}`}/>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Product Health: {productHealth.score}/100 • {productHealth.label}</p>
                      {productHealth.recommendations?.map((r: any, i: number) => (
                        <p key={i} className="text-xs text-gray-600 mt-1 flex items-center"><Info className="w-3 h-3 mr-1 opacity-60"/>{r.text}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={() => setStep(4)} className="px-8 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">Edit</button>
                  <button onClick={handlePublish} disabled={loading} className="bg-primary text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-secondary disabled:opacity-50 shadow-xl shadow-primary/25 transition">
                    {loading ? "Publishing…" : "Approve & Publish"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.fade-in{animation:fadeIn .3s ease-out}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </ArtisanLayout>
  );
}
