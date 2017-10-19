
export class Pixel5 {

  /**
   * @param {number} channelCount
   * 1 - white
   * 2 - white/alpha
   * 3 - red/green/blue
   * 4 - red/green/blue/alpha
   * 5 - red/green/blue/alpha/rest
   * rest means that 1 - red + green + blue + alpha
   */
  constructor(channelCount) {
    this.channels = [];
    for (let i = 0; i < channelCount; i++) {
      this.channels.push(0);
    }
  }

  addToChannel(channel, value) {
    this.channels[channel] += value;

    switch (true) {
      case this.channels[channel] > 1:
        this.channels[channel] = 1;
        break;
      case this.channels[channel] < 0:
        this.channels[channel] = 0;
        break;
    }
  }

  normalize(channel = null) {
    let sum = 0;
    for (let i = 0; i < this.channels.length; i++) {
      if (i !== channel) sum += this.channels[i];
    }

    let scale = (1 - this.channels[channel]) / sum;
    for (let i = 0; i < this.channels.length; i++) {
      if (i !== channel) this.channels[i] *= scale;
    }

  }
}

Pixel5.ENUM = {
  BW: 0,
  BW_ALPHA: 1,
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  RGB_ALPHA: 3,
  REST: 4
};