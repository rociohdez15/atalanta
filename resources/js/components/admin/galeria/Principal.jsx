import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Obtener imágenes
  useEffect(() => {
    setLoading(true);
    axios.get("/api/imagenes/obtener-galeria")
      .then(res => {
        setImages(res.data);
        setFilteredImages(res.data);
      })
      .catch(() => Swal.fire("Error", "No se pudieron cargar las imágenes.", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredImages(images);
        return;
      }

      axios.get(`/api/imagenes/buscar?query=${searchTerm}`)
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          setFilteredImages(data);
          setCurrentPage(1);
        })
        .catch(() => setFilteredImages([]));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, images]);

  // Paginación
  const indexOfLastImage = currentPage * entriesPerPage;
  const indexOfFirstImage = indexOfLastImage - entriesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredImages.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const formatDateToInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date) ? "" : date.toISOString().split("T")[0];
  };

  // EDITAR (Swal estilo eventos)
  const handleEdit = (img) => {
    Swal.fire({
      title: "Editar imagen",
      html: `
        <div style="text-align: center;">
          <label style="display:block;margin-bottom:4px;">Título</label>
          <input id="titulo" class="swal2-input" value="${img.titulo}">

          <label style="display:block;margin-top:10px;margin-bottom:4px;">Fecha</label>
          <input id="fecha" type="date" class="swal2-input" value="${formatDateToInput(img.fecha)}">

          <label style="display:block;margin-top:10px;margin-bottom:4px;">Ubicación</label>
          <input id="ubicacion" class="swal2-input" value="${img.ubicacion}">

          <label style="display:block;margin-top:10px;margin-bottom:4px;">Mapa</label>
          <input id="mapa" class="swal2-input" value="${img.mapa}">

          <label style="display:block;margin-top:10px;margin-bottom:4px;">Imagen</label>
          <input id="imagen" type="file" class="swal2-file">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      preConfirm: () => {
        const titulo = document.getElementById("titulo").value;
        const fecha = document.getElementById("fecha").value;
        const ubicacion = document.getElementById("ubicacion").value;
        const mapa = document.getElementById("mapa").value;
        const imagen = document.getElementById("imagen").files[0];

        if (!titulo || !fecha || !ubicacion || !mapa) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return false;
        }

        return { titulo, fecha, ubicacion, mapa, imagen };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { titulo, fecha, ubicacion, mapa, imagen } = result.value;

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("titulo", titulo);
        formData.append("fecha", fecha);
        formData.append("ubicacion", ubicacion);
        formData.append("mapa", mapa);
        if (imagen) formData.append("imagen", imagen);

        try {
          const res = await axios.post(`/api/imagenes/editar/${img.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          setImages(prev => prev.map(i => i.id === img.id ? res.data : i));
          setFilteredImages(prev => prev.map(i => i.id === img.id ? res.data : i));

          Swal.fire("Actualizada", "La galería ha sido actualizada.", "success");
        } catch {
          Swal.fire("Error", "No se pudo actualizar la imagen.", "error");
        }
      }
    });
  };

  // ELIMINAR
  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Eliminar imagen?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`/api/imagenes/eliminar/${id}`)
          .then(() => {
            setImages(prev => prev.filter(img => img.id !== id));
            setFilteredImages(prev => prev.filter(img => img.id !== id));
            Swal.fire("Eliminado", "La imagen ha sido eliminada.", "success");
          })
          .catch(() => Swal.fire("Error", "No se pudo eliminar la imagen.", "error"));
      }
    });
  };

  return (
    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <br />
          <h4 className="text-center mb-3">Galería de Imágenes</h4>

          <div className="d-flex justify-content-end mb-3">
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ width: 150 }}
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive p-3">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Ubicación</th>
                    <th>Mapa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentImages.length > 0 ? (
                    currentImages.map(img => (
                      <tr key={img.id}>
                        <td>{img.id}</td>
                        <td>
                          <img
                            src={`/storage/uploads/images/${img.imagen}`}
                            style={{ width: 80, height: 50, objectFit: "cover" }}
                            alt=""
                          />
                        </td>
                        <td>{img.titulo}</td>
                        <td>{new Date(img.fecha).toLocaleDateString()}</td>
                        <td>{img.ubicacion}</td>
                        <td>{img.mapa}</td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => handleEdit(img)}
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(img.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No se encontraron resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
              </li>

              {pageNumbers.map(number => (
                <li key={number} className={`page-item ${number === currentPage ? "active" : ""}`}>
                  <button className="page-link" onClick={() => paginate(number)}>
                    {number}
                  </button>
                </li>
              ))}

              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pageNumbers.length}
                >
                  →
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Principal;