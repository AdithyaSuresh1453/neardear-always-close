import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, MapPin, Trash2, Shield, Wifi, Bell,
  AlertTriangle, Clock, Navigation, Target, Radio
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
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Geofencing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius_meters: "100",
    essential_items: "" as string,
  });

  const resetForm = () => {
    setForm({ name: "", latitude: "", longitude: "", radius_meters: "100", essential_items: "" });
  };

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["geofence-zones"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("geofence_zones")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["geofence-alerts"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("geofence_alerts")
        .select("*, geofence_zones(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const items = form.essential_items
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase.from("geofence_zones").insert({
        user_id: user.id,
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        radius_meters: parseInt(form.radius_meters),
        essential_items: items,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      toast.success("Geofence zone created!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("geofence_zones")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["geofence-zones"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("geofence_zones")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["geofence-zones"] });
      toast.info("Zone deleted");
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location captured!");
      },
      () => toast.error("Failed to get location")
    );
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.latitude || !form.longitude) {
      toast.error("Name and coordinates are required");
      return;
    }
    createMutation.mutate();
  };

  // Simulate geofence check
  const simulateLeaving = (zone: typeof zones[0]) => {
    const missing = zone.essential_items.slice(0, Math.max(1, Math.floor(Math.random() * zone.essential_items.length + 1)));
    toast.warning(
      `⚠️ Leaving "${zone.name}" without: ${missing.join(", ")}`,
      { duration: 6000, description: "Geofence alert triggered" }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8 max-w-sm space-y-4">
          <Target className="w-12 h-12 text-primary mx-auto" />
          <h2 className="font-heading text-xl font-bold">Sign in Required</h2>
          <p className="text-sm text-muted-foreground">Please sign in to manage geofence zones.</p>
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
          <h1 className="font-heading font-semibold text-sm">Geofencing</h1>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" /> Geofence Zones
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Get alerts when leaving without essential items
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">New Geofence Zone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Zone Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Home, Office"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Latitude *</Label>
                      <Input
                        value={form.latitude}
                        onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                        placeholder="28.6139"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Longitude *</Label>
                      <Input
                        value={form.longitude}
                        onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                        placeholder="77.2090"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 w-full" onClick={getCurrentLocation}>
                    <Navigation className="w-4 h-4" /> Use Current Location
                  </Button>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Radius (meters)</Label>
                    <Input
                      type="number"
                      value={form.radius_meters}
                      onChange={(e) => setForm({ ...form, radius_meters: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Essential Items (comma separated)</Label>
                    <Input
                      value={form.essential_items}
                      onChange={(e) => setForm({ ...form, essential_items: e.target.value })}
                      placeholder="Keys, Wallet, Phone, ID Card"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Zone"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Zones */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatedSection delay={100}>
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" /> Active Zones
              </h2>
            </AnimatedSection>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : zones.length === 0 ? (
              <AnimatedSection delay={150}>
                <Card className="glass border-border">
                  <CardContent className="py-12 text-center space-y-3">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No geofence zones yet</p>
                    <p className="text-xs text-muted-foreground">Add a zone to start getting alerts</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : (
              <div className="space-y-3">
                {zones.map((zone, i) => (
                  <AnimatedSection key={zone.id} delay={150 + i * 60}>
                    <div className={`glass rounded-xl p-4 border transition-all ${
                      zone.is_active ? "border-border" : "border-border opacity-50"
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          zone.is_active ? "bg-primary/10" : "bg-secondary"
                        }`}>
                          <MapPin className={`w-5 h-5 ${zone.is_active ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-sm">{zone.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)} • {zone.radius_meters}m radius
                          </p>
                          {zone.essential_items.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {zone.essential_items.map((item) => (
                                <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => simulateLeaving(zone)}
                          >
                            <Bell className="w-3 h-3" /> Test
                          </Button>
                          <Switch
                            checked={zone.is_active}
                            onCheckedChange={(v) => toggleMutation.mutate({ id: zone.id, is_active: v })}
                          />
                          <button
                            onClick={() => deleteMutation.mutate(zone.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>

          {/* Alert History */}
          <div className="space-y-4">
            <AnimatedSection delay={200}>
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Alert History
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={250}>
              <Card className="glass border-border">
                <CardContent className="py-4">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No alerts yet</p>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map((a: any) => (
                        <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium">
                              Left {a.geofence_zones?.name || "zone"} without: {a.missing_items.join(", ")}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(a.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection delay={300}>
              <Card className="glass border-border">
                <CardContent className="py-4 space-y-3">
                  <h3 className="font-heading text-sm font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" /> How it works
                  </h3>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Wifi className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                      Monitors your location using GPS/WiFi
                    </li>
                    <li className="flex items-start gap-2">
                      <Radio className="w-3 h-3 mt-0.5 text-accent shrink-0" />
                      Detects when you leave a geofenced area
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-3 h-3 mt-0.5 text-warning shrink-0" />
                      Sends toast alert if essential items are missing
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Geofencing;
