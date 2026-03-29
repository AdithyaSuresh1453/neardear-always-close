import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Home, Plus, Trash2, Navigation, MapPin,
  Square, Edit3, Save, Layers, Move
} from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shelves: Shelf[];
}

interface Shelf {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface ObjectMarker {
  id: string;
  name: string;
  roomId: string;
  shelfId?: string;
  x: number;
  y: number;
}

const roomColors = [
  "hsl(199 89% 48% / 0.15)",
  "hsl(43 96% 56% / 0.15)",
  "hsl(152 69% 45% / 0.15)",
  "hsl(0 72% 51% / 0.15)",
  "hsl(280 60% 50% / 0.15)",
];

const initialRooms: Room[] = [
  { id: "r1", name: "Living Room", x: 20, y: 20, width: 220, height: 160, color: roomColors[0], shelves: [
    { id: "s1", label: "Shelf 1", x: 40, y: 50 },
    { id: "s2", label: "Shelf 2", x: 180, y: 130 },
  ]},
  { id: "r2", name: "Bedroom", x: 260, y: 20, width: 180, height: 160, color: roomColors[1], shelves: [
    { id: "s3", label: "Nightstand", x: 300, y: 60 },
  ]},
  { id: "r3", name: "Kitchen", x: 20, y: 200, width: 180, height: 130, color: roomColors[2], shelves: [
    { id: "s4", label: "Counter", x: 60, y: 250 },
  ]},
  { id: "r4", name: "Office", x: 220, y: 200, width: 220, height: 130, color: roomColors[3], shelves: [
    { id: "s5", label: "Drawer 1", x: 280, y: 240 },
    { id: "s6", label: "Desk", x: 380, y: 280 },
  ]},
];

const initialObjects: ObjectMarker[] = [
  { id: "o1", name: "House Keys", roomId: "r1", shelfId: "s2", x: 180, y: 130 },
  { id: "o2", name: "Wallet", roomId: "r2", shelfId: "s3", x: 300, y: 60 },
  { id: "o3", name: "iPhone", roomId: "r3", shelfId: "s4", x: 60, y: 250 },
  { id: "o4", name: "ID Card", roomId: "r4", shelfId: "s5", x: 280, y: 240 },
];

type Tool = "select" | "room" | "shelf" | "navigate";

const HomeRouteMapping = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [objects] = useState(initialObjects);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedObject, setSelectedObject] = useState<ObjectMarker | null>(null);
  const [navPath, setNavPath] = useState<{ x: number; y: number }[] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const navigateToObject = (obj: ObjectMarker) => {
    setSelectedObject(obj);
    // Simulate a path from entrance to object
    const entrance = { x: 10, y: 180 };
    const target = { x: obj.x, y: obj.y };
    const mid1 = { x: entrance.x + 30, y: entrance.y };
    const mid2 = { x: target.x, y: entrance.y };
    setNavPath([entrance, mid1, mid2, target]);
    toast.success(`Navigating to ${obj.name}`);
  };

  const pathToSvg = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const tools: { key: Tool; icon: typeof Move; label: string }[] = [
    { key: "select", icon: Move, label: "Select" },
    { key: "room", icon: Square, label: "Add Room" },
    { key: "shelf", icon: Layers, label: "Add Shelf" },
    { key: "navigate", icon: Navigation, label: "Navigate" },
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
          <h1 className="font-heading font-semibold text-sm">Home Route Map</h1>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Toolbar */}
        <AnimatedSection>
          <div className="flex flex-wrap items-center gap-2">
            {tools.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTool(t.key);
                  if (t.key !== "navigate") { setNavPath(null); setSelectedObject(null); }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTool === t.key
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Layout saved!")}>
              <Save className="w-4 h-4" /> Save Layout
            </Button>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <AnimatedSection delay={100} className="lg:col-span-2">
            <Card className="glass border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" /> Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={canvasRef}
                  className="relative w-full bg-secondary/30 rounded-xl overflow-hidden border border-border"
                  style={{ height: 380 }}
                >
                  {/* Grid */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Rooms */}
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="absolute border-2 border-dashed rounded-lg flex items-start justify-start p-2 transition-all"
                      style={{
                        left: room.x,
                        top: room.y,
                        width: room.width,
                        height: room.height,
                        backgroundColor: room.color,
                        borderColor: room.color.replace("0.15", "0.5"),
                      }}
                    >
                      <span className="text-[10px] font-heading font-semibold text-foreground/70 bg-background/50 px-1.5 py-0.5 rounded">
                        {room.name}
                      </span>

                      {/* Shelves */}
                      {room.shelves.map((shelf) => (
                        <div
                          key={shelf.id}
                          className="absolute w-2.5 h-2.5 bg-muted-foreground/40 rounded-sm border border-muted-foreground/20"
                          style={{ left: shelf.x - room.x, top: shelf.y - room.y }}
                          title={shelf.label}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Navigation path */}
                  {navPath && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path
                        d={pathToSvg(navPath)}
                        fill="none"
                        stroke="hsl(199 89% 48%)"
                        strokeWidth="3"
                        strokeDasharray="8 4"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                    </svg>
                  )}

                  {/* Object markers */}
                  {objects.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => activeTool === "navigate" ? navigateToObject(obj) : setSelectedObject(obj)}
                      className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all ${
                        selectedObject?.id === obj.id
                          ? "bg-primary scale-125 shadow-lg shadow-primary/40"
                          : "bg-accent hover:scale-110"
                      }`}
                      style={{ left: obj.x, top: obj.y }}
                      title={obj.name}
                    >
                      <MapPin className="w-3 h-3 text-primary-foreground" />
                    </button>
                  ))}

                  {/* Entrance marker */}
                  <div className="absolute left-0 top-[180px] w-5 h-8 bg-primary/30 rounded-r-lg flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">IN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Object List for Navigation */}
            <AnimatedSection delay={200}>
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" /> Find Object
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {objects.map((obj) => {
                    const room = rooms.find((r) => r.id === obj.roomId);
                    const shelf = room?.shelves.find((s) => s.id === obj.shelfId);
                    return (
                      <button
                        key={obj.id}
                        onClick={() => navigateToObject(obj)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          selectedObject?.id === obj.id
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-secondary/60"
                        }`}
                      >
                        <p className="text-sm font-medium">{obj.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {room?.name}{shelf ? ` → ${shelf.label}` : ""}
                        </p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Room List */}
            <AnimatedSection delay={300}>
              <Card className="glass border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" /> Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: room.color.replace("0.15", "0.6") }} />
                        <span className="text-sm">{room.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{room.shelves.length} shelves</span>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-2"
                    onClick={() => toast.info("Draw a room on the floor plan")}
                  >
                    <Plus className="w-4 h-4" /> Add Room
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeRouteMapping;
