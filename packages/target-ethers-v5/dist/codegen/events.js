"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGetEventOverload = exports.generateEventArgType = exports.generateEventTypes = exports.generateEventSignature = exports.generateInterfaceEventDescription = exports.generateEventTypeExport = exports.generateEventTypeExports = exports.generateEventFilter = exports.generateEventFilters = void 0;
const types_1 = require("./types");
function generateEventFilters(events) {
    if (events.length === 1) {
        return generateEventFilter(events[0], true);
    }
    else {
        return events.map((e) => generateEventFilter(e, false)).join('\n');
    }
}
exports.generateEventFilters = generateEventFilters;
function generateEventFilter(event, includeNameFilter) {
    const components = event.inputs.map((input, i) => { var _a; return ({ name: (_a = input.name) !== null && _a !== void 0 ? _a : `arg${i.toString()}`, type: input.type }); });
    const arrayOutput = types_1.generateOutputComplexTypeAsArray(components);
    const objectOutput = types_1.generateOutputComplexTypesAsObject(components) || '{}';
    let filter = `
    '${generateEventSignature(event)}'(${generateEventTypes(event.inputs)}): TypedEventFilter<${arrayOutput}, ${objectOutput}>;
    `;
    if (includeNameFilter) {
        filter += `
      ${event.name}(${generateEventTypes(event.inputs)}): TypedEventFilter<${arrayOutput}, ${objectOutput}>;
      `;
    }
    return filter;
}
exports.generateEventFilter = generateEventFilter;
function generateEventTypeExports(events) {
    if (events.length === 1) {
        return generateEventTypeExport(events[0], false);
    }
    else {
        return events.map((e) => generateEventTypeExport(e, true)).join('\n');
    }
}
exports.generateEventTypeExports = generateEventTypeExports;
function generateEventTypeExport(event, includeArgTypes) {
    const components = event.inputs.map((input, i) => { var _a; return ({ name: (_a = input.name) !== null && _a !== void 0 ? _a : `arg${i.toString()}`, type: input.type }); });
    const arrayOutput = types_1.generateOutputComplexTypeAsArray(components);
    const objectOutput = types_1.generateOutputComplexTypesAsObject(components) || '{}';
    return `
  export type ${event.name}${includeArgTypes ? event.inputs.map((input) => '_' + input.type.originalType).join('') + '_Event' : 'Event'} = TypedEvent<${arrayOutput} & ${objectOutput}>;
  `;
}
exports.generateEventTypeExport = generateEventTypeExport;
function generateInterfaceEventDescription(event) {
    return `'${generateEventSignature(event)}': EventFragment;`;
}
exports.generateInterfaceEventDescription = generateInterfaceEventDescription;
function generateEventSignature(event) {
    return `${event.name}(${event.inputs.map((input) => input.type.originalType).join(',')})`;
}
exports.generateEventSignature = generateEventSignature;
function generateEventTypes(eventArgs) {
    if (eventArgs.length === 0) {
        return '';
    }
    return (eventArgs
        .map((arg) => {
        return `${arg.name}?: ${generateEventArgType(arg)}`;
    })
        .join(', ') + ', ');
}
exports.generateEventTypes = generateEventTypes;
function generateEventArgType(eventArg) {
    return eventArg.isIndexed ? `${types_1.generateInputType(eventArg.type)} | null` : 'null';
}
exports.generateEventArgType = generateEventArgType;
function generateGetEventOverload(event) {
    return `getEvent(nameOrSignatureOrTopic: '${event.name}'): EventFragment;`;
}
exports.generateGetEventOverload = generateGetEventOverload;
//# sourceMappingURL=events.js.map