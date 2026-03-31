import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, ScanSearch, ArrowLeft, Loader2, Zap, Eye, RefreshCw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import Logo from "@/components/Logo";

interface DetectedObject {
  name: string;
  confidence: number;
  size: "tiny" | "small" | "medium" | "large";
  location: string;
}

const sizeColors: Record<string, string> = {
  tiny: "bg-accent/20 text-accent border-accent/30",
  small: "bg-primary/20 text-primary border-primary/30",
  medium: "bg-success/20 text-success border-success/30",
  large: "bg-warning/20 text-warning border-warning/30",
};

const CameraDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(false);
  const autoDetectRef = useRef(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setCapturedImage(null);
        setObjects([]);
      }
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setAutoDetect(false);
    autoDetectRef.current = false;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const detectObjects = useCallback(async (imageData?: string) => {
    const image = imageData || captureFrame();
    if (!image) return;
    setCapturedImage(image);
    setDetecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-objects", {
        body: { image },
      });
      if (error) throw error;
      const detected: DetectedObject[] = data?.objects || [];
      setObjects(detected);
      if (detected.length > 0) {
        toast.success(`Detected ${detected.length} object${detected.length > 1 ? "s" : ""}!`);
      } else {
        toast.info("No objects detected. Try a different angle.");
      }
    } catch (e: any) {
      toast.error(e.message || "Detection failed");
    } finally {
      setDetecting(false);
    }
  }, [captureFrame]);

  // Auto-detect loop
  useEffect(() => {
    autoDetectRef.current = autoDetect;
    if (!autoDetect || !streaming) return;
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!autoDetectRef.current) return;
      detectObjects();
      timeout = setTimeout(loop, 5000);
    };
    loop();
    return () => clearTimeout(timeout);
  }, [autoDetect, streaming, detectObjects]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Logo size="sm" />
          </div>
          <h1 className="font-heading font-bold text-sm flex items-center gap-2">
            <ScanSearch className="w-4 h-4 text-primary" /> Object Detection
          </h1>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-4xl">
        {/* Camera Feed */}
        <AnimatedSection>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="relative aspect-video bg-secondary/50 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${streaming ? "block" : "hidden"}`}
              />
              {capturedImage && !streaming && (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              )}
              {!streaming && !capturedImage && (
                <div className="text-center space-y-4 p-8">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Start your camera to detect objects</p>
                </div>
              )}
              {detecting && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <div className="flex items-center gap-3 glass px-6 py-3 rounded-full">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">Analyzing...</span>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="p-4 flex flex-wrap items-center justify-center gap-3">
              {!streaming ? (
                <button onClick={startCamera} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={() => detectObjects()}
                    disabled={detecting}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4" /> Detect Now
                  </button>
                  <button
                    onClick={() => setAutoDetect((p) => !p)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      autoDetect
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-secondary text-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    <Zap className="w-4 h-4" /> {autoDetect ? "Auto ON" : "Auto OFF"}
                  </button>
                  <button onClick={stopCamera} className="flex items-center gap-2 bg-destructive/10 text-destructive px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-destructive/20 transition-all">
                    Stop
                  </button>
                </>
              )}
              {capturedImage && !streaming && (
                <button onClick={startCamera} className="flex items-center gap-2 bg-secondary text-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-all border border-border">
                  <RefreshCw className="w-4 h-4" /> New Scan
                </button>
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* Detected Objects */}
        {objects.length > 0 && (
          <AnimatedSection delay={100}>
            <h2 className="font-heading text-lg font-semibold flex items-center gap-2 mb-4">
              <ScanSearch className="w-5 h-5 text-primary" />
              Detected Objects ({objects.length})
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {objects.map((obj, i) => (
                <AnimatedSection key={`${obj.name}-${i}`} delay={150 + i * 60}>
                  <div className="glass rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-sm capitalize truncate">{obj.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">📍 {obj.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${sizeColors[obj.size]}`}>
                          {obj.size}
                        </span>
                        <span className="text-xs text-muted-foreground">{obj.confidence}%</span>
                      </div>
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${obj.confidence}%` }}
                      />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        )}
      </main>
    </div>
  );
};

export default CameraDetection;
