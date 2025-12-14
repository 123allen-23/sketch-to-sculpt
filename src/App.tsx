import { useState } from "react";
import SettingsPage from "./pages/SettingsPage";

type Tab = "home" | "upload" | "gallery" | "profile" | "settings" | "about";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-wide">
            Sketch<span className="text-cyan-400">→</span>Sculpt
          </div>

          <nav className="flex gap-2">
            <NavButton
              label="Home"
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavButton
              label="Upload"
              isActive={activeTab === "upload"}
              onClick={() => setActiveTab("upload")}
            />
            <NavButton
              label="Gallery"
              isActive={activeTab === "gallery"}
              onClick={() => setActiveTab("gallery")}
            />
            <NavButton
              label="Profile"
              isActive={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <NavButton
              label="Settings"
              isActive={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
            />
            <NavButton
              label="About"
              isActive={activeTab === "about"}
              onClick={() => setActiveTab("about")}
            />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "home" && <HomeSection />}
        {activeTab === "upload" && <UploadSection />}
        {activeTab === "gallery" && <GallerySection />}
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "settings" && <SettingsPage />}
        {activeTab === "about" && <AboutSection />}
      </main>
    </div>
  );
}

type NavButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function NavButton({ label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition
        ${
          isActive
            ? "bg-cyan-500 text-slate-900"
            : "bg-slate-800/70 text-slate-100 hover:bg-slate-700"
        }`}
    >
      {label}
    </button>
  );
}

function HomeSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">
        Turn your sketches into real sculptures.
      </h1>
      <p className="text-slate-400 max-w-xl">
        Upload your drawing, choose your style, and we&apos;ll help you bring it
        into the 3D world with prints and display-ready art.
      </p>
    </div>
  );
}

function UploadSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Upload</h2>
      <p className="text-slate-400">
        This is your upload area. (We already wired the real upload flow
        elsewhere; this is just a placeholder container if needed.)
      </p>
    </div>
  );
}

function GallerySection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Gallery</h2>
      <p className="text-slate-400">
        Showcase finished pieces, progress shots, and 3D renders here.
      </p>
    </div>
  );
}

function ProfileSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Profile</h2>
      <p className="text-slate-400">
        Profile details and public artist info will live in this section.
      </p>
    </div>
  );
}

function AboutSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">About</h2>
      <p className="text-slate-400 max-w-xl">
        Sketch→Sculpt is your bridge from paper to physical art — combining your
        hand-drawn style with AI assistance and 3D printing.
      </p>
    </div>
  );
}
