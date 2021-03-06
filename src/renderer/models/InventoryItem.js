import { Document } from 'camo';
import Size from './Size';
import Photo from './Photo';

export default class InventoryItem extends Document {
  constructor() {
    super();

    this.productNumber = {
      type: Number,
      validate: value => parseInt(value, 10) === value,
      unique: true,
      required: true,
    };

    this.productName = {
      type: String,
      unique: true,
      required: true,
    };

    this.price = {
      type: Number,
    };

    this.size = {
      type: Size,
    };

    this.photos = {
      type: [Photo],
    };

    this.created = {
      type: Date,
      default: Date.now,
    };

    this.lastModified = {
      type: Date,
      default: Date.now,
    };
  }

  static async nextAvailableProductNumber() {
    const items = await InventoryItem.find({}, {
      sort: '-productNumber',
      limit: 1,
    });
    if (items.length) {
      return items[0].productNumber + 1;
    }
    return 1;
  }

  async preValidate() {
    if (typeof this.productNumber !== 'number') {
      this.productNumber = await InventoryItem.nextAvailableProductNumber();
    }
  }

  static collectionName() {
    return 'inventory_items';
  }
}
