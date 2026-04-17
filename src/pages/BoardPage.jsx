import { useEffect, useState } from "react";
import API from "../api/api";
import Board from "../components/kanban/kanbanBoard";

export default function BoardPage({ projectId }) {

    const [columns, setColumns] = useState([]);

    useEffect(() => {
        loadBoard();
    }, []);

    const loadBoard = async () => {
        const res = await API.get(`/projects/${projectId}/board`);
        setColumns(res.data);
    };

    return <Board columns={columns} setColumns={setColumns} />;
}