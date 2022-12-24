import * as client from "@urturn/client";
import { Application, Sprite, Text } from 'pixi.js'

const app = new Application({
	view: document.getElementById("pixi-canvas"),
	resolution: window.devicePixelRatio || 1,
	resizeTo: window,
	autoDensity: true,
	backgroundColor: 0x000000,
});

const icon = Sprite.from("assets/urturnIcon.png");

icon.anchor.set(0.5);
icon.x = app.screen.width / 2;
icon.y = app.screen.height / 2 + 50;
icon.height = 50;
icon.width = 50;

const basicText = new Text('TODO: Make the frontend of your game!', {
	fill: 'white'
});
basicText.anchor.set(0.5);
basicText.x = app.screen.width / 2;
basicText.y = app.screen.height / 2;

app.stage.addChild(icon);
app.stage.addChild(basicText);

client.events.on('stateChanged', (newRoomState) => {
	console.log('new roomState:', newRoomState);
});
