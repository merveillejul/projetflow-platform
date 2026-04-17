import { useEffect, useState } from "react";
// APRÈS — fichier qui existe déjà
import {
    getMembers as getProjectMembers,
    addMember as addProjectMember
} from "../services/projectService";

export default function ProjectMembers({ projectId }) {

    const [members, setMembers] = useState([]);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        const res = await getProjectMembers(projectId);
        setMembers(res.data);
    };

    const handleAddMember = async () => {
        if (!userId) return;

        await addProjectMember(projectId, userId);
        setUserId("");
        loadMembers();
    };

    return (
        <div>

            <h2>Membres du projet</h2>

            {/* Liste membres */}
            {members.map(member => (
                <p key={member.id}>
                    {member.name}
                </p>
            ))}

            <hr />

            {/* Ajouter membre */}
            <h3>Ajouter un membre</h3>

            <input
                type="text"
                placeholder="ID utilisateur"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />

            <button onClick={handleAddMember}>
                Ajouter
            </button>

        </div>
    );
}