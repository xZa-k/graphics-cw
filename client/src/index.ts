import "./main.scss";
import { Scene } from "./graphics/graphics";



const canvas: HTMLCanvasElement = document.querySelector("#glcanvas");

let renderer = new Scene();

requestAnimationFrame((now) => {
    renderer.render(now);
});


async function readFile() {
    try {
        const response = await fetch('./texture.vert');
        const fileContent = await response.text();
        // console.log(fileContent);
    } catch (error) {
        // console.error(error);
    }
}

readFile();