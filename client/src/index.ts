import "./main.scss";
import { Scene } from "./graphics/graphics";



const canvas: HTMLCanvasElement = document.querySelector("#glcanvas");

let renderer = new Scene();
renderer.render();