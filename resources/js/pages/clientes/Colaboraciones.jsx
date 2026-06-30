import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/clientes/Navbar";
import Footer from "../../components/clientes/Footer";
import ColaboracionesComponent from "../../components/clientes/Colaboraciones";
const Colaboraciones = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <meta charSet="utf-8" />
            <meta
                name="keywords"
                content="​Book your outdoor adventure, About Us, ​Find your next getaway, Our Services, ​Plan Your Camping Trip, ​How to plan a camping trip, Contact Us"
            />

            <meta
                name="description"
                content="Colaboraciones con Atalanta: descubre nuestros partners y proyectos"
            />

            <title>Colaboraciones | Atalanta</title>
            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"
                rel="stylesheet"
            />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin= "anonymous"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Sansita:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700;1,800;1,900&display=swap"
                rel="stylesheet"
            />
            <meta name="generator" content="Nicepage 7.6.4, nicepage.com" />
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
                rel="stylesheet"
            />
            <link
                id="u-theme-google-font"
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i|Open+Sans:300,300i,400,400i,500,500i,600,600i,700,700i,800,800i"
            />
            <meta name="theme-color" content="#478ac9" />
            <meta property="og:title" content="Atalanta" />
            <meta property="og:type" content="website" />
            <meta data-intl-tel-input-cdn-path="intlTelInput/" />

            <Navbar />

            <div
                style={{
                    flex: 1,
                    backgroundColor: "#ffffff",
                    paddingBottom: "1rem",
                }}
            >
                <br />
                <ColaboracionesComponent />
            </div>

            <Footer />
        </div>
    );
};

export default Colaboraciones;
