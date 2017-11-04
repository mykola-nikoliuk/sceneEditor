import THREE from 'lib/three';

export function findRootParent(child) {
  if (!child.parent || child.parent instanceof THREE.Scene) {
    return child;
  } else {
    return findRootParent(child.parent);
  }
}