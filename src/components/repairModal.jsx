// RepairModal.jsx modal para troqueles y moldes en estado de reparacion

import React, { useState, useEffect, memo, useCallback } from "react";

import { statusColors } from "../styles/EKanban.styles";

import { useNotification } from "../context/NotificationContext";

const API_BASE = "http://localhost:3001/api";

const RepairModal = memo(
  ({ item, fallas = [], onClose, onSaveAction, user }) => {
    const notify = useNotification();

    const isAuthenticated = !!user;

    const [activeTab, setActiveTab] = useState("acciones");

    const [history, setHistory] = useState([]);

    const [cycleHistory, setCycleHistory] = useState([]);

    const [loadingHistory, setLoadingHistory] = useState(false);

    const [imageError, setImageError] = useState(false);

    const [repairCycle, setRepairCycle] = useState(null);

    const [loadingCycle, setLoadingCycle] = useState(true);

    const [modelosTroquel, setModelosTroquel] = useState([]);

    const [loadingModelos, setLoadingModelos] = useState(false);

    const [repairProcess, setRepairProcess] = useState({
      bajado: null,

      recepcionTaller: null,

      inicioReparacion: null,

      termino: null,
    });

    const [technicians, setTechnicians] = useState([]);

    const [newTechnician, setNewTechnician] = useState({
      nombre: "",
      grupo: "",
      tipo: "Técnico",
    });

    const [savingTechnician, setSavingTechnician] = useState(false);

    const [additionalOptions, setAdditionalOptions] = useState({
      detalleId: "",

      cambioModeloId: "",

      fechaLiberacion: "",

      motivoPendiente: "",

      prioridadReparacion: "",
    });

    const [savingOptions, setSavingOptions] = useState(false);

    const [completing, setCompleting] = useState(false);

    const [completeForm, setCompleteForm] = useState({
      empleado: "",
      comentarios: "",
      newStatus: "Listo",
    });

    const [stats, setStats] = useState(null);

    const isMolde = item.type === "molde";

    const statusColor =
      (item.status === "En maquina"
        ? statusColors["En prensa"]
        : statusColors[item.status]) || "#00ff88";

    const handleTechNombreChange = useCallback((e) => {
      const value = e.target.value;

      setNewTechnician((prev) => ({ ...prev, nombre: value }));
    }, []);

    const handleTechGrupoChange = useCallback((e) => {
      const value = e.target.value;

      setNewTechnician((prev) => ({ ...prev, grupo: value }));
    }, []);

    const handleTechTipoChange = useCallback((e) => {
      const value = e.target.value;

      setNewTechnician((prev) => ({ ...prev, tipo: value }));
    }, []);

    const handleDetalleIdChange = useCallback((e) => {
      const value = e.target.value;

      setAdditionalOptions((prev) => ({ ...prev, detalleId: value }));
    }, []);

    const handleCambioModeloIdChange = useCallback((e) => {
      const value = e.target.value;

      setAdditionalOptions((prev) => ({ ...prev, cambioModeloId: value }));
    }, []);

    const handleFechaLiberacionChange = useCallback((e) => {
      const value = e.target.value;

      setAdditionalOptions((prev) => ({ ...prev, fechaLiberacion: value }));
    }, []);

    const handleMotivoPendienteChange = useCallback((e) => {
      const value = e.target.value;

      setAdditionalOptions((prev) => ({ ...prev, motivoPendiente: value }));
    }, []);

    const handleEmpleadoChange = useCallback((e) => {
      const value = e.target.value;

      setCompleteForm((prev) => ({ ...prev, empleado: value }));
    }, []);

    const handleNewStatusChange = useCallback((e) => {
      const value = e.target.value;

      setCompleteForm((prev) => ({ ...prev, newStatus: value }));
    }, []);

    const handleComentariosChange = useCallback((e) => {
      const value = e.target.value;

      setCompleteForm((prev) => ({ ...prev, comentarios: value }));
    }, []);

    //cargando informacion

    const loadRepairCycle = useCallback(async () => {
      setLoadingCycle(true);

      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "moldes" : "troqueles"}/${item.id}/ciclo-activo`,
        );

        if (res.ok) {
          const data = await res.json();

          if (data.ciclo) {
            const ciclo = {
              ...data.ciclo,

              id: data.ciclo.id ?? data.ciclo.id_ciclo_reparacion,
            };

            setRepairCycle(ciclo);

            setTechnicians(data.tecnicos || []);

            setRepairProcess({
              bajado: data.ciclo.fecha_bajado,

              recepcionTaller: data.ciclo.fecha_recepcion_taller,

              inicioReparacion: data.ciclo.fecha_inicio_trabajo,

              termino: data.ciclo.fecha_termino_trabajo,
            });

            if (data.ciclo.prioridad) {
              setAdditionalOptions((prev) => ({
                ...prev,

                prioridadReparacion: data.ciclo.prioridad.toString(),
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading repair cycle:", err);
      } finally {
        setLoadingCycle(false);
      }
    }, [item.id]);

    const loadHistory = useCallback(async () => {
      setLoadingHistory(true);

      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "moldes" : "troqueles"}/${item.id}/history`,
        );

        if (res.ok) {
          const data = await res.json();

          setHistory(data);
        }
      } catch (err) {
        console.error("Error loading history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }, [item.id]);

    const loadCycleHistory = useCallback(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "moldes" : "troqueles"}/${item.id}/ciclos-historial`,
        );

        if (res.ok) {
          const data = await res.json();

          setCycleHistory(data);
        }
      } catch (err) {
        console.error("Error loading cycle history:", err);
      }
    }, [item.id]);

    const loadStatistics = useCallback(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "moldes" : "troqueles"}/${item.id}/estadisticas`,
        );

        if (res.ok) {
          const data = await res.json();

          setStats(data);
        }
      } catch (err) {
        console.error("Error loading statistics:", err);
      }
    }, [item.id]);

    useEffect(() => {
      loadRepairCycle();

      loadStatistics();
    }, [loadRepairCycle, loadStatistics]);

    // Cargar modelos del troquel para el dropdown de Cambio de Modelo

    useEffect(() => {
      if (!item?.id) return;

      setLoadingModelos(true);

      fetch(
        `${API_BASE}/${isMolde ? "modelos-molde" : "modelos"}?${isMolde ? "molde_id" : "troquel_id"}=${item.id}`,
      )
        .then((res) => res.json())

        .then((data) => setModelosTroquel(Array.isArray(data) ? data : []))

        .catch((err) => {
          console.error("Error loading modelos:", err);

          setModelosTroquel([]);
        })

        .finally(() => setLoadingModelos(false));
    }, [item?.id]);

    useEffect(() => {
      if (activeTab === "historial") {
        loadHistory();

        loadCycleHistory();
      }
    }, [activeTab, loadHistory, loadCycleHistory]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    //manejo de acciones

    const handleMarkStep = useCallback(
      async (stepKey) => {
        if (!isAuthenticated) {
          notify.error("Debe iniciar sesión para realizar esta acción");

          return;
        }

        if (!repairCycle) return;

        const stepLabels = {
          recepcionTaller: "Recepción en Taller",

          inicioReparacion: "Inicio de Reparación",

          termino: "Término de Reparación",
        };

        const confirmed = await notify.confirm({
          title: "Confirmar paso",

          message: `¿Confirmas marcar "${stepLabels[stepKey] || stepKey}" como completado?`,

          confirmLabel: "Sí, marcar",

          cancelLabel: "Cancelar",

          type: "warning",
        });

        if (!confirmed) return;

        const stepMap = {
          recepcionTaller: "recepcion",

          inicioReparacion: "inicio",

          termino: "termino",
        };

        const paso = stepMap[stepKey];

        if (!paso) return;

        try {
          const res = await fetch(
            isMolde
              ? `${API_BASE}/ciclos-molde/${repairCycle.id}/proceso`
              : `${API_BASE}/ciclos/${repairCycle.id}/actualizar-paso`,

            {
              method: isMolde ? "PATCH" : "POST",

              headers: { "Content-Type": "application/json" },

              body: JSON.stringify({ paso }),
            },
          );

          if (res.ok) {
            const data = await res.json();

            if (data.proceso) {
              setRepairProcess({
                bajado: data.proceso.fecha_bajado,

                recepcionTaller: data.proceso.fecha_recepcion_taller,

                inicioReparacion: data.proceso.fecha_inicio_trabajo,

                termino: data.proceso.fecha_termino_trabajo,
              });
            } else {
              //si la api no devuelve todo el proceso recargar todo el ciclo para no perder sincornizacion

              loadRepairCycle();
            }

            notify.success(
              `Paso "${stepLabels[stepKey]}" marcado exitosamente`,
            );
          }
        } catch (err) {
          console.error("Error marking step:", err);

          notify.error("Error al marcar el paso");
        }
      },

      [isAuthenticated, repairCycle, loadRepairCycle, notify],
    );

    const handleAddTechnician = useCallback(async () => {
      if (!isAuthenticated) {
        notify.error("Debe iniciar sesión para realizar esta acción");

        return;
      }

      if (!newTechnician.nombre.trim() || !repairCycle) return;

      setSavingTechnician(true);

      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "ciclos-molde" : "ciclos"}/${repairCycle.id}/tecnicos`,
          {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              empleado_nombre: newTechnician.nombre,

              grupo: newTechnician.grupo ? parseInt(newTechnician.grupo) : null,

              tipo: newTechnician.tipo || "Técnico",
            }),
          },
        );

        if (res.ok) {
          const data = await res.json();

          setTechnicians((prev) => [...prev, data.tecnico]);

          setNewTechnician({ nombre: "", grupo: "", tipo: "Técnico" });
        }
      } catch (err) {
        console.error("Error adding technician:", err);
      } finally {
        setSavingTechnician(false);
      }
    }, [isAuthenticated, newTechnician, repairCycle]);

    const handleRemoveTechnician = useCallback(
      async (techId) => {
        if (!isAuthenticated) {
          notify.error("Debe iniciar sesión para realizar esta acción");

          return;
        }

        try {
          const res = await fetch(
            `${API_BASE}/${isMolde ? "tecnicos-molde" : "tecnicos"}/${techId}`,
            {
              method: "DELETE",
            },
          );

          if (res.ok) {
            setTechnicians((prev) => prev.filter((t) => t.id !== techId));
          }
        } catch (err) {
          console.error("Error removing technician:", err);
        }
      },

      [isAuthenticated],
    );

    const handlePriorityChange = useCallback(
      async (e) => {
        if (!isAuthenticated) {
          notify.error("Debe iniciar sesión para realizar esta acción");

          return;
        }

        const newPriority = e.target.value;

        if (!repairCycle) return;

        setAdditionalOptions((prev) => ({
          ...prev,
          prioridadReparacion: newPriority,
        }));

        try {
          await fetch(
            `${API_BASE}/${isMolde ? "ciclos-molde" : "ciclos"}/${repairCycle.id}/prioridad`,
            {
              method: "POST",

              headers: { "Content-Type": "application/json" },

              body: JSON.stringify({ prioridad: parseInt(newPriority) }),
            },
          );
        } catch (err) {
          console.error("Error updating priority:", err);
        }
      },

      [isAuthenticated, repairCycle],
    );

    const handleAddDetail = useCallback(async () => {
      if (!isAuthenticated) {
        notify.error("Debe iniciar sesión para realizar esta acción");

        return;
      }

      if (!additionalOptions.detalleId || !repairCycle) return;

      const selectedFalla = fallas.find(
        (f) => f.id.toString() === additionalOptions.detalleId,
      );

      if (!selectedFalla) return;

      try {
        await fetch(
          `${API_BASE}/${isMolde ? "ciclos-molde" : "ciclos"}/${repairCycle.id}/agregar-detalle`,
          {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              falla_id: selectedFalla.id,
              falla_descripcion: selectedFalla.description,
            }),
          },
        );

        setAdditionalOptions((prev) => ({ ...prev, detalleId: "" }));

        loadRepairCycle();
      } catch (err) {
        console.error("Error adding detail:", err);
      }
    }, [
      isAuthenticated,
      additionalOptions.detalleId,
      repairCycle,
      fallas,
      loadRepairCycle,
    ]);

    const handleSavePending = useCallback(async () => {
      if (!isAuthenticated) {
        notify.error("Debe iniciar sesión para realizar esta acción");

        return;
      }

      if (!additionalOptions.fechaLiberacion || !repairCycle) return;

      setSavingOptions(true);

      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "ciclos-molde" : "ciclos"}/${repairCycle.id}/pendiente`,
          {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              fecha_liberacion: additionalOptions.fechaLiberacion,

              motivo: additionalOptions.motivoPendiente,

              empleado: completeForm.empleado || "Sistema",
            }),
          },
        );

        if (res.ok) {
          onSaveAction && onSaveAction();

          onClose();
        }
      } catch (err) {
        console.error("Error saving pending:", err);
      } finally {
        setSavingOptions(false);
      }
    }, [
      isAuthenticated,

      additionalOptions.fechaLiberacion,

      additionalOptions.motivoPendiente,

      completeForm.empleado,

      repairCycle,

      onSaveAction,

      onClose,
    ]);

    const handleCompleteRepair = useCallback(async () => {
      if (!isAuthenticated) {
        notify.error("Debe iniciar sesión para realizar esta acción");

        return;
      }

      if (!completeForm.empleado.trim() || !repairCycle) {
        alert("Por favor ingrese el nombre del empleado");

        return;
      }

      setCompleting(true);

      try {
        const res = await fetch(
          `${API_BASE}/${isMolde ? "ciclos-molde" : "ciclos"}/${repairCycle.id}/cerrar`,
          {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              status_salida: completeForm.newStatus,

              empleado_cierre: completeForm.empleado,

              comentarios: completeForm.comentarios,
            }),
          },
        );

        if (res.ok) {
          onSaveAction && onSaveAction();

          onClose();
        }
      } catch (err) {
        console.error("Error completing repair:", err);

        alert("Error de conexión");
      } finally {
        setCompleting(false);
      }
    }, [isAuthenticated, completeForm, repairCycle, onSaveAction, onClose]);

    const formatDateTime = useCallback((dateStr) => {
      if (!dateStr) return "---";

      const date = new Date(dateStr);

      return date.toLocaleString("es-MX", {
        day: "2-digit",

        month: "2-digit",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",
      });
    }, []);

    const formatDuration = useCallback((minutes) => {
      if (!minutes && minutes !== 0) return "---";

      const hours = Math.floor(minutes / 60);

      const mins = minutes % 60;

      if (hours >= 24) {
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;

        return `${days}d ${remainingHours}h`;
      }

      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }, []);

    const styles = {
      overlay: {
        position: "fixed",

        top: 0,

        left: 0,

        right: 0,

        bottom: 0,

        background: "rgba(0,0,0,0.85)",

        backdropFilter: "blur(8px)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        zIndex: 1000,

        padding: "20px",
      },

      modal: {
        background:
          "linear-gradient(145deg, rgba(15,25,20,0.98), rgba(10,15,13,0.98))",

        borderRadius: 16,

        border: "1px solid rgba(0,255,136,0.3)",

        boxShadow: "0 0 60px rgba(0,255,136,0.2)",

        width: "95vw",

        maxWidth: "1400px",

        height: "90vh",

        maxHeight: "850px",

        display: "flex",

        flexDirection: "column",

        overflow: "hidden",
      },

      leftPanel: {
        width: "280px",

        minWidth: "280px",

        borderRight: "1px solid rgba(0,255,136,0.2)",

        padding: "16px",

        overflowY: "auto",

        background: "rgba(0,0,0,0.2)",

        display: "flex",

        flexDirection: "column",

        gap: "12px",
      },

      rightPanel: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      },

      infoBox: {
        background: "rgba(0,255,136,0.05)",

        borderRadius: 8,

        overflow: "hidden",

        border: "1px solid rgba(0,255,136,0.2)",
      },

      infoHeader: {
        background: "rgba(0,255,136,0.15)",

        padding: "8px 12px",

        fontSize: 10,

        fontWeight: 700,

        color: "#00ff88",

        textTransform: "uppercase",

        textAlign: "center",
      },

      input: {
        width: "100%",

        padding: "8px 10px",

        background: "rgba(0,0,0,0.3)",

        border: "1px solid rgba(0,255,136,0.3)",

        borderRadius: 6,

        color: "#fff",

        fontSize: 11,

        boxSizing: "border-box",

        outline: "none",
      },

      select: {
        width: "100%",

        padding: "8px 10px",

        background: "rgba(0,0,0,0.3)",

        border: "1px solid rgba(0,255,136,0.3)",

        borderRadius: 6,

        color: "#fff",

        fontSize: 11,

        cursor: "pointer",

        boxSizing: "border-box",
      },
    };

    const getBtnStyle = useCallback(
      (active, color = "#00ff88") => ({
        padding: "8px 14px",

        background: active
          ? `rgba(${color === "#00ff88" ? "0,255,136" : "255,170,0"},0.2)`
          : "rgba(100,100,100,0.3)",

        border: `1px solid ${color}`,

        borderRadius: 6,

        color: color,

        fontSize: 11,

        fontWeight: 600,

        cursor: active ? "pointer" : "not-allowed",

        opacity: active ? 1 : 0.5,
      }),

      [],
    );

    return (
      <div onClick={onClose} style={styles.overlay}>
        {" "}
        <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
          {" "}
          {/* Header */}{" "}
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              padding: "14px 20px",

              borderBottom: "1px solid rgba(0,255,136,0.2)",

              background: "rgba(0,255,136,0.05)",
            }}
          >
            {" "}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {" "}
                <span style={{ color: "#888", fontSize: 12 }}>
                  Estatus:
                </span>{" "}
                <span
                  style={{
                    color: statusColor,

                    fontWeight: 700,

                    fontSize: 14,

                    textShadow: `0 0 10px ${statusColor}`,

                    textTransform: "uppercase",
                  }}
                >
                  {item.status}
                </span>{" "}
              </div>{" "}
              {repairCycle && (
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 12,

                    background: "rgba(0,255,136,0.1)",

                    padding: "6px 12px",

                    borderRadius: 6,

                    border: "1px solid rgba(0,255,136,0.2)",
                  }}
                >
                  {" "}
                  <span style={{ color: "#888", fontSize: 10 }}>
                    Ciclo #
                  </span>{" "}
                  <span
                    style={{ color: "#00ff88", fontSize: 12, fontWeight: 600 }}
                  >
                    {repairCycle.id}
                  </span>{" "}
                  <span style={{ color: "#666" }}>|</span>{" "}
                  <span style={{ color: "#888", fontSize: 10 }}>Tiempo:</span>{" "}
                  <span
                    style={{ color: "#ffaa00", fontSize: 12, fontWeight: 600 }}
                  >
                    {formatDuration(repairCycle.minutos_transcurridos)}
                  </span>{" "}
                </div>
              )}{" "}
            </div>{" "}
            <button
              onClick={onClose}
              style={{
                background: "transparent",

                border: "none",

                color: "#888",

                fontSize: 24,

                cursor: "pointer",

                padding: "0 8px",
              }}
            >
              ×
            </button>{" "}
          </div>{" "}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {" "}
            {/*panel izquierdo*/}{" "}
            <div style={styles.leftPanel}>
              {" "}
              <div
                style={{
                  width: "100%",

                  height: 140,

                  background: "rgba(0,255,136,0.05)",

                  borderRadius: 10,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  border: "2px solid rgba(0,255,136,0.2)",

                  overflow: "hidden",
                }}
              >
                {" "}
                {item.imageUrl && !imageError ? (
                  <img
                    src={item.imageUrl}
                    alt={item.id}
                    onError={() => setImageError(true)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ color: "rgba(0,255,136,0.4)", fontSize: 11 }}>
                    Sin imagen
                  </div>
                )}{" "}
              </div>{" "}
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                {" "}
                <div
                  style={{
                    fontSize: 32,

                    fontWeight: 800,

                    color: "#fff",

                    textShadow: "0 0 20px rgba(0,255,136,0.5)",

                    overflow: "hidden",

                    textOverflow: "ellipsis",

                    whiteSpace: "nowrap",

                    maxWidth: "100%",
                  }}
                  title={item.id}
                >
                  {item.id}
                </div>{" "}
                <div
                  style={{
                    fontSize: 13,
                    color: "#00ff88",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                  title={item.model || item.name}
                >
                  {item.model || item.name}
                </div>{" "}
              </div>{" "}
              <div style={styles.infoBox}>
                {" "}
                <div style={styles.infoHeader}>
                  {isMolde
                    ? "Información del Molde"
                    : "Información del Troquel"}
                </div>{" "}
                <div style={{ padding: "10px 12px" }}>
                  {" "}
                  {(isMolde
                    ? [
                        {
                          label: "Ciclos Iny:",
                          value: item.ciclos_inyeccion || "0",
                        },

                        {
                          label: "Ciclos Acum:",
                          value: item.ciclos_acumulados || "0",
                        },

                        {
                          label: "Capacidad:",
                          value: item.capacidad_ciclos || "0",
                        },

                        {
                          label: "Mtto Prev:",
                          value: item.mantenimientos_preventivos || "0",
                        },
                      ]
                    : [
                        { label: "Golpes:", value: item.golpes || "0" },

                        {
                          label: "Golpes Acum:",
                          value: item.golpesAcum || "0",
                        },

                        {
                          label: "Capacidad:",
                          value: item.capacidadGolpes || "0",
                        },

                        {
                          label: "Rectificaciones:",
                          value: item.rectificaciones || "0",
                        },
                      ]
                  ).map((row, i, arr) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        padding: "5px 0",

                        borderBottom:
                          i < arr.length - 1
                            ? "1px solid rgba(0,255,136,0.1)"
                            : "none",
                      }}
                    >
                      {" "}
                      <span style={{ fontSize: 10, color: "#888" }}>
                        {row.label}
                      </span>{" "}
                      <span
                        style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}
                      >
                        {row.value}
                      </span>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
              {repairCycle && (
                <div
                  style={{
                    ...styles.infoBox,
                    borderColor: "rgba(255,170,0,0.2)",
                  }}
                >
                  {" "}
                  <div
                    style={{
                      ...styles.infoHeader,

                      background: "rgba(255,170,0,0.2)",

                      color: "#ffaa00",
                    }}
                  >
                    Ciclo de Reparación
                  </div>{" "}
                  <div style={{ padding: "10px 12px" }}>
                    {" "}
                    {[
                      {
                        label: "Inicio:",

                        value: formatDateTime(
                          repairCycle.fecha_inicio_reparacion,
                        ),
                      },

                      { label: "Motivo:", value: repairCycle.motivo_entrada },

                      {
                        label: "Status Anterior:",
                        value: repairCycle.status_anterior,
                      },

                      {
                        label: isMolde ? "Máquina Origen:" : "Prensa Origen:",

                        value:
                          (isMolde
                            ? repairCycle.maquina_origen
                            : repairCycle.prensa_origen) || "-",
                      },

                      {
                        label: "Falla:",
                        value: repairCycle.falla_descripcion || "-",
                      },
                    ].map((row, i, arr) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",

                          justifyContent: "space-between",

                          padding: "4px 0",

                          borderBottom:
                            i < arr.length - 1
                              ? "1px solid rgba(255,170,0,0.1)"
                              : "none",
                        }}
                      >
                        {" "}
                        <span style={{ fontSize: 10, color: "#888" }}>
                          {row.label}
                        </span>{" "}
                        <span
                          style={{
                            fontSize: 10,

                            color: "#fff",

                            fontWeight: 500,

                            maxWidth: "60%",

                            textAlign: "right",
                          }}
                        >
                          {row.value}
                        </span>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {stats && stats.total_reparaciones > 0 && (
                <div
                  style={{
                    ...styles.infoBox,
                    borderColor: "rgba(0,229,255,0.2)",
                  }}
                >
                  {" "}
                  <div
                    style={{
                      ...styles.infoHeader,

                      background: "rgba(0,229,255,0.2)",

                      color: "#00e5ff",
                    }}
                  >
                    Estadísticas
                  </div>{" "}
                  <div style={{ padding: "10px 12px" }}>
                    {" "}
                    {[
                      {
                        label: "Total Reparaciones:",
                        value: stats.total_reparaciones,
                      },

                      {
                        label: "Promedio Horas:",

                        value: stats.promedio_horas_reparacion
                          ? `${parseFloat(stats.promedio_horas_reparacion).toFixed(1)}h`
                          : "-",
                      },

                      { label: "Por Falla:", value: stats.total_fallas },

                      { label: "Por Limpieza:", value: stats.total_limpiezas },
                    ].map((row, i, arr) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",

                          justifyContent: "space-between",

                          padding: "4px 0",

                          borderBottom:
                            i < arr.length - 1
                              ? "1px solid rgba(0,229,255,0.1)"
                              : "none",
                        }}
                      >
                        {" "}
                        <span style={{ fontSize: 10, color: "#888" }}>
                          {row.label}
                        </span>{" "}
                        <span
                          style={{
                            fontSize: 10,
                            color: "#00e5ff",
                            fontWeight: 600,
                          }}
                        >
                          {row.value}
                        </span>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/*panel derecho*/}{" "}
            <div style={styles.rightPanel}>
              {" "}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid rgba(0,255,136,0.2)",
                }}
              >
                {" "}
                {["acciones", "historial"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,

                      padding: "12px 20px",

                      background:
                        activeTab === tab
                          ? "rgba(0,255,136,0.1)"
                          : "transparent",

                      border: "none",

                      borderBottom:
                        activeTab === tab
                          ? "2px solid #00ff88"
                          : "2px solid transparent",

                      color: activeTab === tab ? "#00ff88" : "#888",

                      fontSize: 12,

                      fontWeight: 600,

                      textTransform: "uppercase",

                      cursor: "pointer",
                    }}
                  >
                    {tab}
                  </button>
                ))}{" "}
              </div>{" "}
              <div style={{ flex: 1, overflow: "hidden", padding: "16px" }}>
                {" "}
                {activeTab === "acciones" ? (
                  <div
                    style={{
                      position: "relative",

                      display: "flex",

                      gap: "20px",

                      height: "100%",

                      overflow: "hidden",
                    }}
                  >
                    {" "}
                    {/*panel de solo lectura para usuarios no autenticados*/}{" "}
                    {!isAuthenticated && (
                      <div
                        style={{
                          position: "absolute",

                          top: 0,

                          left: 0,

                          right: 300,

                          zIndex: 10,

                          background: "rgba(255,170,0,0.12)",

                          border: "1px solid rgba(255,170,0,0.3)",

                          borderRadius: 6,

                          padding: "6px 12px",

                          display: "flex",

                          alignItems: "center",

                          gap: 8,
                        }}
                      >
                        {" "}
                        <span
                          style={{
                            color: "#ffaa00",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Modo solo lectura
                        </span>{" "}
                        <span style={{ color: "#888", fontSize: 10 }}>
                          — Inicie sesión para realizar modificaciones
                        </span>{" "}
                      </div>
                    )}{" "}
                    <div
                      style={{
                        flex: 1,

                        display: "flex",

                        flexDirection: "column",

                        gap: "16px",

                        overflowY: "auto",

                        paddingTop: !isAuthenticated ? 36 : 0,
                      }}
                    >
                      {" "}
                      <div style={styles.infoBox}>
                        {" "}
                        <div
                          style={{
                            ...styles.infoHeader,

                            display: "flex",

                            justifyContent: "space-between",
                          }}
                        >
                          {" "}
                          <span>Proceso de Reparación</span>{" "}
                          {loadingCycle && (
                            <span style={{ fontSize: 10, color: "#888" }}>
                              Cargando...
                            </span>
                          )}{" "}
                        </div>{" "}
                        <div style={{ padding: "12px 14px" }}>
                          {" "}
                          {[
                            {
                              key: "bajado",

                              label: "Bajado:",

                              value: repairProcess.bajado,

                              canMark: false,
                            },

                            {
                              key: "recepcionTaller",

                              label: "Recepción en Taller:",

                              value: repairProcess.recepcionTaller,

                              canMark: true,
                            },

                            {
                              key: "inicioReparacion",

                              label: "Inicio Reparación:",

                              value: repairProcess.inicioReparacion,

                              canMark: true,
                            },

                            {
                              key: "termino",

                              label: "Terminó:",

                              value: repairProcess.termino,

                              canMark: true,
                            },
                          ].map((step, i) => (
                            <div
                              key={step.key}
                              style={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                padding: "6px 0",

                                borderBottom:
                                  i < 3
                                    ? "1px solid rgba(0,255,136,0.1)"
                                    : "none",
                              }}
                            >
                              {" "}
                              <span style={{ color: "#888", fontSize: 11 }}>
                                {step.label}
                              </span>{" "}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                {" "}
                                <span
                                  style={{
                                    color: step.value ? "#00ff88" : "#666",

                                    fontSize: 11,

                                    fontWeight: 500,
                                  }}
                                >
                                  {formatDateTime(step.value)}
                                </span>{" "}
                                {!step.value &&
                                  step.canMark &&
                                  repairCycle &&
                                  isAuthenticated && (
                                    <button
                                      onClick={() => handleMarkStep(step.key)}
                                      style={{
                                        background: "rgba(0,255,136,0.2)",

                                        border: "1px solid rgba(0,255,136,0.4)",

                                        borderRadius: 4,

                                        padding: "2px 8px",

                                        color: "#00ff88",

                                        fontSize: 9,

                                        cursor: "pointer",
                                      }}
                                    >
                                      Marcar
                                    </button>
                                  )}{" "}
                              </div>{" "}
                            </div>
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                      <div style={{ ...styles.infoBox, flex: 1 }}>
                        {" "}
                        <div style={styles.infoHeader}>
                          Técnicos Participantes
                        </div>{" "}
                        <div
                          style={{
                            display: "grid",

                            gridTemplateColumns:
                              "2fr 0.5fr 1fr 1fr 0.8fr 0.5fr",

                            background: "rgba(0,0,0,0.2)",

                            borderBottom: "1px solid rgba(0,255,136,0.15)",
                          }}
                        >
                          {" "}
                          {["Nombre", "Grupo", "Inicio", "Fin", "Tipo", ""].map(
                            (h, idx) => (
                              <div
                                key={h || `col-${idx}`}
                                style={{
                                  padding: "8px 10px",

                                  color: "#888",

                                  fontSize: 9,

                                  fontWeight: 600,

                                  textTransform: "uppercase",
                                }}
                              >
                                {h}
                              </div>
                            ),
                          )}{" "}
                        </div>{" "}
                        <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                          {" "}
                          {technicians.length > 0 ? (
                            technicians.map((tech) => (
                              <div
                                key={tech.id}
                                style={{
                                  display: "grid",

                                  gridTemplateColumns:
                                    "2fr 0.5fr 1fr 1fr 0.8fr 0.5fr",

                                  borderBottom:
                                    "1px solid rgba(0,255,136,0.08)",

                                  alignItems: "center",
                                }}
                              >
                                {" "}
                                <div
                                  style={{
                                    padding: "8px 10px",

                                    color: "#fff",

                                    fontSize: 10,
                                  }}
                                >
                                  {tech.empleado_nombre}
                                </div>{" "}
                                <div
                                  style={{
                                    padding: "8px 10px",

                                    color: "#888",

                                    fontSize: 10,
                                  }}
                                >
                                  {tech.grupo || "-"}
                                </div>{" "}
                                <div
                                  style={{
                                    padding: "8px 10px",

                                    color: "#888",

                                    fontSize: 9,
                                  }}
                                >
                                  {tech.fecha_inicio
                                    ? new Date(
                                        tech.fecha_inicio,
                                      ).toLocaleTimeString(
                                        "es-MX",

                                        { hour: "2-digit", minute: "2-digit" },
                                      )
                                    : "-"}
                                </div>{" "}
                                <div
                                  style={{
                                    padding: "8px 10px",

                                    color: "#888",

                                    fontSize: 9,
                                  }}
                                >
                                  {tech.fecha_fin
                                    ? new Date(
                                        tech.fecha_fin,
                                      ).toLocaleTimeString(
                                        "es-MX",

                                        { hour: "2-digit", minute: "2-digit" },
                                      )
                                    : "-"}
                                </div>{" "}
                                <div
                                  style={{
                                    padding: "8px 10px",

                                    color: "#00e5ff",

                                    fontSize: 10,
                                  }}
                                >
                                  {tech.tipo || "Técnico"}
                                </div>{" "}
                                <div style={{ padding: "8px 10px" }}>
                                  {" "}
                                  {!tech.fecha_fin && isAuthenticated && (
                                    <button
                                      onClick={() =>
                                        handleRemoveTechnician(tech.id)
                                      }
                                      style={{
                                        background: "rgba(255,68,102,0.2)",

                                        border:
                                          "1px solid rgba(255,68,102,0.4)",

                                        borderRadius: 4,

                                        padding: "2px 6px",

                                        color: "#ff4466",

                                        fontSize: 8,

                                        cursor: "pointer",
                                      }}
                                    >
                                      ✕
                                    </button>
                                  )}{" "}
                                </div>{" "}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: "20px",

                                textAlign: "center",

                                color: "rgba(255,255,255,0.3)",

                                fontSize: 11,
                              }}
                            >
                              No hay técnicos asignados
                            </div>
                          )}{" "}
                        </div>{" "}
                      </div>{" "}
                      {/*agregar tecnicos*/}{" "}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-end",
                        }}
                      >
                        {" "}
                        <div style={{ flex: 2 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Técnico / Supervisor:
                          </label>{" "}
                          <input
                            type="text"
                            placeholder="Nombre..."
                            value={newTechnician.nombre}
                            onChange={handleTechNombreChange}
                            disabled={!repairCycle || !isAuthenticated}
                            style={{
                              ...styles.input,

                              opacity: repairCycle && isAuthenticated ? 1 : 0.5,
                            }}
                          />{" "}
                        </div>{" "}
                        <div style={{ width: 70 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Grupo:
                          </label>{" "}
                          <select
                            value={newTechnician.grupo}
                            onChange={handleTechGrupoChange}
                            disabled={!repairCycle || !isAuthenticated}
                            style={{
                              ...styles.select,

                              opacity: repairCycle && isAuthenticated ? 1 : 0.5,
                            }}
                          >
                            {" "}
                            <option value="">-</option>{" "}
                            <option value="1">1</option>{" "}
                            <option value="2">2</option>{" "}
                            <option value="3">3</option>{" "}
                          </select>{" "}
                        </div>{" "}
                        <div style={{ width: 90 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Tipo:
                          </label>{" "}
                          <select
                            value={newTechnician.tipo}
                            onChange={handleTechTipoChange}
                            disabled={!repairCycle || !isAuthenticated}
                            style={{
                              ...styles.select,

                              opacity: repairCycle && isAuthenticated ? 1 : 0.5,
                            }}
                          >
                            {" "}
                            <option value="Técnico">Técnico</option>{" "}
                            <option value="Supervisor">Supervisor</option>{" "}
                            <option value="Apoyo">Apoyo</option>{" "}
                          </select>{" "}
                        </div>{" "}
                        <button
                          onClick={handleAddTechnician}
                          disabled={
                            !newTechnician.nombre.trim() ||
                            savingTechnician ||
                            !repairCycle ||
                            !isAuthenticated
                          }
                          style={getBtnStyle(
                            newTechnician.nombre.trim() &&
                              !savingTechnician &&
                              repairCycle &&
                              isAuthenticated,
                          )}
                        >
                          {" "}
                          {savingTechnician ? "..." : "+ Agregar"}{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                    {/*barra lateral*/}{" "}
                    <div
                      style={{
                        width: "280px",

                        minWidth: "280px",

                        background: "rgba(0,0,0,0.2)",

                        borderRadius: 10,

                        border: "1px solid rgba(0,255,136,0.15)",

                        padding: "14px",

                        display: "flex",

                        flexDirection: "column",

                        gap: "14px",

                        overflowY: "auto",
                      }}
                    >
                      {" "}
                      <div
                        style={{
                          background: "rgba(0,255,136,0.1)",

                          padding: "10px 12px",

                          borderRadius: 6,

                          fontSize: 11,

                          fontWeight: 600,

                          color: "#00ff88",

                          textTransform: "uppercase",

                          textAlign: "center",
                        }}
                      >
                        Opciones Adicionales
                      </div>{" "}
                      <div>
                        {" "}
                        <label
                          style={{
                            display: "block",

                            color: "#888",

                            fontSize: 10,

                            marginBottom: 4,
                          }}
                        >
                          A) Agregar Detalle:
                        </label>{" "}
                        <div style={{ display: "flex", gap: 6 }}>
                          {" "}
                          <select
                            value={additionalOptions.detalleId}
                            onChange={handleDetalleIdChange}
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.select,

                              flex: 1,

                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          >
                            {" "}
                            <option value="">Seleccionar...</option>{" "}
                            {fallas.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.description}
                              </option>
                            ))}{" "}
                          </select>{" "}
                          <button
                            onClick={handleAddDetail}
                            disabled={
                              !additionalOptions.detalleId ||
                              !repairCycle ||
                              !isAuthenticated
                            }
                            style={{
                              ...getBtnStyle(
                                additionalOptions.detalleId &&
                                  repairCycle &&
                                  isAuthenticated,
                              ),

                              padding: "8px",
                            }}
                          >
                            +
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <label
                          style={{
                            display: "block",

                            color: "#888",

                            fontSize: 10,

                            marginBottom: 4,
                          }}
                        >
                          B) Cambio de Modelo:
                        </label>{" "}
                        <select
                          value={additionalOptions.cambioModeloId}
                          onChange={handleCambioModeloIdChange}
                          disabled={!isAuthenticated}
                          style={{
                            ...styles.select,
                            opacity: isAuthenticated ? 1 : 0.5,
                          }}
                        >
                          {" "}
                          <option value="">
                            {" "}
                            {loadingModelos
                              ? "Cargando modelos..."
                              : modelosTroquel.length === 0
                                ? "Sin modelos registrados"
                                : "Seleccionar..."}{" "}
                          </option>{" "}
                          {modelosTroquel.map((m) => (
                            <option key={m.id_modelo} value={m.nombre_modelo}>
                              {m.nombre_modelo}
                            </option>
                          ))}{" "}
                        </select>{" "}
                      </div>{" "}
                      <div
                        style={{
                          background: "rgba(255,170,0,0.1)",

                          border: "1px solid rgba(255,170,0,0.2)",

                          borderRadius: 8,

                          padding: "12px",
                        }}
                      >
                        {" "}
                        <label
                          style={{
                            display: "block",

                            color: "#ffaa00",

                            fontSize: 10,

                            marginBottom: 8,

                            fontWeight: 600,
                          }}
                        >
                          C) Pendiente de Reparar:
                        </label>{" "}
                        <div style={{ marginBottom: 8 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Fecha Liberación:
                          </label>{" "}
                          <input
                            type="date"
                            value={additionalOptions.fechaLiberacion}
                            onChange={handleFechaLiberacionChange}
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.input,
                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          />{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Motivo:
                          </label>{" "}
                          <textarea
                            value={additionalOptions.motivoPendiente}
                            onChange={handleMotivoPendienteChange}
                            placeholder="Motivo..."
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.input,

                              height: 50,

                              resize: "none",

                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          />{" "}
                        </div>{" "}
                        {additionalOptions.fechaLiberacion &&
                          isAuthenticated && (
                            <button
                              onClick={handleSavePending}
                              disabled={savingOptions || !repairCycle}
                              style={{
                                width: "100%",

                                marginTop: 10,

                                padding: "10px",

                                background:
                                  savingOptions || !repairCycle
                                    ? "rgba(100,100,100,0.3)"
                                    : "linear-gradient(135deg, #ffaa00, #ff8800)",

                                border: "1px solid #ffaa00",

                                borderRadius: 6,

                                color: "#000",

                                fontSize: 11,

                                fontWeight: 700,

                                cursor:
                                  savingOptions || !repairCycle
                                    ? "not-allowed"
                                    : "pointer",

                                textTransform: "uppercase",
                              }}
                            >
                              {" "}
                              {savingOptions
                                ? "Guardando..."
                                : "Guardar Pendiente"}{" "}
                            </button>
                          )}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <label
                          style={{
                            display: "block",

                            color: "#888",

                            fontSize: 10,

                            marginBottom: 4,
                          }}
                        >
                          Prioridad:
                        </label>{" "}
                        <select
                          value={additionalOptions.prioridadReparacion}
                          onChange={handlePriorityChange}
                          disabled={!repairCycle || !isAuthenticated}
                          style={{
                            ...styles.select,

                            opacity: repairCycle && isAuthenticated ? 1 : 0.5,
                          }}
                        >
                          {" "}
                          <option value="">Seleccionar...</option>{" "}
                          <option value="1">1 - Alta</option>{" "}
                          <option value="2">2 - Media</option>{" "}
                          <option value="3">3 - Baja</option>{" "}
                        </select>{" "}
                      </div>{" "}
                      <div
                        style={{
                          background: "rgba(0,255,136,0.1)",

                          border: "1px solid rgba(0,255,136,0.3)",

                          borderRadius: 8,

                          padding: "12px",

                          marginTop: "auto",
                        }}
                      >
                        {" "}
                        <label
                          style={{
                            display: "block",

                            color: "#00ff88",

                            fontSize: 10,

                            marginBottom: 8,

                            fontWeight: 600,

                            textTransform: "uppercase",
                          }}
                        >
                          Completar Reparación:
                        </label>{" "}
                        <div style={{ marginBottom: 8 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Empleado:
                          </label>{" "}
                          <input
                            type="text"
                            placeholder="Nombre..."
                            value={completeForm.empleado}
                            onChange={handleEmpleadoChange}
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.input,
                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          />{" "}
                        </div>{" "}
                        <div style={{ marginBottom: 8 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Nuevo Status:
                          </label>{" "}
                          <select
                            value={completeForm.newStatus}
                            onChange={handleNewStatusChange}
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.select,
                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          >
                            {" "}
                            <option value="Listo">Listo</option>{" "}
                            <option value="Listo-BackUp">
                              Listo-BackUp
                            </option>{" "}
                          </select>{" "}
                        </div>{" "}
                        <div style={{ marginBottom: 8 }}>
                          {" "}
                          <label
                            style={{
                              display: "block",

                              color: "#888",

                              fontSize: 10,

                              marginBottom: 4,
                            }}
                          >
                            Comentarios:
                          </label>{" "}
                          <textarea
                            value={completeForm.comentarios}
                            onChange={handleComentariosChange}
                            placeholder="Comentarios..."
                            disabled={!isAuthenticated}
                            style={{
                              ...styles.input,

                              height: 50,

                              resize: "none",

                              opacity: isAuthenticated ? 1 : 0.5,
                            }}
                          />{" "}
                        </div>{" "}
                        <button
                          onClick={handleCompleteRepair}
                          disabled={
                            completing ||
                            !repairProcess.termino ||
                            !completeForm.empleado.trim() ||
                            !isAuthenticated
                          }
                          style={{
                            width: "100%",

                            padding: "12px",

                            background:
                              completing ||
                              !repairProcess.termino ||
                              !completeForm.empleado.trim() ||
                              !isAuthenticated
                                ? "rgba(100,100,100,0.3)"
                                : "linear-gradient(135deg, #00ff88, #00cc6a)",

                            border: "none",

                            borderRadius: 6,

                            color: "#000",

                            fontSize: 12,

                            fontWeight: 700,

                            cursor:
                              completing ||
                              !repairProcess.termino ||
                              !completeForm.empleado.trim() ||
                              !isAuthenticated
                                ? "not-allowed"
                                : "pointer",

                            textTransform: "uppercase",

                            boxShadow:
                              completing ||
                              !repairProcess.termino ||
                              !completeForm.empleado.trim() ||
                              !isAuthenticated
                                ? "none"
                                : "0 0 15px rgba(0,255,136,0.4)",
                          }}
                        >
                          {" "}
                          {completing
                            ? "Completando..."
                            : "Completar Reparación"}{" "}
                        </button>{" "}
                        {!repairProcess.termino && (
                          <div
                            style={{
                              marginTop: 8,

                              fontSize: 9,

                              color: "#ff4466",

                              textAlign: "center",
                            }}
                          >
                            * Debe marcar "Terminó" antes de completar
                          </div>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {" "}
                    {loadingHistory ? (
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          height: "100%",

                          color: "#00ff88",
                        }}
                      >
                        Cargando historial...
                      </div>
                    ) : (
                      <div style={{ flex: 1, overflowY: "auto" }}>
                        {" "}
                        {cycleHistory.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            {" "}
                            <div
                              style={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                marginBottom: 12,

                                padding: "10px 14px",

                                background: "rgba(255,170,0,0.1)",

                                borderRadius: 8,

                                border: "1px solid rgba(255,170,0,0.2)",
                              }}
                            >
                              {" "}
                              <span
                                style={{
                                  color: "#ffaa00",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                Ciclos de Reparación: {cycleHistory.length}
                              </span>{" "}
                            </div>{" "}
                            {cycleHistory.map((cycle) => (
                              <div
                                key={cycle.id}
                                style={{
                                  background: "rgba(0,0,0,0.3)",

                                  borderRadius: 10,

                                  padding: "14px 16px",

                                  marginBottom: 12,

                                  borderLeft: `4px solid ${cycle.ciclo_activo ? "#ffaa00" : "#00ff88"}`,
                                }}
                              >
                                {" "}
                                <div
                                  style={{
                                    display: "flex",

                                    justifyContent: "space-between",

                                    marginBottom: 10,
                                  }}
                                >
                                  {" "}
                                  <span
                                    style={{
                                      color: cycle.ciclo_activo
                                        ? "#ffaa00"
                                        : "#00ff88",

                                      fontWeight: 700,

                                      fontSize: 13,
                                    }}
                                  >
                                    Ciclo #{cycle.id}{" "}
                                    {cycle.ciclo_activo && "(Activo)"}
                                  </span>{" "}
                                  <span style={{ color: "#888", fontSize: 11 }}>
                                    {cycle.clasificacion_tiempo ||
                                      "En progreso"}
                                  </span>{" "}
                                </div>{" "}
                                <div
                                  style={{
                                    display: "grid",

                                    gridTemplateColumns: "1fr 1fr",

                                    gap: 8,
                                  }}
                                >
                                  {" "}
                                  <div>
                                    <span
                                      style={{ color: "#888", fontSize: 10 }}
                                    >
                                      Inicio:{" "}
                                    </span>

                                    <span
                                      style={{ color: "#fff", fontSize: 10 }}
                                    >
                                      {formatDateTime(
                                        cycle.fecha_inicio_reparacion,
                                      )}
                                    </span>
                                  </div>{" "}
                                  <div>
                                    <span
                                      style={{ color: "#888", fontSize: 10 }}
                                    >
                                      Fin:{" "}
                                    </span>

                                    <span
                                      style={{ color: "#fff", fontSize: 10 }}
                                    >
                                      {formatDateTime(
                                        cycle.fecha_fin_reparacion,
                                      )}
                                    </span>
                                  </div>{" "}
                                  <div>
                                    <span
                                      style={{ color: "#888", fontSize: 10 }}
                                    >
                                      Motivo:{" "}
                                    </span>

                                    <span
                                      style={{ color: "#fff", fontSize: 10 }}
                                    >
                                      {cycle.motivo_entrada}
                                    </span>
                                  </div>{" "}
                                  <div>
                                    <span
                                      style={{ color: "#888", fontSize: 10 }}
                                    >
                                      Duración:{" "}
                                    </span>

                                    <span
                                      style={{ color: "#00e5ff", fontSize: 10 }}
                                    >
                                      {cycle.tiempo_reparacion_horas
                                        ? `${parseFloat(cycle.tiempo_reparacion_horas).toFixed(1)}h`
                                        : "-"}
                                    </span>
                                  </div>{" "}
                                </div>{" "}
                                {cycle.falla_descripcion && (
                                  <div
                                    style={{
                                      marginTop: 8,

                                      padding: "6px 8px",

                                      background: "rgba(255,68,102,0.1)",

                                      borderRadius: 4,
                                    }}
                                  >
                                    <span
                                      style={{ color: "#ff4466", fontSize: 10 }}
                                    >
                                      Falla: {cycle.falla_descripcion}
                                    </span>
                                  </div>
                                )}{" "}
                              </div>
                            ))}{" "}
                          </div>
                        )}{" "}
                        {history.length > 0 && (
                          <>
                            {" "}
                            <div
                              style={{
                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center",

                                marginBottom: 12,

                                padding: "10px 14px",

                                background: "rgba(255,255,255,0.05)",

                                borderRadius: 8,
                              }}
                            >
                              {" "}
                              <span
                                style={{
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                Acciones: {history.length} registros
                              </span>{" "}
                            </div>{" "}
                            {history.map((h, i) => (
                              <div
                                key={h.id || i}
                                style={{
                                  background: "rgba(0,0,0,0.3)",

                                  borderRadius: 10,

                                  padding: "14px 16px",

                                  marginBottom: 12,

                                  borderLeft: `4px solid ${h.action_type === "asistencia_prensa" || h.action_type === "asistencia_maquina" ? "#00e5ff" : "#00ff88"}`,
                                }}
                              >
                                {" "}
                                <div
                                  style={{
                                    display: "flex",

                                    justifyContent: "space-between",

                                    marginBottom: 8,
                                  }}
                                >
                                  {" "}
                                  <span
                                    style={{
                                      color:
                                        h.action_type === "asistencia_prensa" ||
                                        h.action_type === "asistencia_maquina"
                                          ? "#00e5ff"
                                          : "#00ff88",

                                      fontWeight: 700,

                                      fontSize: 12,
                                    }}
                                  >
                                    {h.action_type === "baja_troquel" ||
                                    h.action_type === "baja_molde"
                                      ? isMolde
                                        ? "Baja de Molde"
                                        : "Baja de Troquel"
                                      : h.action_type === "asistencia_prensa" ||
                                          h.action_type === "asistencia_maquina"
                                        ? isMolde
                                          ? "Asistencia en Máquina"
                                          : "Asistencia en Prensa"
                                        : h.action_type}
                                  </span>{" "}
                                  <span style={{ color: "#888", fontSize: 11 }}>
                                    {formatDateTime(h.created_at)}
                                  </span>{" "}
                                </div>{" "}
                                <div style={{ color: "#fff", fontSize: 11 }}>
                                  {h.tipo_accion}
                                </div>{" "}
                                {h.falla_description && (
                                  <div
                                    style={{
                                      color: "#ff4466",

                                      fontSize: 10,

                                      marginTop: 4,
                                    }}
                                  >
                                    Falla: {h.falla_description}
                                  </div>
                                )}{" "}
                                {h.empleado && (
                                  <div
                                    style={{
                                      color: "#ffc800",

                                      fontSize: 10,

                                      marginTop: 4,
                                    }}
                                  >
                                    Por: {h.empleado}
                                  </div>
                                )}{" "}
                              </div>
                            ))}{" "}
                          </>
                        )}{" "}
                        {history.length === 0 && cycleHistory.length === 0 && (
                          <div
                            style={{
                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              height: "100%",

                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            No hay historial disponible
                          </div>
                        )}{" "}
                      </div>
                    )}{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              padding: "12px 20px",

              borderTop: "1px solid rgba(0,255,136,0.2)",

              background: "rgba(0,0,0,0.2)",
            }}
          >
            {" "}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {" "}
              <span style={{ fontSize: 14 }}>{isMolde ? "" : ""}</span>{" "}
              <span style={{ color: "#888", fontSize: 11 }}>
                E-Kanban Tool Room
              </span>{" "}
              {repairCycle && (
                <span
                  style={{
                    color: "#00ff88",

                    fontSize: 10,

                    marginLeft: 12,

                    background: "rgba(0,255,136,0.1)",

                    padding: "3px 8px",

                    borderRadius: 4,
                  }}
                >
                  Ciclo #{repairCycle.id} activo
                </span>
              )}{" "}
            </div>{" "}
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",

                border: "1px solid rgba(255,255,255,0.2)",

                borderRadius: 6,

                padding: "8px 20px",

                color: "#fff",

                fontSize: 11,

                cursor: "pointer",
              }}
            >
              Cerrar (Esc)
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  },
);

export default RepairModal;
