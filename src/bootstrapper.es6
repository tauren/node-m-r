import { InventoryReportAggregator, InventoryDetailsReportAggregator } from './reportAggregators';
import messageBus from './messageBus';

export default function bootstrap() {
  // Create instances of event handlers
	let inventoryReportAggregator = new InventoryReportAggregator();
  let inventoryDetailsReportAggregator = new InventoryDetailsReportAggregator();

  // Register event handlers in message bus
	messageBus.registerEventHandler(inventoryReportAggregator);
	messageBus.registerEventHandler(inventoryDetailsReportAggregator);
}
