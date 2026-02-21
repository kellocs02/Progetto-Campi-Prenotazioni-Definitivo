'use client'
import { useState } from "react";

function App() {
    const [nome,setNome] = useState("") 

    //Dentro e ci sono info tipo: chi ha generato l’evento che tipo di evento è metodi per controllarlo (tipo preventDefault) => {
    //e è un oggetto creato dal browser,contiene tutte le informazioni su quello che è successo
    const handleSubmit = (e) => {  //crea una funzione ,(e) È l’evento generato dal browser quando il form viene inviato.
        e.preventDefault(); //blocca il comportamento automatico del browser. normalemente quando si preme invio, il browser ricarica la pagina, questa riga gli dice di non farlo
        console.log(nome)
        console.log(e.target)
    }

  return (
    <div className="bg-amber-500 min-h-screen flex">
      <div className="bg-blue-300 p-20 mx-auto w-64">
        Benvenuto
      </div>
      <div className="bg-gray-800 p-10 absolute top-10 right-20">
        Ciao
      </div>
        <form  onSubmit={handleSubmit} className="bg-white p-10 rounded-lg">
            <input type="text" placeholder="Scrivi il nome" value={nome} onChange={(ev) => setNome(ev.target.value)} className="border p-2 rounded" />
        </form>
    </div>
  );
}
export default App; //Esporta il componente così altri file possono importarlo e usarlo.