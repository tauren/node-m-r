class MessageBus {
	constructor() {
		this._eventHandlers = [];
	}

	registerEventHandler(eventHandler) {
		this._eventHandlers.push(eventHandler);
	};

	publish(domainEvent) {
		this._eventHandlers.forEach(function(eventHandler) {
			process.nextTick(function() {
				eventHandler.write(domainEvent);
			});
		});
	};

	static create() {
		return new MessageBus();
	}
}

export default MessageBus.create();
