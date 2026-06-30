import { motion } from "framer-motion";
import React from "react";

const FloatingButton = () => {
  const handleClick = () => {
    // Abrir WhatsApp web o app directamente
    window.open(
      "https://wa.me/614892722", // reemplaza con tu número con prefijo internacional
      "_blank"
    );
  };

  return (
    <motion.button
      onClick={handleClick}
      className="floating-btn"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="Contáctanos por WhatsApp"
    >
      <img
        src="/images/whatsapp-logo.webp" // pon tu logo de WhatsApp en public/images
        alt="WhatsApp"
        style={{ width: "28px", height: "28px" }}
      />
    </motion.button>
  );
};

export default FloatingButton;
