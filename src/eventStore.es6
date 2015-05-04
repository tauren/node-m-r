import stream from 'stream';
import _ from 'lodash';
import { ConcurrencyViolationError } from './errors';

function simulateAsynchronousIO(asynchronousAction) {
	process.nextTick(asynchronousAction);
}

class EventStore {
	constructor() {
		this.documents = [];
	}

	findStoredDomainEvents(aggregateRootId, callback) {
		simulateAsynchronousIO(() => {
			let storedDocument = _.find(this.documents, (document) => {
				return document.id === aggregateRootId;
			});

			callback(null, storedDocument);
		});
	}

	createDump() {
		return this.documents;
	}

	getAllEventsFor(aggregateRootId, callback) {
		this.findStoredDomainEvents(aggregateRootId, (error, storedDocument) => {
			let eventStream;

			if(error)
				return callback(error);

			if(!storedDocument)
				return callback();

			eventStream = new stream.PassThrough({ objectMode: true });

			storedDocument.events.forEach(function(domainEvent) {
				eventStream.write(domainEvent);
			});

			eventStream.end();
			callback(null, eventStream);
		});
	}
	save(domainEvents, aggregateRootId, expectedAggregateRootVersion, callback) {
		this.findStoredDomainEvents(aggregateRootId, (error, storedDocument) => {
			let concurrencyViolation;

			if(error)
				return callback(error);

			if(!storedDocument) {
				storedDocument = {
					id: aggregateRootId,
					events: domainEvents
				};

				this.documents.push(storedDocument);
				return callback();
			}

			if(_.last(storedDocument.events).eventVersion !== expectedAggregateRootVersion) {
				concurrencyViolation = new ConcurrencyViolationError('An operation has been performed on an aggregate root that is out of date.');
				return callback(concurrencyViolation);
			}

			domainEvents.forEach(function(domainEvent) {
				storedDocument.events.push(domainEvent);
			});

			callback();
		});
	}

	static create() {
		return new EventStore();
	}
}

export default EventStore.create();
