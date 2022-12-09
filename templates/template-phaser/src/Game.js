import Phaser from "phaser";
import * as client from "@urturn/client";

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
    this.state = client.getRoomState() || {};
    this.curPlr = null;
    this.recentErrorMsg = null;
  }
  preload() {
    this.load.image("logo", "./assets/urturnIcon.png");
  }

  create() {
    // getting the center of the canvas
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const image = this.add.image(centerX - 400, centerY, "logo");
    image.setScale(0.1, 0.1)
    this.add.text(centerX, centerY, "TODO: Make UrTurn Game 🚀", {
      fontSize: 50,
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
    }).setOrigin();

    const onStateChanged = (newRoomState) => {
      this.state = newRoomState;
    };
    client.events.on("stateChanged", onStateChanged);

    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      this.curPlr = newCurPlr;
      this.add.text(centerX, centerY + 100, "current user: " + this.curPlr.username, {
        fontSize: 40,
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
      }).setOrigin();
    };
    setupCurPlr();
  }
  update() {}
}

const config = {
  type: Phaser.AUTO,
  parent: "phaser",
  scale: {
    parent: "phaser",
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: Demo,
};

const game = new Phaser.Game(config);
