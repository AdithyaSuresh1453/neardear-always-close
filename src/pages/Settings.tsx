import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, User, Bell, Smartphone, Save, Camera,
  BellRing, BellOff, Vibrate, Mail, Watch, Headphones,
  Wifi, Bluetooth, Trash2
} from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotifPref {
  key: string;
  label: string;
  description: string;
  icon: typeof Bell;
  enabled: boolean;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: "watch" | "earbuds" | "phone";
  connected: boolean;
  battery?: number;
}

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@neardear.com",
    phone: "+1 (555) 123-4567",
  });

  const [notifications, setNotifications] = useState<NotifPref[]>([
    { key: "push", label: "Push Notifications", description: "Get alerts when objects move", icon: BellRing, enabled: true },
    { key: "sound", label: "Sound Alerts", description: "Play sound for urgent alerts", icon: Vibrate, enabled: true },
    { key: "email", label: "Email Digests", description: "Daily summary of activity", icon: Mail, enabled: false },
    { key: "silent", label: "Silent Mode", description: "Only vibrate, no sound", icon: BellOff, enabled: false },
  ]);

  const [devices, setDevices] = useState<ConnectedDevice[]>([
    { id: "d1", name: "Apple Watch Series 9", type: "watch", connected: true, battery: 72 },
    { id: "d2", name: "AirPods Pro 2", type: "earbuds", connected: true, battery: 85 },
    { id: "d3", name: "iPhone 15 Pro", type: "phone", connected: false, battery: 15 },
  ]);

  const deviceIcons = { watch: Watch, earbuds: Headphones, phone: Smartphone };

  const toggleNotif = (key: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const toggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, connected: !d.connected } : d))
    );
    toast.success("Device connection updated");
  };

  const removeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.info("Device removed");
  };

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
          <h1 className="font-heading font-semibold text-sm">Settings</h1>
        </div>
      </header>

      <main className="container py-8 space-y-8 max-w-3xl">
        {/* Profile */}
        <AnimatedSection>
          <Card className="glass border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-heading font-bold text-primary">
                    {profile.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-heading font-semibold">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <Button className="gap-2" onClick={() => toast.success("Profile saved!")}>
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Notifications */}
        <AnimatedSection delay={100}>
          <Card className="glass border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {notifications.map((n) => (
                <div
                  key={n.key}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <n.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={n.enabled}
                    onCheckedChange={() => toggleNotif(n.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Connected Devices */}
        <AnimatedSection delay={200}>
          <Card className="glass border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Bluetooth className="w-5 h-5 text-primary" /> Connected Devices
              </CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Scanning for devices...")}>
                <Wifi className="w-4 h-4" /> Scan
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {devices.map((d) => {
                const DeviceIcon = deviceIcons[d.type];
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      d.connected ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <DeviceIcon className={`w-5 h-5 ${d.connected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${d.connected ? "text-success" : "text-muted-foreground"}`}>
                          {d.connected ? "Connected" : "Disconnected"}
                        </span>
                        {d.battery !== undefined && (
                          <span className={`text-xs ${
                            d.battery > 50 ? "text-success" : d.battery > 20 ? "text-warning" : "text-destructive"
                          }`}>
                            {d.battery}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={d.connected} onCheckedChange={() => toggleDevice(d.id)} />
                      <Button variant="ghost" size="icon" onClick={() => removeDevice(d.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {devices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No devices connected. Tap Scan to find nearby devices.</p>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default Settings;
