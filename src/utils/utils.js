const spin = Math.PI * 2;

Number.prototype.toRadians = function () {
  return this * Math.PI / 180;
};

Number.prototype.fitToRange = function (min, max) {
  let result = this;
  if (this < min) result = min;
  if (this > max) result = max;
  return result;
};

Object.isObject = function (object) {
  return typeof object === 'object' && Object.prototype.toString.call(object) === '[object Object]';
};

Object.extend = function (destination, ...sources) {
  while (sources.length) {
    const source = sources.shift();
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        if (Object.isObject(destination[key])) {
          if (Object.isObject(source[key])) {
            Object.extend(destination[key], source[key]);
          } else {
            destination[key] = Object.assign({}, source[key]);
          }
        } else {
          destination[key] = source[key];
        }
      }
    }
  }
};

export function loadImage(src, callback) {
  const mapImage = new Image;
  mapImage.onload = () => {
    callback(mapImage);
  };
  mapImage.src = src;
}

export function normalizeAngle(angle) {
  return (angle % spin + spin) % spin;
}