import { useEffect, useState } from "react";
import api from "../api/api";

export default function Tasks() {

    const [tasks, setTasks] = useState([]);
    const [titre, setTitre] = useState("");
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState("");

    // charger les tasks
    const fetchTasks = async () => {

    const res = await api.get("/projects/1/tasks");
    setTasks(res.data);

    res.data.forEach(task => {
        fetchComments(task.id);
    });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // créer task
    const createTask = async () => {

        await api.post("/tasks", {
            titre: titre,
            project_id: 1
        });

        setTitre("");
        fetchTasks();
    };

    // supprimer
    const deleteTask = async (id) => {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
    };

    const fetchComments = async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/comments`);

    setComments(prev => ({
        ...prev,
        [taskId]: res.data
    }));
    };


    const addComment = async (taskId) => {

    await api.post(`/tasks/${taskId}/comments`, {
        contenu: newComment
    });

    setNewComment("");
    fetchComments(taskId);
};

    return (
        <div>
            <h2>Mes tâches</h2>

            <input
                value={titre}
                onChange={(e)=>setTitre(e.target.value)}
                placeholder="Nouvelle tâche"
            />

            <button onClick={createTask}>
                Ajouter
            </button>

            <ul>
                {tasks.map(task => (
                    <li key={task.id}>

                        <strong>{task.titre}</strong>

                        <button onClick={()=>deleteTask(task.id)}>
                            Supprimer
                        </button>

                        {/* COMMENTAIRES */}
                        <ul>
                            {(comments[task.id] || []).map(comment => (
                                <li key={comment.id}>
                                    {comment.contenu}
                                </li>
                            ))}
                        </ul>

                        <input
                            placeholder="Ajouter commentaire"
                            value={newComment}
                            onChange={(e)=>setNewComment(e.target.value)}
                        />

                        <button onClick={()=>addComment(task.id)}>
                            Commenter
                        </button>

                    </li>
                ))}
            </ul>
        </div>
    );
}