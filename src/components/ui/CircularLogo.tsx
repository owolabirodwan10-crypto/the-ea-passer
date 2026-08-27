export function CircularLogo({ size = 38 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border border-border bg-[radial-gradient(circle_at_32%_28%,#1c212b_0%,#0c0e13_72%)] shadow-[0_0_0_1px_rgba(47,124,246,0.12),inset_0_0_12px_rgba(0,0,0,0.6)] shrink-0"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-circular.png"
        alt="EAPASER logo"
        style={{ width: size * 0.64, height: size * 0.64 }}
        className="object-contain"
      />
    </div>
  );
}
