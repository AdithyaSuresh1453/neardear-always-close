import logoImg from "@/assets/neardear-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };

const Logo = ({ size = "md", showText = true }: LogoProps) => (
  <div className="flex items-center gap-2.5">
    <img src={logoImg} alt="NearDear logo" className={`${sizes[size]} object-contain`} />
    {showText && (
      <div className="flex flex-col leading-none">
        <span className="font-heading text-lg font-bold tracking-tight text-foreground">
          Near<span className="text-gradient-primary">Dear</span>
        </span>
        <span className="text-[10px] font-body text-muted-foreground tracking-widest uppercase">
          Always close to you
        </span>
      </div>
    )}
  </div>
);

export default Logo;
