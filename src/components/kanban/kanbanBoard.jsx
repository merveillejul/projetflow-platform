import { useEffect, useState } from "react";
import api from "../../api/api";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({ projectId }) {

    const [tasks, setTasks] = useState([]);

    const fetchTasks = async () => {
        const res = await api.get(`/projects/${projectId}/tasks`);
        setTasks(res.data);
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const aFaire = tasks.filter(t => t.statut === "a_faire");
    const enCours = tasks.filter(t => t.statut === "en_cours");
    const termine = tasks.filter(t => t.statut === "termine");

    return (
        <div className="kanban-board">

            <KanbanColumn title="À faire" tasks={aFaire} />
            <KanbanColumn title="En cours" tasks={enCours} />
            <KanbanColumn title="Terminé" tasks={termine} />

        </div>
    );
}