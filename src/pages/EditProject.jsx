import {useState,useEffect} from "react";
import {useParams,useNavigate} from "react-router-dom";
import API from "../api/api";

export default function EditProject(){

    const {id} = useParams();
    const navigate = useNavigate();

    const [titre,setTitre]=useState("");
    const [description,setDescription]=useState("");

    // Charger projet
    useEffect(()=>{

        API.get(`/projects/${id}`)
        .then(res=>{
            setTitre(res.data.titre);
            setDescription(res.data.description);
        });

    },[id]);

    // UPDATE
    const handleSubmit = async(e)=>{
        e.preventDefault();

        try{
            await API.put(`/projects/${id}`,{
                titre,
                description
            });

            alert("Projet modifié ✅");
            navigate("/dashboard");

        }catch{
            alert("Erreur modification");
        }
    };

    return(
        <form onSubmit={handleSubmit}>
            <h2>Modifier projet</h2>

            <input
                value={titre}
                onChange={e=>setTitre(e.target.value)}
            />

            <textarea
                value={description}
                onChange={e=>setDescription(e.target.value)}
            />

            <button>Modifier</button>
        </form>
    );
}