import THREE from 'lib/three';

export function copySkinnedGroup(skinnedGroup) {
  const mirrorMap = new MirrorMap();

  const cloneGroup = skinnedGroup.clone(false);
  mirrorMap.add(skinnedGroup, cloneGroup);

  if (skinnedGroup.animations && skinnedGroup.animations.length) {
    cloneGroup.animations = skinnedGroup.animations.slice();
  }

  mapObjectsArray(skinnedGroup.children, mirrorMap);

  if (skinnedGroup.skeleton) {
    cloneGroup.skeleton = {bones: skinnedGroup.skeleton.bones.map(bone => {
      return getMirrorOrClone(mirrorMap, bone);
    })};
  }

  setParentForMap(mirrorMap);

  return cloneGroup;
}

function mapObjectsArray(objects, mirrorMap) {
  objects.forEach(child => {
    if (child instanceof THREE.SkinnedMesh) {
      // todo: check is need to map deep in SkinnedMesh children
      const clone = child.clone();
      mirrorMap.add(child, clone);

      // todo: check how to fix it
      clone.frustumCulled = false;

      clone.bindMatrix = child.bindMatrix.clone();
      clone.bindMatrixInverse = child.bindMatrixInverse.clone();

      if (child.skeleton && child.skeleton.bones) {
        clone.skeleton = new THREE.Skeleton(
          child.skeleton.bones.map(bone => getMirrorOrClone(mirrorMap, bone))
        );
      } else {
        throw new Error('SkinnedMesh should have skeleton with bones');
      }
    } else if (child instanceof THREE.Object3D) {
      mirrorMap.add(child, child.clone(false));
      mapObjectsArray(child.children, mirrorMap);
    }
  });
}

function getMirrorOrClone(mirrorMap, item) {
  let newItem = null;
  if (mirrorMap.hasOrigin(item)) {
    newItem = mirrorMap.getMirrorByOrigin(item);
  } else {
    newItem = item.clone();
    mirrorMap.add(item, newItem);
  }
  return newItem;
}

/** @param {MirrorMap} mirrorMap */
function setParentForMap(mirrorMap) {
  for (let result of mirrorMap.getIterator()) {
    const mirrorParent = mirrorMap.getMirrorByOrigin(mirrorMap.getOriginalByMirror(result.mirror).parent);
    if (mirrorParent) {
      mirrorParent.add(result.mirror);
    }
  }
}

class MirrorMap {
  constructor() {
    this._origin = [];
    this._mirror = [];
  }

  add(origin, mirror) {
    this._origin.push(origin);
    this._mirror.push(mirror);
  }

  hasOrigin(origin) {
    return this._origin.indexOf(origin) > -1;
  }

  hasMirror(mirror) {
    return this._mirror.indexOf(mirror) > -1;
  }

  getIterator() {
    const iterator = {};

    iterator[Symbol.iterator] = () => {
      return {
        next: () => {
          const result = {done: true};

          if (iterator._current === undefined) {
            iterator._current = 0;
          }

          if (iterator._current < this._origin.length) {
            result.done = false;
            result.value = {
              origin: this._origin[iterator._current],
              mirror: this._mirror[iterator._current++],
            };
          }

          return result;
        }
      };
    };

    return iterator;
  }

  getMirrorByOrigin(originItem) {
    return this._mirror[this._origin.indexOf(originItem)];
  }

  getOriginalByMirror(mirrorItem) {
    return this._origin[this._mirror.indexOf(mirrorItem)];
  }
}
