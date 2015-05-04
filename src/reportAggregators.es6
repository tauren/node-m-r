'use strict';

import stream from 'stream';
import reportDatabase from './reportDatabase';
import ReportNotFoundError from './errors';


//
// Helper functions
//
function reportNotFound(aggregateRootId, callback) {
	let errorMesage = `The report with identifier "${aggregateRootId}" could not be found in the data store.`;
	callback(new ReportNotFoundError(errorMessage));
}

function dummyEventHandler(domainEvent, callback) {
	process.nextTick(callback);
};

//
// ReportAggregator
//
class ReportAggregator extends stream.Writable {
	constructor() {
		super({ objectMode: true });
	}
	_write(domainEvent, encoding, next) {
		let eventHandlerName = 'handle' + domainEvent.eventName;
		let eventHandler = this[eventHandlerName] || dummyEventHandler;

		eventHandler(domainEvent, error => {
			if(error) {
				console.log(error);
				return;
			}
			next();
		});
	}
}

//
// InventoryReportAggregator
//
let INVENTORY_REPORTS = 'InventoryReports';

export class InventoryReportAggregator extends ReportAggregator {
	constructor() {
		super();
	}
	handleInventoryItemCreated(message, callback) {
		let inventoryReport = {
			id: message.aggregateRootId,
			name: message.name
		};

		reportDatabase.insertReport(INVENTORY_REPORTS, inventoryReport, callback);
	}
	handleInventoryItemRenamed(message, callback) {
		reportDatabase.getReport(INVENTORY_REPORTS, message.aggregateRootId,
			(error, inventoryReport) => {
				if(error)
					return callback(error);

				if(!inventoryReport)
					return reportNotFound(message.aggregateRootId, callback);

				inventoryReport.name = message.name;
				callback();
			}
		);
	}
	handleInventoryItemDeactivated(message, callback) {
		reportDatabase.removeReport(INVENTORY_REPORTS, message.aggregateRootId, callback);
	}
};


//
// InventoryDetailsReportAggregator
//
let INVENTORY_DETAILS_REPORTS = 'InventoryDetailsReports';

export class InventoryDetailsReportAggregator extends ReportAggregator {
	constructor() {
		super();
	}
	handleInventoryItemCreated(message, callback) {
		let inventoryDetailsReport = {
			currentNumber: 0,
			id: message.aggregateRootId,
			name: message.name
		};

		reportDatabase.insertReport(INVENTORY_DETAILS_REPORTS, inventoryDetailsReport, callback);
	}
	handleInventoryItemRenamed(message, callback) {
		reportDatabase.getReport(INVENTORY_DETAILS_REPORTS, message.aggregateRootId,
			(error, inventoryReport) => {
				if(error)
					return callback(error);

				if(!inventoryReport)
					return reportNotFound(message.aggregateRootId, callback);

				inventoryReport.name = message.name;
				callback();
			}
		);
	}
	handleItemsCheckedInToInventory(message, callback) {
		reportDatabase.getReport(INVENTORY_DETAILS_REPORTS, message.aggregateRootId,
			(error, inventoryReport) => {
				if(error)
					return callback(error);

				if(!inventoryReport)
					return reportNotFound(message.aggregateRootId, callback);

				inventoryReport.currentNumber += message.numberOfItems;
				callback();
			}
		);
	}
	handleItemsCheckedOutFromInventory(message, callback) {
		reportDatabase.getReport(INVENTORY_DETAILS_REPORTS, message.aggregateRootId,
			(error, inventoryReport) => {
				if(error)
					return callback(error);

				if(!inventoryReport)
					return reportNotFound(message.aggregateRootId, callback);

				inventoryReport.currentNumber -= message.numberOfItems;
				callback();
			}
		);
	}
	handleInventoryItemDeactivated(message, callback) {
		reportDatabase.removeReport(INVENTORY_DETAILS_REPORTS, message.aggregateRootId, callback);
	}
}

