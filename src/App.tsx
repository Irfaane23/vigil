import { useEffect } from "react";
import "./App.css";

export default function App() {
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
        };

        return () => {
            ws.close();
        };
    }, []);

    return <div>Vitals streaming...</div>;
}
