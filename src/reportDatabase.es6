import either from 'either.js';
import _ from 'lodash';
import { InvalidDataAreaError } from './errors';

function simulateAsynchronousIO(asynchronousAction) {
	process.nextTick(asynchronousAction);
}

class ReportDatabase {
	constructor() {
		this._dataAreas = {
			InventoryReports: [],
			InventoryDetailsReports: []
		};
	}

	createDump() {
		return this._dataAreas;
	}

	getReportsCollectionFor(dataArea) {
		var reportsCollection = this._dataAreas[dataArea];

		if(reportsCollection)
			return either.right(reportsCollection);
		else
			return either.left(new InvalidDataAreaError('The specified data area is unknown.'));
	}

	getReport(dataArea, id, callback) {
		simulateAsynchronousIO(() => {
			this.getReportsCollectionFor(dataArea).fold(
				function left(error) {
					callback(error);
				},
				function right(reportsCollection) {
					var requestedReport = _.find(reportsCollection, function(report) {
						return report.id === id;
					});

					callback(null, requestedReport);
				}
			);
		});
	}

	insertReport(dataArea, inventoryReport, callback) {
		simulateAsynchronousIO(() => {
			this.getReportsCollectionFor(dataArea).fold(
				function left(error) {
					callback(error);
				},
				function right(reportsCollection) {
					reportsCollection.push(inventoryReport);
					callback();
				}
			);
		});
	}

	removeReport(dataArea, id, callback) {
		simulateAsynchronousIO(() => {
			this.getReportsCollectionFor(dataArea).fold(
				function left(error) {
					callback(error);
				},
				function right(reportsCollection) {
					_.remove(reportsCollection, function(report) {
						return report.id === id;
					});

					callback();
				}
			);
		});
	}

	static create() {
		return new ReportDatabase();
	}
}

export default ReportDatabase.create();
