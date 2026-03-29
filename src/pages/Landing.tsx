import { Link } from "react-router-dom";
import { Shield, Eye, MapPin, Bell, Mic, Smartphone } from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedSection from "@/components/AnimatedSection";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Eye, title: "AI Object Detection", desc: "Real-time TensorFlow-powered detection with 90%+ accuracy" },
  { icon: Mic, title: "Voice-First Design", desc: "Speak naturally to find, register, and track your belongings" },
  { icon: MapPin, title: "Home Route Mapping", desc: "Indoor navigation guides you step-by-step to your items" },
  { icon: Bell, title: "Smart Alerts", desc: "Intelligent notifications when items are misplaced or forgotten" },
  { icon: Smartphone, title: "Phone Recovery", desc: "Locate, lock, and trigger alarms on lost devices remotely" },
  { icon: Shield, title: "End-to-End Encryption", desc: "Military-grade security for all your personal data" },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Nav */}
    <nav className="fixed top-0 inset-x-0 z-50 glass">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      <div className="relative container text-center space-y-8 py-20">
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            AI-Powered Object Tracking
          </div>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <h1 className="font-heading text-5xl sm:text-7xl font-bold leading-tight">
            Never Lose <br />
            <span className="text-gradient-primary">Anything Again</span>
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            NearDear uses AI, voice commands, and smart alerts to track your belongings
            and guide you to them — always close to you.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={300}>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-heading font-semibold text-base hover:opacity-90 transition-all glow-primary"
            >
              Start Tracking Free
            </Link>
            <Link
              to="/dashboard"
              className="bg-secondary text-secondary-foreground px-8 py-3.5 rounded-xl font-heading font-semibold text-base hover:bg-secondary/80 transition-all border border-border"
            >
              View Demo
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>

    {/* Features */}
    <section className="py-24">
      <div className="container">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">
            Intelligent Features for <span className="text-gradient-primary">Peace of Mind</span>
          </h2>
        </AnimatedSection>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 100}>
              <div className="glass rounded-2xl p-6 h-full hover:border-primary/40 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24">
      <AnimatedSection className="container">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Ready to <span className="text-gradient-primary">Get Started?</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join thousands who never lose their belongings again.
            </p>
            <Link
              to="/auth?mode=signup"
              className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-heading font-semibold hover:opacity-90 transition-all glow-primary"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>

    {/* Footer */}
    <footer className="border-t border-border py-8">
      <div className="container flex items-center justify-between">
        <Logo size="sm" />
        <p className="text-xs text-muted-foreground">© 2026 NearDear. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default Landing;
