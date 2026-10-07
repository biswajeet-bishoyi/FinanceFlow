import { BatLoader } from "@/components/ui/bat-loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background pointer-events-none">
      <BatLoader size="2xl" className="text-on-surface" />
    </div>
  );
}
