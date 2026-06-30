<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atalanta - Mantenimiento</title>
    <link rel="icon" href="/../favicon.ico" type="image/x-icon" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        /* Reset básico */
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #8a775a 0%, #a08c6c 100%);
            color: #ffffff;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        .container {
            max-width: 600px;
            padding: 20px;
        }

        h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 2px 2px 6px rgba(0,0,0,0.3);
        }

        p {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 0;
        }

        /* Logos juntos */
        .logo-group {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
        }

        .logo-group img:first-child {
            width: 70px;
            height: 70px;
            border-radius: 10%;
        }

        .logo-group img:last-child {
            width: 110px;
            height: 30px;
            object-fit: contain;
            margin-left: -15px;
        }

        /* Icono decorativo de aventura (SVG inline) */
        .icon-adventure {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
        }

        .icon-adventure svg {
            width: 100%;
            height: 100%;
            stroke: #ffffff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-group">
            <img src="/images/logo_atalanta1.png" alt="Logo">
            <img src="/images/titulo_atalanta1.png" alt="Logo Texto">
        </div>

        <h1>Estamos en Mantenimiento</h1>
        <p>
            En Atalanta estamos preparando nuevas aventuras para ti.<br>
            Vuelve pronto y descubre experiencias únicas y emocionantes.
        </p>
    </div>
</body>
</html>
