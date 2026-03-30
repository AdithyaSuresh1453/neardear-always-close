import { Pill, Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const MedicineReminderWidget = () => {
  const { user } = useAuth();

  const { data: reminders = [] } = useQuery({
    queryKey: ["medicine-reminders"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("medicine_reminders")
        .select("*")
        .eq("is_active", true)
        .order("alarm_time", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" /> Medicine Reminders
        </h3>
        <Link to="/medicine" className="text-xs text-primary hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {reminders.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">No active reminders</p>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{r.medicine_name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {formatTime(r.alarm_time)}
                  </span>
                  {r.usual_location && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5" /> {r.usual_location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/medicine">
        <button className="w-full text-xs text-center py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">
          + Add Medicine Reminder
        </button>
      </Link>
    </div>
  );
};

export default MedicineReminderWidget;
