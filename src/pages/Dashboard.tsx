import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Key, Wallet, CreditCard, Smartphone, Plus, MapPin,
  Bell, Clock, Mic, Search, LogOut, ChevronRight, AlertTriangle,
  Navigation, Shield, Phone, Settings, Pill, Target, ScanSearch
} from "lucide-react";
import MedicineReminderWidget from "@/components/MedicineReminderWidget";
import Logo from "@/components/Logo";
import VoiceButton from "@/components/VoiceButton";
import AnimatedSection from "@/components/AnimatedSection";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const iconMap: Record<string, typeof Key> = { keys: Key, wallet: Wallet, "id card": CreditCard, phone: Smartphone };

interface TrackedObject {
  id: string;
  name: string;
  type: string;
  location: string;
  room: string;
  lastSeen: string;
  status: "safe" | "warning" | "lost";
}

const initialObjects: TrackedObject[] = [
  { id: "1", name: "House Keys", type: "keys", location: "Living Room - Shelf 2", room: "Room 1", lastSeen: "2 min ago", status: "safe" },
  { id: "2", name: "Leather Wallet", type: "wallet", location: "Bedroom - Nightstand", room: "Room 3", lastSeen: "15 min ago", status: "safe" },
  { id: "3", name: "National ID", type: "id card", location: "Office - Drawer 1", room: "Room 2", lastSeen: "1 hr ago", status: "warning" },
  { id: "4", name: "iPhone 15", type: "phone", location: "Kitchen Counter", room: "Room 4", lastSeen: "Just now", status: "safe" },
];

const alerts = [
  { id: "a1", text: "Keys moved to unusual location", time: "5 min ago", type: "warning" as const },
  { id: "a2", text: "Wallet not detected — may have left home", time: "12 min ago", type: "alert" as const },
  { id: "a3", text: "Phone battery low — save location", time: "30 min ago", type: "info" as const },
];

const statusColors = {
  safe: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  lost: "bg-destructive/20 text-destructive",
};

const Dashboard = () => {
  const [objects] = useState(initialObjects);
  const [search, setSearch] = useState("");

  const filtered = objects.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <VoiceButton onResult={(t) => toast.info(`Voice: "${t}"`)} />
            <Link to="/settings" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Link>
            <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Greeting */}
        <AnimatedSection>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Good Morning, Alex 👋</h1>
              <p className="text-sm text-muted-foreground">All your items are accounted for</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary border-border w-56"
                />
              </div>
              <button
                onClick={() => toast.info("Register new object — coming soon!")}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tracked Items", value: objects.length, color: "text-primary" },
              { label: "Safe", value: objects.filter(o => o.status === "safe").length, color: "text-success" },
              { label: "Warnings", value: objects.filter(o => o.status === "warning").length, color: "text-warning" },
              { label: "Lost", value: objects.filter(o => o.status === "lost").length, color: "text-destructive" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Objects */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatedSection delay={200}>
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Your Items
              </h2>
            </AnimatedSection>
            <div className="space-y-3">
              {filtered.map((obj, i) => {
                const Icon = iconMap[obj.type] || Key;
                return (
                  <AnimatedSection key={obj.id} delay={250 + i * 80}>
                    <div className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-semibold text-sm truncate">{obj.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[obj.status]}`}>
                            {obj.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{obj.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {obj.lastSeen}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-4">
            <AnimatedSection delay={200}>
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" /> Smart Alerts
              </h2>
            </AnimatedSection>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <AnimatedSection key={a.id} delay={300 + i * 100}>
                  <div className="glass rounded-xl p-4 hover:border-accent/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.type === "alert" ? "text-destructive" : a.type === "warning" ? "text-warning" : "text-primary"}`} />
                      <div>
                        <p className="text-sm font-medium">{a.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Quick Voice */}
            <AnimatedSection delay={600}>
              <div className="glass rounded-xl p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Try saying</p>
                <p className="font-heading font-semibold text-primary">"Where are my keys?"</p>
                <div className="flex justify-center">
                  <VoiceButton onResult={(t) => toast.success(`Found: Living Room - Shelf 2`)} />
                </div>
              </div>
            </AnimatedSection>

            {/* Medicine Widget */}
            <AnimatedSection delay={620}>
              <MedicineReminderWidget />
            </AnimatedSection>

            {/* Quick Nav */}
            <AnimatedSection delay={650}>
              <div className="grid grid-cols-5 gap-3">
                <Link to="/phone-recovery" className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors group">
                  <Phone className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-medium">Phone</p>
                </Link>
                <Link to="/home-map" className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors group">
                  <Navigation className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-xs font-medium">Home Map</p>
                </Link>
                <Link to="/medicine" className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors group">
                  <Pill className="w-5 h-5 text-success mx-auto mb-2" />
                  <p className="text-xs font-medium">Medicine</p>
                </Link>
                <Link to="/geofencing" className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors group">
                  <Target className="w-5 h-5 text-warning mx-auto mb-2" />
                  <p className="text-xs font-medium">Geofence</p>
                </Link>
                <Link to="/admin" className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors group">
                  <Shield className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs font-medium">Admin</p>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
