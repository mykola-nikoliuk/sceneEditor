export default THREE => {

    const mtlLoader = new THREE.MTLLoader();
    const objLoader = new THREE.OBJLoader();

    class OBJMTLLoader {
        static load(objName, mtlName, texturePath) {
            return new Promise(resolve => {
                mtlLoader.setTexturePath(texturePath);
                mtlLoader.load(mtlName, mtl => {
                    mtl.preload();

                    objLoader.setMaterials(mtl);
                    objLoader.load(objName, obj => {
                        resolve(obj);
                    });
                });
            });
        }
    }

    THREE.OBJMTLLoader = OBJMTLLoader;
}