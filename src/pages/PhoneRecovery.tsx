import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, Volume2, Lock, Clock, ExternalLink,
  Shield, Smartphone, History, AlertTriangle
} from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface LocationEntry {
  id: string;
  address: string;
  time: string;
  coords: { lat: number; lng: number };
}

const locationHistory: LocationEntry[] = [
  { id: "1", address: "Home — Living Room", time: "2 min ago", coords: { lat: 28.6139, lng: 77.209 } },
  { id: "2", address: "Office — Desk 4B", time: "3 hrs ago", coords: { lat: 28.6329, lng: 77.2195 } },
  { id: "3", address: "Coffee Shop — MG Road", time: "5 hrs ago", coords: { lat: 28.6271, lng: 77.2219 } },
  { id: "4", address: "Gym — Sector 15", time: "8 hrs ago", coords: { lat: 28.585, lng: 77.31 } },
];

const PhoneRecovery = () => {
  const [alarmActive, setAlarmActive] = useState(false);
  const [locked, setLocked] = useState(false);

  const triggerAlarm = () => {
    setAlarmActive(!alarmActive);
    toast[alarmActive ? "info" : "warning"](
      alarmActive ? "Remote alarm stopped" : "Remote alarm triggered! Phone is ringing at max volume."
    );
  };

  const emergencyLock = () => {
    setLocked(true);
    toast.success("Phone locked remotely. All data encrypted and secured.");
  };

  const openInMaps = (coords: { lat: number; lng: number }) => {
    window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, "_blank");
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
          <h1 className="font-heading font-semibold text-sm">Phone Recovery</h1>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Last Known Location Map */}
        <AnimatedSection>
          <Card className="glass border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Last Known Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-secondary">
                {/* Simulated map */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                      linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px"
                  }} />
                  {/* Pin */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
                        <Smartphone className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="w-3 h-3 bg-primary rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-2">
                  <p className="text-xs font-medium">Home — Living Room</p>
                  <p className="text-[10px] text-muted-foreground">Last seen 2 min ago</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => openInMaps(locationHistory[0].coords)}
              >
                <ExternalLink className="w-4 h-4" /> View in Google Maps
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Action Buttons */}
        <AnimatedSection delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={triggerAlarm}
              className={`glass rounded-xl p-6 text-center space-y-3 transition-all border ${
                alarmActive
                  ? "border-destructive bg-destructive/10"
                  : "border-border hover:border-warning/40"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                alarmActive ? "bg-destructive/20" : "bg-warning/10"
              }`}>
                <Volume2 className={`w-7 h-7 ${alarmActive ? "text-destructive animate-pulse" : "text-warning"}`} />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">
                  {alarmActive ? "Stop Alarm" : "Remote Alarm"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alarmActive ? "Alarm is ringing..." : "Ring at max volume"}
                </p>
              </div>
            </button>

            <button
              onClick={emergencyLock}
              disabled={locked}
              className={`glass rounded-xl p-6 text-center space-y-3 transition-all border ${
                locked
                  ? "border-success bg-success/10 cursor-default"
                  : "border-border hover:border-destructive/40"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                locked ? "bg-success/20" : "bg-destructive/10"
              }`}>
                <Lock className={`w-7 h-7 ${locked ? "text-success" : "text-destructive"}`} />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">
                  {locked ? "Phone Locked" : "Emergency Lock"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {locked ? "Data is encrypted" : "Lock & encrypt remotely"}
                </p>
              </div>
            </button>

            <button
              onClick={() => toast.info("Secondary device verification required")}
              className="glass rounded-xl p-6 text-center space-y-3 transition-all border border-border hover:border-primary/40"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">Secure Access</p>
                <p className="text-xs text-muted-foreground mt-1">Verify via 2nd device</p>
              </div>
            </button>
          </div>
        </AnimatedSection>

        {/* Location History Timeline */}
        <AnimatedSection delay={200}>
          <Card className="glass border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-accent" /> Location History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {locationHistory.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                    onClick={() => openInMaps(entry.coords)}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary shadow-md shadow-primary/40" : "bg-muted-foreground/30"}`} />
                      {i < locationHistory.length - 1 && (
                        <div className="w-px h-8 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.address}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {entry.time}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default PhoneRecovery;
