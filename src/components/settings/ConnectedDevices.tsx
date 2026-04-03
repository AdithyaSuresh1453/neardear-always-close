import { useState, useEffect } from "react";
import {
  Bluetooth, Wifi, Watch, Headphones, Smartphone, Trash2, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConnectedDevice {
  id: string;
  device_name: string;
  device_type: string;
  is_connected: boolean;
  battery_level: number | null;
}

const deviceIcons: Record<string, typeof Watch> = {
  watch: Watch,
  earbuds: Headphones,
  phone: Smartphone,
};

const deviceTypeLabels: Record<string, string> = {
  watch: "Smartwatch",
  earbuds: "Earbuds / AirPods",
  phone: "Phone",
};

const ConnectedDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("phone");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchDevices = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("connected_devices")
      .select("id, device_name, device_type, is_connected, battery_level")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setDevices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const addDevice = async () => {
    if (!user || !newName.trim()) return;
    const { error } = await supabase.from("connected_devices").insert({
      user_id: user.id,
      device_name: newName.trim(),
      device_type: newType,
      is_connected: false,
      battery_level: null,
    });
    if (error) {
      toast.error("Failed to add device");
      return;
    }
    toast.success(`${newName.trim()} added!`);
    setNewName("");
    setNewType("phone");
    setDialogOpen(false);
    fetchDevices();
  };

  const toggleConnection = async (device: ConnectedDevice) => {
    setConnecting(device.id);
    const newConnected = !device.is_connected;

    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 1200));

    const newBattery = newConnected
      ? Math.floor(Math.random() * 60) + 40
      : device.battery_level;

    const { error } = await supabase
      .from("connected_devices")
      .update({ is_connected: newConnected, battery_level: newBattery })
      .eq("id", device.id);

    setConnecting(null);
    if (error) {
      toast.error("Connection failed");
      return;
    }
    toast.success(
      newConnected
        ? `${device.device_name} connected!`
        : `${device.device_name} disconnected`
    );
    fetchDevices();
  };

  const removeDevice = async (device: ConnectedDevice) => {
    const { error } = await supabase
      .from("connected_devices")
      .delete()
      .eq("id", device.id);
    if (error) {
      toast.error("Failed to remove device");
      return;
    }
    toast.info(`${device.device_name} removed`);
    fetchDevices();
  };

  return (
    <Card className="glass border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-primary" /> Connected Devices
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              toast.info("Scanning for nearby devices...");
              setTimeout(() => toast.success("Scan complete"), 2000);
            }}
          >
            <Wifi className="w-4 h-4" /> Scan
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Device</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Device Name</Label>
                  <Input
                    placeholder="e.g. Apple Watch Series 9"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(deviceTypeLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={addDevice} disabled={!newName.trim()}>
                  Add Device
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground text-center py-6">Loading devices...</p>}
        {!loading && devices.map((d) => {
          const DeviceIcon = deviceIcons[d.device_type] || Smartphone;
          const isConnecting = connecting === d.id;
          return (
            <div
              key={d.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  d.is_connected ? "bg-primary/10" : "bg-secondary"
                }`}
              >
                <DeviceIcon
                  className={`w-5 h-5 ${d.is_connected ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.device_name}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      isConnecting
                        ? "text-warning animate-pulse"
                        : d.is_connected
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isConnecting
                      ? "Connecting..."
                      : d.is_connected
                      ? "Connected"
                      : "Disconnected"}
                  </span>
                  {d.battery_level !== null && d.is_connected && (
                    <span
                      className={`text-xs ${
                        d.battery_level > 50
                          ? "text-success"
                          : d.battery_level > 20
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {d.battery_level}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={d.is_connected}
                  disabled={isConnecting}
                  onCheckedChange={() => toggleConnection(d)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeDevice(d)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          );
        })}
        {!loading && devices.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No devices added yet. Tap Add to register a device.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedDevices;
