/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { BigNumber } from "bignumber.js";

export interface Name12ManglingContract
  extends Truffle.Contract<Name12ManglingInstance> {
  "new"(meta?: Truffle.TransactionDetails): Promise<Name12ManglingInstance>;
}

type AllEvents = never;

export interface Name12ManglingInstance extends Truffle.ContractInstance {
  works(txDetails?: Truffle.TransactionDetails): Promise<boolean>;
}
