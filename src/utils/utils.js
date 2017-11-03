import {RangeNumber} from 'common/RangeNumber';

const spin = Math.PI * 2;
const TYPES = {
  RangeNumber: {
    selfName: 'RangeNumber',
    Constructor: RangeNumber
  }
};

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

Object.toStringTypes = function (object) {
  const state = {};
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      const item = object[key];

      if (item instanceof RangeNumber) {
        state[key] = {
          __type: TYPES.RangeNumber.selfName,
          params: item.getArray()
        };
      } else if (item instanceof Object && !(item instanceof Array)) {
        state[key] = Object.toStringTypes(item);
      } else {
        state[key] = JSON.stringify(item);
      }
    }
  }

  return JSON.stringify(state);
};

Object.parseStringTypes = function (string) {
  const stringState = JSON.parse(string);
  const state = {};
  for (let key in stringState) {
    if (stringState.hasOwnProperty(key)) {
      const item = stringState[key];
      if (typeof item === 'object') {
        if (typeof item.__type === 'string') {
          state[key] = new TYPES[item.__type].Constructor(...item.params);
        } else {
          state[key] = Object.parseStringTypes(item);
        }
      } else {
        const parseItem = JSON.parse(item);
        if (typeof parseItem === 'object') {
          state[key] = Object.parseStringTypes(item);
        } else {
          state[key] = parseItem;
        }
      }
    }
  }
  return state;
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