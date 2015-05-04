import ExtendableError from 'es6-error';

// // Borrowed from https://gist.github.com/daliwali/09ca19032ab192524dc6
// // TypedError class which other typed errors subclass from.
// class TypedError extends Error {

//   constructor (message) {
//     super(message);

//     if (Error.hasOwnProperty('captureStackTrace'))
//       Error.captureStackTrace(this, this.constructor);
//     else
//       Object.defineProperty(this, 'stack', {
//         value: (new Error()).stack
//       });

//     // Object.defineProperty(this, 'message', {
//     //   value: message
//     // });
//   }

//   get name () {
//     return this.constructor.name;
//   }

// }

export class InvalidOperationError extends ExtendableError {}
export class ConcurrencyViolationError extends ExtendableError {}
export class InvalidDataAreaError extends ExtendableError {}
export class ReportNotFoundError extends ExtendableError {}
