import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/clientes/Navbar";
import Footer from "../../components/clientes/Footer";
import Blog from "../../components/clientes/Blog";
const Home = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <title>Blog | Atalanta</title>

            <Navbar />
            <br /><br /><br />
            <div
                style={{
                    flex: 1,
                    backgroundColor: "#ffffff",
                    paddingBottom: "1rem",
                }}
            >
              <br /><br /><br />
                 <Blog />
            </div>

            <Footer />
        </div>
    );
};

export default Home;
