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
    this.load.image("logo", "/assets/phaser3-logo.png");
  }

  create() {
    // getting the center of the canvas
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add.image(centerX, centerY, "logo");

    const onStateChanged = (newRoomState) => {
      this.state = newRoomState;
    };
    client.events.on("stateChanged", onStateChanged);

    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      this.curPlr = newCurPlr;
      this.add.text(centerX, centerY + 100, this.curPlr.username, {
        fontSize: 50,
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
