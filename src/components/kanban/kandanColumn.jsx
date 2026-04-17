import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./kandanTaskCard";

export default function kandanColumn({ column }) {

    return (
        <Droppable droppableId={String(column.id)}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>

                    <h3>{column.name}</h3>

                    {column.tasks.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                        />
                    ))}

                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
}