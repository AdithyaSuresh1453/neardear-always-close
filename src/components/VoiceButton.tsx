import { Mic, MicOff } from "lucide-react";
import { useVoiceCommand } from "@/hooks/useVoiceCommand";

const VoiceButton = () => {
  const { listening, toggle } = useVoiceCommand();

  return (
    <button
      onClick={toggle}
      aria-label={listening ? "Stop listening" : "Start voice command"}
      className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
        listening
          ? "bg-primary glow-primary scale-110"
          : "bg-secondary hover:bg-primary/20 hover:glow-primary"
      }`}
    >
      {listening && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}
      {listening ? (
        <MicOff className="w-6 h-6 text-primary-foreground" />
      ) : (
        <Mic className="w-6 h-6 text-primary" />
      )}
    </button>
  );
};

export default VoiceButton;
