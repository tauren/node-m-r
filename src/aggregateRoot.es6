import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import stream from 'stream';
import uuidGenerator from 'node-uuid';

export default class AggregateRoot extends stream.Writable {
	constructor(id) {
		super({ objectMode: true });
		this._id = id;
		this._version = this._eventVersion = 0;
		this._transientEvents = [];

		this._eventEmitter = new EventEmitter();
	}

	apply(eventName, domainEvent) {
		this._eventVersion += 1;
		enhanceDomainEvent(this, eventName, this._eventVersion, domainEvent);

		this._transientEvents.push(domainEvent);
		this._eventEmitter.emit(eventName, domainEvent);
	}

	getTransientEvents() {
		return this._transientEvents;
	}

	getId() {
		return this._id;
	}

	getVersion() {
		return this._version;
	}

	onEvent(type, listener) {
		return this._eventEmitter.on(type, listener);
	}

	_write(domainEvent, encoding, next) {
		this._eventEmitter.emit(domainEvent.eventName, domainEvent);

		this._eventVersion += 1;
		this._version += 1;
		next();
	}
}

function enhanceDomainEvent(aggregateRoot, eventName, eventVersion, domainEvent) {
	domainEvent.aggregateRootId = aggregateRoot._id;
	domainEvent.eventId = uuidGenerator.v1();
	domainEvent.eventName = eventName;
	domainEvent.eventVersion = eventVersion;
}