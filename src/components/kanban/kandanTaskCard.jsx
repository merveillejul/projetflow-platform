import { Draggable } from "react-beautiful-dnd";

export default function kandanTaskCard({ task, index }) {

    const assignTask = async (taskId,userId)=>{
        await api.put(`/tasks/${taskId}`,{
            assigned_to:userId
        });

        fetchTasks();
    };

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    {task.title}

                    <p>
                    👤 {task.assigned_user?.nom || "Non assigné"}
                    </p>

                    <select
                    onChange={(e)=>assignTask(task.id,e.target.value)}
                    >
                    <option>Assigner</option>

                    {members.map(user=>(
                    <option key={user.id} value={user.id}>
                    {user.nom}
                    </option>
                    ))}

                    </select>

                </div>
            )}
        </Draggable>
    );
}