import { InventoryItem, InventoryItemRepository } from './inventoryItem';
import MessageBus from './messageBus';

let repository = InventoryItemRepository.create();
let DEFAULT_NUMBER_OF_ITEMS_IN_INVENTORY = 15;

export function createInventoryItem(command, callback) {
	let inventoryItem = InventoryItem.create(command.inventoryItemId, command.name);
	inventoryItem.checkIn(DEFAULT_NUMBER_OF_ITEMS_IN_INVENTORY);
	repository.save(inventoryItem, callback);
}

export function renameInventoryItem(command, callback) {
	repository.get(command.inventoryItemId, (error, inventoryItem) => {
		if(error) {
			callback(error);
			return;
		}

		inventoryItem.rename(command.name);
		repository.save(inventoryItem, callback);
	});
}

export function checkinItemsInToInventory(command, callback) {
	repository.get(command.inventoryItemId, (error, inventoryItem) => {
		if(error) {
			callback(error);
			return;
		}

		inventoryItem.checkIn(command.numberOfItems);
		repository.save(inventoryItem, callback);
	});
}

export function checkoutItemsFromInventory(command, callback) {
	repository.get(command.inventoryItemId, (error, inventoryItem) => {
		if(error) {
			callback(error);
			return;
		}

		try {
			inventoryItem.checkOut(command.numberOfItems);
		}
		catch(error) {
			callback(error);
			return;
		}

		repository.save(inventoryItem, callback);
	});
}

export function deactivateInventoryItem(command, callback) {
	repository.get(command.inventoryItemId, (error, inventoryItem) => {
		if(error) {
			callback(error);
			return;
		}

		try {
			inventoryItem.deactivate();
		}
		catch(error) {
			callback(error);
			return;
		}

		repository.save(inventoryItem, callback);
	});
}