<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- TITLE optimizado -->
  <title>Viajes Atalanta | Viajes de aventura y experiencias únicas</title>

  <!-- Meta description (MUY IMPORTANTE para Google) -->
  <meta name="description"
    content="Viajes Atalanta diseña viajes únicos que combinan aventura, cultura y experiencias auténticas en destinos inolvidables." />

  <!-- Canonical -->
  <link rel="canonical" href="https://www.viajesatalanta.com/" />

  <!-- SITE NAME (clave para que Google muestre el nombre de marca) -->
  <script type="application/ld+json">
    {
      "@@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Viajes Atalanta",
      "alternateName": "Atalanta",
      "url": "https://www.viajesatalanta.com/"
    }
  </script>

  <!-- Preload imágenes -->
  <link rel="preload" as="image" href="/images/fondo1.jpg" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo1.webp" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo1-768.webp" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo1-1280.webp" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo1-1920.webp" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo2.jpg" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondoo3.jpg" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/fondo4.jpg" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/campanas/fondo_bf.png" fetchpriority="high" />
  <link rel="preload" as="image" href="/images/campanas/fondo_bfm.png" fetchpriority="high" media="(max-width: 768px)" />

  <!-- Preload fuentes -->
  <link rel="preload" as="font" href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.woff2?v=2.5.0" type="font/woff2" crossorigin>
  <link rel="preload" as="font" href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.woff?v=2.5.0" type="font/woff" crossorigin>
  <link rel="preload" as="font" href="/fonts/TT-Espina-Trial-Variable.ttf" type="font/ttf" crossorigin>
  <link rel="preload"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous">

  <!-- Fuentes y CSS de terceros -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Savate:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
  <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />

  <!-- CSS panel administración -->
  <link rel="stylesheet" href="/administracion_files/daterangepicker.css" />
  <link rel="stylesheet" href="/administracion_files/jquery-jvectormap-1.2.2.css" />
  <link rel="stylesheet" href="/administracion_files/app.min.css" />
  <link rel="stylesheet" href="/administracion_files/icons.min.css" />

  <!-- Open Graph (WhatsApp, Instagram, Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Viajes Atalanta ">
  <meta property="og:description" content="Diseñamos viajes únicos que combinan aventura, cultura y experiencias auténticas en destinos inolvidables.">
  <meta property="og:url" content="https://www.viajesatalanta.com/">
  <meta property="og:image" content="https://www.viajesatalanta.com/images/logo-factura.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Viajes Atalanta">
  <meta name="twitter:description" content="Diseñamos viajes únicos que combinan aventura, cultura y experiencias auténticas en destinos inolvidables.">
  <meta name="twitter:image" content="https://www.viajesatalanta.com/images/logo-factura.png">

  <!-- Favicons con cache-busting -->
  <link rel="icon" href="/favicon.ico?v=3" sizes="48x48" type="image/x-icon">
  <link rel="icon" href="/favicon-96.png?v=3" sizes="96x96" type="image/png">
  <link rel="apple-touch-icon" href="/favicon-144.png?v=3">

  <!-- Evitar que Bootstrap modifique tamaño de letras -->
  <style>
    nav,
    .navbar,
    .navbar-brand,
    .navbar-nav .nav-link {
      font-size: inherit !important;
    }
  </style>

  @viteReactRefresh
  @vite('resources/js/main.jsx')
</head>

<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</body>

</html>