import { useState } from "react";
import API from "../api/api";

export default function Register(){

const [form,setForm]=useState({
    username:"",
    nom:"",
    email:"",
    password:""
});

const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
}

const handleSubmit=async(e)=>{
    e.preventDefault();

    try{
        const res=await API.post("/register",form);

        console.log(res.data);

        localStorage.setItem("token",res.data.token);

        alert("Compte créé !");
    }
    catch(err){
        console.log(err.response.data); // IMPORTANT
        alert("Erreur inscription");
    }
}

return(
<form onSubmit={handleSubmit}>

<input name="username" value={form.username} onChange={handleChange} placeholder="username"/>
<input name="nom" value={form.nom} onChange={handleChange} placeholder="nom"/>
<input name="email" value={form.email} onChange={handleChange} placeholder="email"/>
<input name="password" value={form.password} onChange={handleChange} type="password" placeholder="password"/>

<button type="submit">Créer compte</button>

</form>
);
}