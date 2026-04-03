import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface VoiceCommandResult {
  query: string;
  objectName: string;
  location: string | null;
  lastSeen: string | null;
  found: boolean;
}

export function useVoiceCommand() {
  const { user } = useAuth();
  const [listening, setListening] = useState(false);
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null);
  const recognitionRef = useRef<any>(null);

  const extractObjectName = (text: string): string | null => {
    const lower = text.toLowerCase().trim();
    // Match patterns like "where is my keys", "where are my wallet", "find my phone"
    const patterns = [
      /where (?:is|are) (?:my |the )?(.+?)(?:\?|$)/,
      /find (?:my |the )?(.+?)(?:\?|$)/,
      /locate (?:my |the )?(.+?)(?:\?|$)/,
      /search (?:for )?(?:my |the )?(.+?)(?:\?|$)/,
      /look (?:for )?(?:my |the )?(.+?)(?:\?|$)/,
    ];
    for (const p of patterns) {
      const match = lower.match(p);
      if (match) return match[1].trim();
    }
    // Fallback: just use the whole text as object name
    return lower;
  };

  const searchObject = useCallback(
    async (objectName: string): Promise<VoiceCommandResult> => {
      const result: VoiceCommandResult = {
        query: objectName,
        objectName,
        location: null,
        lastSeen: null,
        found: false,
      };

      // Search in database
      if (user) {
        const { data } = await supabase
          .from("detected_objects")
          .select("*")
          .eq("user_id", user.id)
          .ilike("name", `%${objectName}%`)
          .order("last_seen_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          result.found = true;
          result.location = data[0].location || "Unknown location";
          result.lastSeen = new Date(data[0].last_seen_at).toLocaleString();
          return result;
        }
      }

      // Fallback: search static objects
      const staticItems: Record<string, { location: string; lastSeen: string }> = {
        keys: { location: "Living Room - Shelf 2", lastSeen: "2 min ago" },
        wallet: { location: "Bedroom - Nightstand", lastSeen: "15 min ago" },
        "id card": { location: "Office - Drawer 1", lastSeen: "1 hr ago" },
        phone: { location: "Kitchen Counter", lastSeen: "Just now" },
      };

      for (const [key, val] of Object.entries(staticItems)) {
        if (key.includes(objectName) || objectName.includes(key)) {
          result.found = true;
          result.location = val.location;
          result.lastSeen = val.lastSeen;
          return result;
        }
      }

      return result;
    },
    [user]
  );

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = async (event: any) => {
      const transcript: string = event.results[0][0].transcript;
      setListening(false);
      toast.info(`Heard: "${transcript}"`);

      const objectName = extractObjectName(transcript);
      if (!objectName) {
        toast.error("Couldn't understand the object name. Try: 'Where is my keys?'");
        return;
      }

      const result = await searchObject(objectName);
      setLastResult(result);

      if (result.found) {
        toast.success(`📍 ${result.objectName} found at ${result.location} (last seen: ${result.lastSeen})`, {
          duration: 6000,
        });
        // Speak the result
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Your ${result.objectName} is at ${result.location}. Last seen ${result.lastSeen}.`
          );
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        toast.error(`❌ "${result.objectName}" not found. Try detecting it with the camera first.`, {
          duration: 5000,
        });
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(
            `Sorry, I couldn't find ${result.objectName}. Try detecting it with the camera first.`
          );
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      } else if (event.error !== "aborted") {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  }, [searchObject]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  return { listening, toggle, lastResult };
}
