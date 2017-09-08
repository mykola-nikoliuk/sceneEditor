import {loadImage} from "../utils/utils";

export default class ImageGrid {
    constructor(imageData) {
        this._grid = null;
        this._imageData = imageData;
    }

    parse(callback = null, totalCallback = null) {
        const imageData = this._imageData;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        loadImage(imageData, image => {
            this._image = image;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const imageDataSize = canvas.width * canvas.height * 4;
            const grid = this._grid = [];
            for (let i = 0; i < imageDataSize; i += 4) {
                const x = i / 4 % canvas.width;
                const y = i / 4 / canvas.width | 0;
                const color = (imageData.data[i] << 16) | (imageData.data[i + 1] << 8) | (imageData.data[i + 2]);

                if (!grid[y]) {
                    grid[y] = [];
                }
                grid[y][x] = color;

                callback && callback({x, y, color});
            }

            this._grid = grid;

            totalCallback && totalCallback();
        });
    };

    get(x, y) {
        return this._grid[y][x];
    }

    get grid() {
        return this._grid;
    }

    get width() {
        return this._image.width;
    }

    get height() {
        return this._image.height;
    }
}