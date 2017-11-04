import THREE from 'lib/three';

export function copySkinnedGroup(skinnedGroup) {
  const cloneGroup = skinnedGroup.clone(false);

  skinnedGroup.children.forEach(child => {
    if (child instanceof THREE.SkinnedMesh) {
      const clone = child.clone();
      // todo: check how to fix it
      clone.frustumCulled = false;

      clone.bindMatrix = child.bindMatrix.clone();
      clone.bindMatrixInverse = child.bindMatrixInverse.clone();

      if (child.skeleton && child.skeleton.bones) {

        const bones = [];

        child.skeleton.bones.forEach(bone => {
          // search for root bones and add them to bones with their children
          if (bone.parent === skinnedGroup) {
            // add all effected bones
            bones.push(...getChildrenArray(cloneGroup.add(bone.clone())));
          }
        });

        clone.skeleton = new THREE.Skeleton(bones);
      } else {
        throw new Error('SkinnedMesh should have skeleton with bones');
      }

      cloneGroup.add(clone);
    }
  });

  const groupBones = [];
  skinnedGroup.skeleton.bones.forEach(child => {
    groupBones.push(cloneGroup.getObjectByName(child.name));
  });
  cloneGroup.skeleton = {bones: groupBones};

  return cloneGroup;
}

function getChildrenArray(bone, children = []) {
  children.unshift(bone);
  bone.children.forEach(child => {
    getChildrenArray(child, children);
  });
  return children;
}
