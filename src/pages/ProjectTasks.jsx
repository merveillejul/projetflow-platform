import { useEffect, useState } from "react";
import {
    getTasks,
    createTask,
    deleteTask
} from "../services/taskService";

export default function ProjectTasks({ projectId }) {

    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");

    const fetchTasks = async () => {
        const res = await getTasks(projectId);
        setTasks(res.data);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async () => {
        if (!title) return;

        await createTask(projectId, { title });
        setTitle("");
        fetchTasks();
    };

    const removeTask = async (id) => {
        await deleteTask(id);
        fetchTasks();
    };

    return (
        <div>

            <h2>Tâches</h2>

            <input
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="Nouvelle tâche"
            />

            <button onClick={addTask}>
                Ajouter
            </button>

            {tasks.map(task => (
                <div key={task.id}>
                    {task.title}
                    <button onClick={()=>removeTask(task.id)}>
                        Supprimer
                    </button>
                </div>
            ))}

        </div>
    );
}