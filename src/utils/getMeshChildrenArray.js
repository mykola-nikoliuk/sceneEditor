import THREE from 'lib/three';

export function getMeshChildrenArray(children, objects = []) {
  children.forEach(child => {
    if (objects.indexOf(child) === -1) {
      if (child instanceof THREE.Mesh) {
        objects.push(child);
      }
      getMeshChildrenArray(child.children, objects);
    }
  });
  return objects;
}