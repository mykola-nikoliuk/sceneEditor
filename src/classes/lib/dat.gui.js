import dat from 'vendors/dat.gui';
import {RangeNumber} from 'common/RangeNumber';

export const GUI = dat.GUI;

GUI.prototype.addStateItem = function (name, object, root, folder = this) {
  const currentFolder = folder.addFolder(name);
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      const item = object[key];
      if (item instanceof RangeNumber) {
        currentFolder.add(item, 'value', item.min, item.max, item.step)
          .name(key)
          .onChange(() => {
            root.setState(root.getState());
          });
      } else if (Object.isObject(item)) {
        this.addStateItem(key, item, root, currentFolder);
      } else {
        if (typeof item === 'string' && item.indexOf('#') === 0) {
          currentFolder.addColor(object, key)
            .onChange(() => {
              root.setState(root.getState());
            })
            .listen();
        } else {
          currentFolder.add(object, key)
            .onChange(() => {
              root.setState(root.getState());
            });
        }
      }
    }
  }
};

GUI.prototype.addState = function (name, root) {
  const state = root.getState();
  this.addStateItem(name, state, root);
  return this;
};