import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Pill, Clock, MapPin, Volume2, Trash2,
  Bell, ToggleLeft, ToggleRight, Edit3, ChevronRight
} from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const alarmSounds = [
  { value: "default", label: "Default Chime" },
  { value: "gentle", label: "Gentle Bell" },
  { value: "urgent", label: "Urgent Beep" },
  { value: "melody", label: "Soft Melody" },
];

const MedicineReminder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    medicine_name: "",
    dosage: "",
    alarm_time: "08:00",
    usual_location: "",
    alarm_sound: "default",
    days_of_week: [0, 1, 2, 3, 4, 5, 6] as number[],
    notes: "",
  });

  const resetForm = () => {
    setForm({
      medicine_name: "", dosage: "", alarm_time: "08:00",
      usual_location: "", alarm_sound: "default",
      days_of_week: [0, 1, 2, 3, 4, 5, 6], notes: "",
    });
    setEditId(null);
  };

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["medicine-reminders"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("medicine_reminders")
        .select("*")
        .order("alarm_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: typeof form & { id?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const payload = { ...values, user_id: user.id };
      if (values.id) {
        const { error } = await supabase
          .from("medicine_reminders")
          .update(payload)
          .eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("medicine_reminders")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-reminders"] });
      toast.success(editId ? "Reminder updated!" : "Reminder added!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("medicine_reminders")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medicine-reminders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("medicine_reminders")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicine-reminders"] });
      toast.info("Reminder deleted");
    },
  });

  const handleEdit = (r: typeof reminders[0]) => {
    setForm({
      medicine_name: r.medicine_name,
      dosage: r.dosage || "",
      alarm_time: r.alarm_time,
      usual_location: r.usual_location || "",
      alarm_sound: r.alarm_sound,
      days_of_week: r.days_of_week,
      notes: r.notes || "",
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.medicine_name.trim() || !form.alarm_time) {
      toast.error("Medicine name and alarm time are required");
      return;
    }
    upsertMutation.mutate({ ...form, ...(editId ? { id: editId } : {}) });
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8 max-w-sm space-y-4">
          <Pill className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-heading text-xl font-bold">Sign in Required</h2>
          <p className="text-sm text-muted-foreground">Please sign in to manage your medicine reminders.</p>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo size="sm" />
          </div>
          <h1 className="font-heading font-semibold text-sm">Medicine Reminders</h1>
        </div>
      </header>

      <main className="container py-8 space-y-8 max-w-3xl">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                <Pill className="w-6 h-6 text-primary" /> Medicine Reminders
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {reminders.length} reminder{reminders.length !== 1 ? "s" : ""} set
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    {editId ? "Edit Reminder" : "New Medicine Reminder"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Medicine Name *</Label>
                    <Input
                      value={form.medicine_name}
                      onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                      placeholder="e.g. Vitamin D"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Dosage</Label>
                      <Input
                        value={form.dosage}
                        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                        placeholder="e.g. 1 tablet"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Alarm Time *</Label>
                      <Input
                        type="time"
                        value={form.alarm_time}
                        onChange={(e) => setForm({ ...form, alarm_time: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Usual Location</Label>
                    <Input
                      value={form.usual_location}
                      onChange={(e) => setForm({ ...form, usual_location: e.target.value })}
                      placeholder="e.g. Kitchen cabinet, Bedroom nightstand"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Alarm Sound</Label>
                    <Select value={form.alarm_sound} onValueChange={(v) => setForm({ ...form, alarm_sound: v })}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alarmSounds.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Days</Label>
                    <div className="flex gap-1.5">
                      {dayLabels.map((d, i) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                            form.days_of_week.includes(i)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Take with food, before bed, etc."
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit} disabled={upsertMutation.isPending}>
                    {upsertMutation.isPending ? "Saving..." : editId ? "Update" : "Add Reminder"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedSection>

        {/* Reminders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <AnimatedSection delay={100}>
            <Card className="glass border-border">
              <CardContent className="py-12 text-center space-y-3">
                <Pill className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No medicine reminders yet</p>
                <p className="text-xs text-muted-foreground">Tap "Add Reminder" to get started</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="space-y-3">
            {reminders.map((r, i) => (
              <AnimatedSection key={r.id} delay={100 + i * 60}>
                <div className={`glass rounded-xl p-4 transition-all border ${
                  r.is_active ? "border-border" : "border-border opacity-50"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      r.is_active ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <Pill className={`w-5 h-5 ${r.is_active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-sm truncate">{r.medicine_name}</h3>
                        {r.dosage && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {r.dosage}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(r.alarm_time)}
                        </span>
                        {r.usual_location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" /> {r.usual_location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> {alarmSounds.find((s) => s.value === r.alarm_sound)?.label}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {dayLabels.map((d, idx) => (
                          <span
                            key={d}
                            className={`text-[9px] w-5 h-5 flex items-center justify-center rounded ${
                              r.days_of_week.includes(idx)
                                ? "bg-primary/20 text-primary font-medium"
                                : "text-muted-foreground/30"
                            }`}
                          >
                            {d[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={r.is_active}
                        onCheckedChange={(v) => toggleMutation.mutate({ id: r.id, is_active: v })}
                      />
                      <button
                        onClick={() => handleEdit(r)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(r.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {r.notes && (
                    <p className="text-xs text-muted-foreground mt-2 ml-16 italic">💊 {r.notes}</p>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicineReminder;
