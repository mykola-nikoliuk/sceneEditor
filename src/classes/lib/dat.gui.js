import each from 'lodash/each';
import get from 'lodash/get';
import dat from 'vendors/dat.gui';
import {RangeNumber} from 'common/RangeNumber';

export class GUI extends dat.GUI {
  constructor(foldersState) {
    super();
    this._foldersState = foldersState || {};
    this.changeListeners = [];
    this.touch = this.touch.bind(this);
  }

  addState(name, root) {
    const state = root.getState();
    return this._addStateItem(name, state, root);
  }

  applyFolderState(folder) {
    const path = this._getPath(folder);
    const config = get(this._foldersState, path, null);
    if (config) {
      folder.closed = config.__closed;
    }
  }

  getFoldersState(folder = this) {
    const config = {__closed: folder.closed};
    each(folder.__folders, (folder, name) => {
      config[name] = this.getFoldersState(folder);
    });

    return config;
  }

  touch() {
    this.changeListeners.forEach(callback => callback());
  }

  onChange(callback) {
    this.changeListeners.push(callback);
    return this;
  }

  _getPath(folder, path = []) {
    if (folder.name) {
      path.unshift(folder.name);
    }
    if (folder.parent) {
      this._getPath(folder.parent, path);
    }
    return path;
  }

  _addStateItem(name, object, root, folder = this) {
    const currentFolder = folder.addFolder(name)
      .onChange(this.touch);
    this.applyFolderState(currentFolder);
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        const item = object[key];
        if (item instanceof RangeNumber) {
          currentFolder.add(item, 'value', item.min, item.max, item.step)
            .name(key)
            .onChange(() => {
              root.setState(root.getState());
            })
            .listen();
        } else if (Object.isObject(item)) {
          this._addStateItem(key, item, root, currentFolder);
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
              })
              .listen();
          }
        }
      }
    }
    return currentFolder;
  }
}