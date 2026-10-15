import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import villageBg from "@/assets/bangladesh-village-bg.jpg";
import agriLogo from "@/assets/agri-brain-logo.png";

export default function SplashPage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLeaving(true), 2740);
    const navigationTimer = window.setTimeout(() => navigate("/home", { replace: true }), 3000);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return createPortal(
    <main className={`splash-screen${leaving ? " splash-screen-leaving" : ""}`} aria-label="agriশক্তি">
      <img src={villageBg} alt="" className="splash-landscape" aria-hidden="true" />
      <div className="splash-shade" />
      <div className="splash-identity">
        <img src={agriLogo} alt="agriশক্তি লোগো" className="splash-logo" width={104} height={104} />
        <div className="splash-wordmark">
          <h1>agriশক্তি</h1>
          <p className="splash-tagline">বাংলার কৃষকের AI সহকারী</p>
        </div>
        <div className="splash-rule" aria-hidden="true" />
        <p className="splash-motto">মাটি, মানুষ, প্রযুক্তি – কৃষির নতুন শক্তি</p>
        <div className="splash-loading" role="status" aria-label="অ্যাপ খুলছে">
          <span /><span /><span />
        </div>
      </div>
      <footer className="splash-credit">Created by <span>TEAM_NEWBIES</span></footer>
    </main>,
    document.body,
  );
}