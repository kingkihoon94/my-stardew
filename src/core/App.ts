import { Application } from '@pixi/app';
import { FarmScene } from '../scenes/FarmScene';

export class App {
  public app: Application;

  constructor() {
    this.app = new Application({
      width: 1000,
      height: 608,
      backgroundColor: '#ffffff'
    });
    document.body.appendChild(this.app.view as HTMLCanvasElement);

    new FarmScene(this.app.stage);
  }
}
