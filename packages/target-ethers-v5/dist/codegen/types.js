"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOutputComplexTypesAsObject = exports.generateOutputComplexTypeAsArray = exports.generateOutputComplexType = exports.generateTupleType = exports.generateOutputType = exports.generateInputType = exports.generateOutputTypes = exports.generateInputTypes = void 0;
const lodash_1 = require("lodash");
function generateInputTypes(input) {
    if (input.length === 0) {
        return '';
    }
    return (input.map((input, index) => `${input.name || `arg${index}`}: ${generateInputType(input.type)}`).join(', ') + ', ');
}
exports.generateInputTypes = generateInputTypes;
function generateOutputTypes(returnResultObject, outputs) {
    if (!returnResultObject && outputs.length === 1) {
        return generateOutputType(outputs[0].type);
    }
    else {
        return generateOutputComplexType(outputs);
    }
}
exports.generateOutputTypes = generateOutputTypes;
// https://docs.ethers.io/ethers.js/html/api-contract.html#types
function generateInputType(evmType) {
    switch (evmType.type) {
        case 'integer':
            return 'BigNumberish';
        case 'uinteger':
            return 'BigNumberish';
        case 'address':
            return 'string';
        case 'bytes':
        case 'dynamic-bytes':
            return 'BytesLike';
        case 'array':
            if (evmType.size !== undefined) {
                return `[${Array(evmType.size).fill(generateInputType(evmType.itemType)).join(', ')}]`;
            }
            else {
                return `(${generateInputType(evmType.itemType)})[]`;
            }
        case 'boolean':
            return 'boolean';
        case 'string':
            return 'string';
        case 'tuple':
            return generateTupleType(evmType, generateInputType);
        case 'unknown':
            return 'any';
    }
}
exports.generateInputType = generateInputType;
function generateOutputType(evmType) {
    switch (evmType.type) {
        case 'integer':
        case 'uinteger':
            return evmType.bits <= 48 ? 'number' : 'BigNumber';
        case 'address':
            return 'string';
        case 'void':
            return 'void';
        case 'bytes':
        case 'dynamic-bytes':
            return 'string';
        case 'array':
            if (evmType.size !== undefined) {
                return `[${Array(evmType.size).fill(generateOutputType(evmType.itemType)).join(', ')}]`;
            }
            else {
                return `(${generateOutputType(evmType.itemType)})[]`;
            }
        case 'boolean':
            return 'boolean';
        case 'string':
            return 'string';
        case 'tuple':
            return generateOutputComplexType(evmType.components);
        case 'unknown':
            return 'any';
    }
}
exports.generateOutputType = generateOutputType;
function generateTupleType(tuple, generator) {
    return '{' + tuple.components.map((component) => `${component.name}: ${generator(component.type)}`).join(',') + '}';
}
exports.generateTupleType = generateTupleType;
/**
 * Always return an array type; if there are named outputs, merge them to that type
 * this generates slightly better typings fixing: https://github.com/ethereum-ts/TypeChain/issues/232
 **/
function generateOutputComplexType(components) {
    const existingOutputComponents = lodash_1.compact([
        generateOutputComplexTypeAsArray(components),
        generateOutputComplexTypesAsObject(components),
    ]);
    return existingOutputComponents.join(' & ');
}
exports.generateOutputComplexType = generateOutputComplexType;
function generateOutputComplexTypeAsArray(components) {
    return `[${components.map((t) => generateOutputType(t.type)).join(', ')}]`;
}
exports.generateOutputComplexTypeAsArray = generateOutputComplexTypeAsArray;
function generateOutputComplexTypesAsObject(components) {
    let namedElementsCode;
    const namedElements = components.filter((e) => !!e.name);
    if (namedElements.length > 0) {
        namedElementsCode = '{' + namedElements.map((t) => `${t.name}: ${generateOutputType(t.type)}`).join(',') + ' }';
    }
    return namedElementsCode;
}
exports.generateOutputComplexTypesAsObject = generateOutputComplexTypesAsObject;
//# sourceMappingURL=types.js.map