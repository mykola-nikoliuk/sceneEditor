import THREE from 'lib/three';

export function materialToGUI(material, rootGUI, gui, name = material.name) {
  const folder = gui.addFolder(name)
    .onChange(rootGUI.touch);
  rootGUI.applyFolderState(folder);
  addMaterial(material, rootGUI, folder);

  switch (true) {
    case material instanceof THREE.MeshPhongMaterial:
      addPhong(material, rootGUI, folder);
      break;
  }
}

function addPhong(material, rootGUI, gui) {
  const folder = gui.addFolder('Phong Material')
    .onChange(rootGUI.touch);
  rootGUI.applyFolderState(folder);

  const data = {
    color: '#ffffff',
    emissive: '#000000',
    specular: '#111111',
    normalScale: 1
  };

  folder.addColor(data, 'color')
    .onChange(handleColorChange(material.color));
  folder.addColor(data, 'specular')
    .onChange(handleColorChange(material.specular));
  folder.addColor(data, 'emissive')
    .onChange(handleColorChange(material.emissive));
  folder.add(material, 'bumpScale', 0, 10);
  folder.add(material, 'displacementScale', 0, 10);
  folder.add(data, 'normalScale', 0, 10)
    .onChange(value => material.normalScale.set(value, value));
  folder.add(material, 'emissiveIntensity', 0, 1);
  folder.add(material, 'lightMapIntensity', 0, 1);
  folder.add(material, 'reflectivity', 0, 1);
  folder.add(material, 'shininess', 0, 200);
  folder.add(material, 'wireframe');
}

function addMaterial(material, rootGUI, gui) {
  const folder = gui.addFolder('Base Material')
    .onChange(rootGUI.touch);
  rootGUI.applyFolderState(folder);

  folder.add(material, 'transparent');
  folder.add(material, 'alphaTest', 0, 1)
    .onChange(() => material.needsUpdate = true);
  folder.add(material, 'opacity', 0, 1);
  folder.add(material, 'blending', {
    NoBlending: THREE.NoBlending,
    NormalBlending: THREE.NormalBlending,
    AdditiveBlending: THREE.AdditiveBlending,
    SubtractiveBlending: THREE.SubtractiveBlending,
    MultiplyBlending: THREE.MultiplyBlending,
    CustomBlending: THREE.CustomBlending
  });
  folder.add(material, 'side', {
    FrontSide: THREE.FrontSide,
    BackSide: THREE.BackSide,
    DoubleSide: THREE.DoubleSide
  })
    .onChange((value) => {
      material.side = +value;
      material.needsUpdate = true;
    });
  folder.add(material, 'fog');
  // folder.add(material, 'lights');
  folder.add(material, 'depthTest');
  folder.add(material, 'depthWrite');
}

function handleColorChange(color) {
  return function (value) {
    if (typeof value === 'string') {
      value = value.replace('#', '0x');
    }
    color.setHex(value);
  };
}