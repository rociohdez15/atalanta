import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Subir siempre arriba cuando se cambia de página
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
