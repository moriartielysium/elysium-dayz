import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import { api } from "../../lib/api";

function buildAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
}

export default function PlayerLayout({ title, subtitle, children, nav = [] }) {
  const { slug } = useParams();
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [me, profile] = await Promise.allSettled([
          api("me"),
          slug ? api(`player/profile?slug=${encodeURIComponent(slug === "demo" ? "elysium" : slug)}`) : Promise.resolve(null),
        ]);

        if (!active) return;

        const user = me.status === "fulfilled" ? me.value?.user : null;
        const playerProfile = profile.status === "fulfilled" ? profile.value?.profile : null;

        const discordName = user?.global_name || user?.username || "";
        const psnName = playerProfile?.psnName || "";
        const avatarUrl = buildAvatarUrl(user);

        if (discordName || psnName || avatarUrl) {
          setIdentity({ discordName, psnName, avatarUrl });
        } else {
          setIdentity(null);
        }
      } catch {
        if (!active) return;
        setIdentity(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [slug]);

  const safeNav = useMemo(() => nav || [], [nav]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={title} subtitle={subtitle} identity={identity} />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar items={safeNav} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 lg:pb-6">{children}</main>
      </div>
      <MobileBottomNav items={safeNav} />
    </div>
  );
}
