import { Abi, Hex, MulticallResponse } from "viem";
import { getPublicClient } from "./publicClient";

export const multicallWithSameAbi = async ({
  chainId,
  contracts,
  abi,
  allMethods,
  allParams,
}: {
  chainId: number;
  contracts: Hex[];
  abi: Abi;
  allMethods: string[];
  allParams: unknown[][];
}) => {
  if (contracts.length && contracts.length === allMethods.length && contracts.length === allParams.length) {
    const results: unknown[] = [];

    const publicClient = getPublicClient(chainId);

    while (contracts.length > 0) {
      const chunk = contracts.splice(0, 200);
      const multiCallResults = (await publicClient.multicall({
        contracts: chunk.map((contract, idx) => {
          return {
            address: contract,
            abi,
            functionName: allMethods[idx],
            args: allParams[idx],
          };
        }),
      })) as MulticallResponse[];
      const response = multiCallResults.map((result) => {
        const val = result.result;
        return val;
      });
      response.forEach((result) => {
        results.push(result);
      });
    }
    return results;
  }
  return [];
};

export const multicallForSameContract = async ({
  chainId,
  params,
  abi,
  address,
  functionNames,
}: {
  chainId: number;
  params: (bigint | string | Hex | number)[][];
  abi: Abi;
  address: Hex;
  functionNames: string[];
}) => {
  const results: unknown[] = [];

  const publicClient = getPublicClient(chainId);

  while (params.length > 0) {
    const chunk = params.splice(0, 200);
    const multiCallResults = (await publicClient.multicall({
      contracts: chunk.map((param, index) => {
        return {
          address,
          abi,
          functionName: functionNames[index],
          args: param,
        };
      }),
    })) as MulticallResponse[];
    const response = multiCallResults.map((result) => {
      const val = result.result;
      return val;
    });
    results.push(...response);
  }
  return results;
};
