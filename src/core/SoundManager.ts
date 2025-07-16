import { Howl } from 'howler';
import farmBGM1 from '../assets/bgm/bgm_1.mp3';
import farmBGM2 from '../assets/bgm/bgm_2.mp3';
import choppingEffect from '../assets/soundEffect/chopping.wav';
import miningEffect from '../assets/soundEffect/mining.wav';
import wateringEffect from '../assets/soundEffect/watering.wav';
import diggingEffect from '../assets/soundEffect/digging.wav';

export class SoundManager {
  private static bgms: Howl[];
  private static currentBGMIndex: number = 0;
  private static effects: Record<string, Howl> = {};

  public static init(): void {
    this.bgms = [
      new Howl({ src: [farmBGM1], volume: 0.3 }),
      new Howl({ src: [farmBGM2], volume: 0.3 }),
    ];

    this.effects = {
      chop: new Howl({ src: [choppingEffect], volume: 1 }),
      mine: new Howl({ src: [miningEffect], volume: 1 }),
      water: new Howl({ src: [wateringEffect], volume: 1 }),
      dig: new Howl({ src: [diggingEffect], volume: 1 }),
    };
    this.playNextBGM();
  }

  private static playNextBGM(): void {
    const currentBGM = this.bgms[this.currentBGMIndex];
    currentBGM.play();
    currentBGM.once('end', () => {
      this.currentBGMIndex = (this.currentBGMIndex + 1) % this.bgms.length;
      this.playNextBGM();
    });
  }

  public static playEffect(name: 'chop' | 'mine' | 'water' | 'dig'): void {
    this.effects[name]?.play();
  }
}
