import Loader from "./Loader";

export default function ProtectedRoute({ loading, allowed, fallback = null, children }) {
  if (loading) return <Loader />;
  if (!allowed) return fallback;
  return children;
}
