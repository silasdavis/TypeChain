"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegenAbstractContractFactory = exports.codegenContractFactory = exports.codegenContractTypings = void 0;
const lodash_1 = require("lodash");
const common_1 = require("../common");
const events_1 = require("./events");
const functions_1 = require("./functions");
const reserved_keywords_1 = require("./reserved-keywords");
const types_1 = require("./types");
function codegenContractTypings(contract, codegenConfig) {
    const contractImports = ['BaseContract', 'ContractTransaction'];
    const allFunctions = lodash_1.values(contract.functions)
        .map((fn) => functions_1.codegenFunctions({ returnResultObject: true, codegenConfig }, fn) +
        functions_1.codegenFunctions({ isStaticCall: true, codegenConfig }, fn))
        .join('');
    const optionalContractImports = ['Overrides', 'PayableOverrides', 'CallOverrides'];
    optionalContractImports.forEach((importName) => pushImportIfUsed(importName, allFunctions, contractImports));
    const template = `
  import { ethers, EventFilter, Signer, BigNumber, BigNumberish, PopulatedTransaction, ${contractImports.join(', ')} } from 'ethers';
  import { BytesLike } from '@ethersproject/bytes';
  import { Listener, Provider } from '@ethersproject/providers';
  import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';
  import type { TypedEventFilter, TypedEvent, TypedListener } from './common';

  export interface ${contract.name}Interface extends ethers.utils.Interface {
    functions: {
      ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(functions_1.generateInterfaceFunctionDescription)
        .join('\n')}
    };

    ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(functions_1.generateEncodeFunctionDataOverload)
        .join('\n')}

    ${lodash_1.values(contract.functions)
        .map((v) => v[0])
        .map(functions_1.generateDecodeFunctionResultOverload)
        .join('\n')}

    events: {
      ${lodash_1.values(contract.events)
        .map((v) => v[0])
        .map(events_1.generateInterfaceEventDescription)
        .join('\n')}
    };

    ${lodash_1.values(contract.events)
        .map((v) => v[0])
        .map(events_1.generateGetEventOverload)
        .join('\n')}
  }

  ${lodash_1.values(contract.events).map(events_1.generateEventTypeExports).join('\n')}

  export interface ${contract.name} extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;

    listeners<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>): Array<TypedListener<EventArgsArray, EventArgsObject>>;
    off<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>, listener: TypedListener<EventArgsArray, EventArgsObject>): this;
    on<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>, listener: TypedListener<EventArgsArray, EventArgsObject>): this;
    once<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>, listener: TypedListener<EventArgsArray, EventArgsObject>): this;
    removeListener<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>, listener: TypedListener<EventArgsArray, EventArgsObject>): this;
    removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>): this;

    listeners(eventName?: string): Array<Listener>;
    off(eventName: string, listener: Listener): this;
    on(eventName: string, listener: Listener): this;
    once(eventName: string, listener: Listener): this;
    removeListener(eventName: string, listener: Listener): this;
    removeAllListeners(eventName?: string): this;

    queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
      event: TypedEventFilter<EventArgsArray, EventArgsObject>,
      fromBlockOrBlockhash?: string | number | undefined,
      toBlock?: string | number | undefined
    ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

    interface: ${contract.name}Interface;

    functions: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { returnResultObject: true, codegenConfig }))
        .join('\n')}
    };

    ${lodash_1.values(contract.functions)
        .filter((f) => !reserved_keywords_1.reservedKeywords.has(f[0].name))
        .map(functions_1.codegenFunctions.bind(null, { codegenConfig }))
        .join('\n')}

    callStatic: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { isStaticCall: true, codegenConfig }))
        .join('\n')}
    };

    filters: {
      ${lodash_1.values(contract.events).map(events_1.generateEventFilters).join('\n')}
    };

    estimateGas: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { overrideOutput: 'Promise<BigNumber>', codegenConfig }))
        .join('\n')}
    };

    populateTransaction: {
      ${lodash_1.values(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { overrideOutput: 'Promise<PopulatedTransaction>', codegenConfig }))
        .join('\n')}
    };
  }`;
    return template;
}
exports.codegenContractTypings = codegenContractTypings;
function codegenContractFactory(contract, abi, bytecode) {
    var _a;
    const constructorArgs = (contract.constructor[0] ? types_1.generateInputTypes(contract.constructor[0].inputs) : '') +
        `overrides?: ${((_a = contract.constructor[0]) === null || _a === void 0 ? void 0 : _a.stateMutability) === 'payable'
            ? 'PayableOverrides & { from?: string | Promise<string> }'
            : 'Overrides & { from?: string | Promise<string> }'}`;
    const constructorArgNamesWithoutOverrides = contract.constructor[0]
        ? functions_1.generateParamNames(contract.constructor[0].inputs)
        : '';
    const constructorArgNames = constructorArgNamesWithoutOverrides
        ? `${constructorArgNamesWithoutOverrides}, overrides || {}`
        : 'overrides || {}';
    if (!bytecode)
        return codegenAbstractContractFactory(contract, abi);
    // tsc with noUnusedLocals would complain about unused imports
    const ethersImports = ['Signer', 'utils'];
    const optionalEthersImports = ['BytesLike', 'BigNumberish'];
    optionalEthersImports.forEach((importName) => pushImportIfUsed(importName, constructorArgs, ethersImports));
    const ethersContractImports = ['Contract', 'ContractFactory'];
    const optionalContractImports = ['PayableOverrides', 'Overrides'];
    optionalContractImports.forEach((importName) => pushImportIfUsed(importName, constructorArgs, ethersContractImports));
    const { body, header } = codegenCommonContractFactory(contract, abi);
    return `
  import { ${[...ethersImports, ...ethersContractImports].join(', ')} } from "ethers";
  import { Provider, TransactionRequest } from '@ethersproject/providers';
  ${header}

  const _bytecode = "${bytecode.bytecode}";

  export class ${contract.name}${common_1.FACTORY_POSTFIX} extends ContractFactory {
    ${generateFactoryConstructor(contract, bytecode)}
    deploy(${constructorArgs}): Promise<${contract.name}> {
      return super.deploy(${constructorArgNames}) as Promise<${contract.name}>;
    }
    getDeployTransaction(${constructorArgs}): TransactionRequest {
      return super.getDeployTransaction(${constructorArgNames});
    };
    attach(address: string): ${contract.name} {
      return super.attach(address) as ${contract.name};
    }
    connect(signer: Signer): ${contract.name}${common_1.FACTORY_POSTFIX} {
      return super.connect(signer) as ${contract.name}${common_1.FACTORY_POSTFIX};
    }
    static readonly bytecode = _bytecode;
    ${body}
  }

  ${generateLibraryAddressesInterface(contract, bytecode)}
  `;
}
exports.codegenContractFactory = codegenContractFactory;
function codegenAbstractContractFactory(contract, abi) {
    const { body, header } = codegenCommonContractFactory(contract, abi);
    return `
  import { Contract, Signer, utils } from "ethers";
  import { Provider } from "@ethersproject/providers";
  ${header}

  export class ${contract.name}${common_1.FACTORY_POSTFIX} {
    ${body}
  }
  `;
}
exports.codegenAbstractContractFactory = codegenAbstractContractFactory;
function codegenCommonContractFactory(contract, abi) {
    const header = `
  import type { ${contract.name}, ${contract.name}Interface } from "../${contract.name}";

  const _abi = ${JSON.stringify(abi, null, 2)};
  `.trim();
    const body = `
    static readonly abi = _abi;
    static createInterface(): ${contract.name}Interface {
      return new utils.Interface(_abi) as ${contract.name}Interface;
    }
    static connect(address: string, signerOrProvider: Signer | Provider): ${contract.name} {
      return new Contract(address, _abi, signerOrProvider) as ${contract.name};
    }
  `.trim();
    return { header, body };
}
function generateFactoryConstructor(contract, bytecode) {
    if (!bytecode.linkReferences) {
        return `
    constructor(signer?: Signer) {
      super(_abi, _bytecode, signer);
    }
    `;
    }
    const linkRefReplacements = bytecode.linkReferences.map((linkRef) => {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
        // We're using a double escape backslash, since the string will be pasted into generated code.
        const escapedLinkRefRegex = linkRef.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
        const libraryKey = linkRef.name || linkRef.reference;
        return `
      linkedBytecode = linkedBytecode.replace(
        new RegExp("${escapedLinkRefRegex}", "g"),
        linkLibraryAddresses["${libraryKey}"].replace(/^0x/, '').toLowerCase(),
      );`;
    });
    return `
    constructor(linkLibraryAddresses: ${contract.name}LibraryAddresses, signer?: Signer) {
      super(_abi, ${contract.name}${common_1.FACTORY_POSTFIX}.linkBytecode(linkLibraryAddresses), signer);
    }

    static linkBytecode(linkLibraryAddresses: ${contract.name}LibraryAddresses): string {
      let linkedBytecode = _bytecode;
      ${linkRefReplacements.join('\n')}

      return linkedBytecode;
    }
  `;
}
function generateLibraryAddressesInterface(contract, bytecode) {
    if (!bytecode.linkReferences)
        return '';
    const linkLibrariesKeys = bytecode.linkReferences.map((linkRef) => `    ["${linkRef.name || linkRef.reference}"]: string;`);
    return `
  export interface ${contract.name}LibraryAddresses {
    ${linkLibrariesKeys.join('\n')}
  };`;
}
function pushImportIfUsed(importName, generatedCode, importArray) {
    if (new RegExp(`\\W${importName}(\\W|$)`).test(generatedCode))
        importArray.push(importName);
}
//# sourceMappingURL=index.js.map