import dat from 'vendors/dat.gui';

export const GUI = dat.GUI;

GUI.prototype.addStateItem = function (name, object, folder = this) {
  const currentFolder = folder.addFolder(name);
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      if (Object.isObject(object[key])) {
        this.addStateItem(key, object[key], currentFolder);
      } else {
        if (typeof object[key] === 'string' && object[key].indexOf('#') === 0) {
          currentFolder.addColor(object, key)
            .onChange(() => {
              this._stateChild.setState(this._stateChild.getState());
            })
            .listen();
        } else {
          currentFolder.add(object, key)
            .onChange(() => {
              this._stateChild.setState(this._stateChild.getState());
            });
        }
      }
    }
  }
};

GUI.prototype.addState = function (name, stateChild) {
  const state = stateChild.getState();
  this.addStateItem(name, state);
  this._stateChild = stateChild;
  return this;
};