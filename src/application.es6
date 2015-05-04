import uuidGenerator from 'node-uuid';
import _ from 'lodash';
import eventStore  from './eventStore';
import reportDatabase from './reportDatabase';
import { createInventoryItem, renameInventoryItem, checkoutItemsFromInventory, deactivateInventoryItem } from './commandHandlers';
import bootstrap from './bootstrapper';

bootstrap();

let inventoryItemId = uuidGenerator.v1();
let timeout = 3000;

step01();

function step01() {
	printStepHeader('Run the CreateInventoryItem command handler');

	let command = {
		inventoryItemId,
		name: 'Something'
	};

	createInventoryItem(command, error => {
		if(error) {
			console.log(error);
			return;
		}

		printCurrentStateOfTheApplication();
		setTimeout(() => step02(), timeout);
	});
}

function step02() {
	printStepHeader('Run the RenameInventoryItem command handler');

	let command = {
		inventoryItemId,
		name: 'Something entirely different'
	};

	renameInventoryItem(command, error => {
		if(error) {
			console.log(error);
			return;
		}

		printCurrentStateOfTheApplication();
		setTimeout(() => step03(), timeout);
	});
}

function step03() {
	printStepHeader('Run the CheckoutItemsFromInventory command handler');

	let command = {
		inventoryItemId,
		numberOfItems: 7
	};

	checkoutItemsFromInventory(command, error => {
		if(error) {
			console.log(error);
			return;
		}

		printCurrentStateOfTheApplication();
		setTimeout(() => step04(), timeout);
	});
}

function step04() {
	printStepHeader('Run the DeactivateInventoryItem command handler');

	let command = {
		inventoryItemId
	};

	deactivateInventoryItem(command, error => {
		if(error) {
			console.log(error);
			return;
		}

		printCurrentStateOfTheApplication();
	});
}

function printCurrentStateOfTheApplication() {
	printEventStoreContent();

	// Give the report database some time to catch up
	setTimeout(() => printReportDatabaseContent(), timeout/2);
}

function printEventStoreContent() {
	printContentHeader('Event store');
	_.forEach(eventStore.createDump(), document => console.log(document.events));
}

function printReportDatabaseContent() {
	printContentHeader('Report database');
	console.log(reportDatabase.createDump());
}

function printStepHeader(message) {
	console.log(
		dedent`======================================================
					 ${message}
					 ======================================================`
	);
}

function printContentHeader(message) {
	console.log(
		dedent`******************************************************
				   ${message}
					 ******************************************************`
	);
}

// From https://gist.github.com/zenparsing/5dffde82d9acef19e43c
// Conversation: https://esdiscuss.org/topic/multiline-template-strings-that-don-t-break-indentation
function dedent(callSite, ...args) {
  function format(str) {
    let size = -1;
    return str.replace(/\n(\s+)/g, (m, m1) => {
      if (size < 0)
        size = m1.replace(/\t/g, "    ").length;
      return "\n" + m1.slice(Math.min(m1.length, size));
    });
  }

  if (typeof callSite === "string")
    return format(callSite);

  if (typeof callSite === "function")
    return (...args) => format(callSite(...args));

  let output = callSite
    .slice(0, args.length + 1)
    .map((text, i) => (i === 0 ? "" : args[i - 1]) + text)
    .join("");

  return format(output);
}
