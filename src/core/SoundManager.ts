import { Howl } from 'howler';
import { SoundEffect } from '../types/SoundEffect';

import farmBGM1 from '../assets/bgm/bgm_1.mp3';
import farmBGM2 from '../assets/bgm/bgm_2.mp3';
import farmBGM3 from '../assets/bgm/bgm_3.mp3';

import choppingEffect from '../assets/soundEffect/chopping.wav';
import miningEffect from '../assets/soundEffect/mining.wav';
import wateringEffect from '../assets/soundEffect/watering.wav';
import diggingEffect from '../assets/soundEffect/digging.wav';
import getCoinEffect from '../assets/soundEffect/getCoin.mp3';
import levelUpEffect from '../assets/soundEffect/levelUp.mp3';
import successEffect from '../assets/soundEffect/success.mp3';
import errorEffect from '../assets/soundEffect/error.mp3';
import exhaustedEffect from '../assets/soundEffect/exhausted.mp3';
import seedEffect from '../assets/soundEffect/seed.wav';

export class SoundManager {
  private static bgms: Howl[];
  private static currentBGMIndex: number = 0;
  private static effects: Record<string, Howl> = {};

  public static init(): void {
    this.bgms = [
      new Howl({ src: [farmBGM1], volume: 0.3 }),
      new Howl({ src: [farmBGM2], volume: 0.3 }),
      new Howl({ src: [farmBGM3], volume: 0.3 }),
    ];

    this.effects = {
      chop: new Howl({ src: [choppingEffect], volume: 0.5 }),
      mine: new Howl({ src: [miningEffect], volume: 0.5 }),
      water: new Howl({ src: [wateringEffect], volume: 0.5 }),
      dig: new Howl({ src: [diggingEffect], volume: 0.5 }),
      getCoin: new Howl({ src: [getCoinEffect], volume: 0.1 }),
      levelUp: new Howl({ src: [levelUpEffect], volume: 0.3 }),
      success: new Howl({ src: [successEffect], volume: 0.1 }),
      error: new Howl({ src: [errorEffect], volume: 0.4 }),
      exhausted: new Howl({ src: [exhaustedEffect], volume: 0.5 }),
      seed: new Howl({ src: [seedEffect], volume: 0.6 }),
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

  /** 해당 이름을 가진 사운드 이펙트 실행. */
  public static playEffect(effectName: SoundEffect): void {
    this.effects[effectName].play();
  }
}
