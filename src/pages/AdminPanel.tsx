import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import {
  ArrowLeft, Users, Activity, BarChart3, Shield, Search,
  Eye, Ban, CheckCircle, Clock, Smartphone, MapPin
} from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  objects: number;
  lastActive: string;
  status: "active" | "suspended";
}

interface LogEntry {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "info" | "warning" | "error";
}

const mockUsers: User[] = [
  { id: "u1", name: "Alex Johnson", email: "alex@email.com", objects: 4, lastActive: "2 min ago", status: "active" },
  { id: "u2", name: "Sara Chen", email: "sara@email.com", objects: 7, lastActive: "1 hr ago", status: "active" },
  { id: "u3", name: "Mike Ross", email: "mike@email.com", objects: 2, lastActive: "3 days ago", status: "suspended" },
  { id: "u4", name: "Priya Patel", email: "priya@email.com", objects: 5, lastActive: "15 min ago", status: "active" },
];

const mockLogs: LogEntry[] = [
  { id: "l1", action: "User login", user: "Alex Johnson", time: "2 min ago", type: "info" },
  { id: "l2", action: "Geofence alert triggered", user: "Sara Chen", time: "20 min ago", type: "warning" },
  { id: "l3", action: "Emergency lock activated", user: "Mike Ross", time: "1 hr ago", type: "error" },
  { id: "l4", action: "New object registered", user: "Priya Patel", time: "2 hrs ago", type: "info" },
  { id: "l5", action: "Voice command processed", user: "Alex Johnson", time: "3 hrs ago", type: "info" },
];

const stats = [
  { label: "Total Users", value: "1,247", icon: Users, color: "text-primary" },
  { label: "Active Sessions", value: "89", icon: Activity, color: "text-success" },
  { label: "Objects Tracked", value: "5,832", icon: Smartphone, color: "text-accent" },
  { label: "Geofence Events", value: "156", icon: MapPin, color: "text-warning" },
];

const logTypeColors = {
  info: "text-primary",
  warning: "text-warning",
  error: "text-destructive",
};

const AdminPanel = () => {
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "analytics">("users");

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { key: "users" as const, label: "Users", icon: Users },
    { key: "logs" as const, label: "System Logs", icon: Activity },
    { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

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
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="font-heading font-semibold text-sm">Admin Panel</span>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats */}
        <AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className={`font-heading text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Tabs */}
        <AnimatedSection delay={100}>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Users Tab */}
        {activeTab === "users" && (
          <AnimatedSection delay={150}>
            <Card className="glass border-border">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-lg">User Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 bg-secondary border-border w-52"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Objects</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-center">{u.objects}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {u.lastActive}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.status === "active"
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          }`}>
                            {u.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => toast.info(`Viewing ${u.name}`)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toast.warning(`${u.status === "active" ? "Suspended" : "Reactivated"} ${u.name}`)}
                            >
                              {u.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <AnimatedSection delay={150}>
            <Card className="glass border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        log.type === "info" ? "bg-primary" : log.type === "warning" ? "bg-warning" : "bg-destructive"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <AnimatedSection delay={150}>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base">Object Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Keys", count: 2340, pct: 40 },
                      { label: "Wallets", count: 1520, pct: 26 },
                      { label: "Phones", count: 1190, pct: 20 },
                      { label: "ID Cards", count: 782, pct: 14 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="text-muted-foreground">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base">Recovery Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Recovered", value: "94%", color: "text-success" },
                      { label: "Avg Time", value: "4.2m", color: "text-primary" },
                      { label: "Alerts Sent", value: "12.4K", color: "text-warning" },
                      { label: "False Alerts", value: "3.1%", color: "text-accent" },
                    ].map((s) => (
                      <div key={s.label} className="glass rounded-xl p-4 text-center">
                        <p className={`font-heading text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
