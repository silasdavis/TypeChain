/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import { TransactionOverrides, TypedEventDescription, TypedFunctionDescription } from ".";

interface TestLibraryInterface extends Interface {
  functions: {
    enhanceVal: TypedFunctionDescription<{ encode([_val]: [BigNumberish]): string }>;
  };

  events: {};
}

export class TestLibrary extends Contract {
  connect(signerOrProvider: Signer | Provider | string): TestLibrary;
  attach(addressOrName: string): TestLibrary;
  deployed(): Promise<TestLibrary>;

  on(event: EventFilter | string, listener: Listener): TestLibrary;
  once(event: EventFilter | string, listener: Listener): TestLibrary;
  addListener(eventName: EventFilter | string, listener: Listener): TestLibrary;
  removeAllListeners(eventName: EventFilter | string): TestLibrary;
  removeListener(eventName: any, listener: Listener): TestLibrary;

  interface: TestLibraryInterface;

  functions: {
    enhanceVal(_val: BigNumberish): Promise<BigNumber>;
  };

  enhanceVal(_val: BigNumberish): Promise<BigNumber>;

  filters: {};

  estimate: {
    enhanceVal(_val: BigNumberish): Promise<BigNumber>;
  };
}