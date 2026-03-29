import { Mic } from "lucide-react";
import { useState } from "react";

const VoiceButton = ({ onResult }: { onResult?: (text: string) => void }) => {
  const [listening, setListening] = useState(false);

  const toggle = () => {
    setListening((l) => {
      if (!l) {
        // Simulate voice listening
        setTimeout(() => {
          setListening(false);
          onResult?.("Where are my keys?");
        }, 2000);
      }
      return !l;
    });
  };

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
      <Mic className={`w-6 h-6 ${listening ? "text-primary-foreground" : "text-primary"}`} />
    </button>
  );
};

export default VoiceButton;
