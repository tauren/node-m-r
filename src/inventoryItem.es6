import AggregateRoot from './aggregateRoot';
import { InvalidOperationError } from './errors';
import eventStore from './eventStore';
import messageBus from './messageBus';

function subscribeToDomainEvents(inventoryItem) {
	var _this = inventoryItem;

	inventoryItem.onEvent('InventoryItemCreated', function(inventoryItemCreated) {
		_this._activated = true;
		_this._name = inventoryItemCreated.name;
	});

	inventoryItem.onEvent('InventoryItemRenamed', function(inventoryItemRenamed) {
		_this._name = inventoryItemRenamed.name;
	});

	inventoryItem.onEvent('ItemsCheckedInToInventory', function(itemsCheckedInToInventory) {
		_this._number += itemsCheckedInToInventory.numberOfItems;
	});

	inventoryItem.onEvent('ItemsCheckedOutFromInventory', function(itemsCheckedOutFromInventory) {
		_this._number -= itemsCheckedOutFromInventory.numberOfItems;
	});

	inventoryItem.onEvent('InventoryItemDeactivated', function(inventoryItemDeactivated) {
		_this._activated = false;
	});
}

export class InventoryItem extends AggregateRoot {
	constructor(id, name) {
		super(id);
		this._activated = true;
		this._name = '';
		this._number = 0;

		// AggregateRoot.call(this, id);
		this.subscribeToDomainEvents(this);

		if(name) {
			this.apply('InventoryItemCreated', {
				name: name
			});
		}
	}

	subscribeToDomainEvents() {
		this.onEvent('InventoryItemCreated', (inventoryItemCreated) => {
			this._activated = true;
			this._name = inventoryItemCreated.name;
		});

		this.onEvent('InventoryItemRenamed', (inventoryItemRenamed) => {
			this._name = inventoryItemRenamed.name;
		});

		this.onEvent('ItemsCheckedInToInventory', (itemsCheckedInToInventory) => {
			this._number += itemsCheckedInToInventory.numberOfItems;
		});

		this.onEvent('ItemsCheckedOutFromInventory', (itemsCheckedOutFromInventory) => {
			this._number -= itemsCheckedOutFromInventory.numberOfItems;
		});

		this.onEvent('InventoryItemDeactivated', (inventoryItemDeactivated) => {
			this._activated = false;
		});
	}

	checkIn(numberOfItems) {
		this.apply('ItemsCheckedInToInventory', {
			numberOfItems: numberOfItems
		});
	}

	checkOut(numberOfItems) {
		if((this._number - numberOfItems) < 0) {
			var errorMesage = util.format('The inventory needs to replenished in order to checkout %d items.', numberOfItems);
			throw new InvalidOperationError(errorMesage);
		}

		this.apply('ItemsCheckedOutFromInventory', {
			numberOfItems: numberOfItems
		});
	}

	deactivate() {
		if(!this._activated)
			throw new InvalidOperationError('This inventory item has already been deactivated.');

		this.apply('InventoryItemDeactivated', {});
	}

	rename(name) {
		this.apply('InventoryItemRenamed', {
			name: name
		});
	}

	static create(id, name) {
		return new InventoryItem(id, name);
	}

}

//
// InventoryItemRepository
//
export class InventoryItemRepository {
	constructor() {
	}

	save(inventoryItem, callback) {
		let transientEvents = inventoryItem.getTransientEvents();

		eventStore.save(transientEvents, inventoryItem.getId(), inventoryItem.getVersion(), (error) => {
			if(error)
				return callback(error);

			transientEvents.forEach((domainEvent) => {
				messageBus.publish(domainEvent);
			});

			callback();
		});
	}

	get(inventoryItemId, callback) {
		eventStore.getAllEventsFor(inventoryItemId, (error, eventStream) => {
			if(error)
				return callback(error);

			if(!eventStream)
				return callback();

			let inventoryItem = new InventoryItem(inventoryItemId);

			eventStream.pipe(inventoryItem)
				.on('error', function(error) {
					callback(error);
				})
				.on('finish', function() {
					eventStream.unpipe();
					callback(null, inventoryItem);
				});
		});
	}

	static create() {
		return new InventoryItemRepository();
	}

}
