import Decimal from 'decimal.js';
import { parseUnits } from 'viem';

export class CLPoolUtils {
  private static Q96 = Math.pow(2, 96);
  private static tickMultiplier = 1.0001;

  public static roundTick = ({ tick, tickSpacing }: { tick: number; tickSpacing: number }) => {
    return Math.round(tick / tickSpacing) * tickSpacing;
  };

  public static getTickFromPrice = ({
    price,
    decimal0,
    tickSpacing,
    decimal1,
  }: {
    price: number;
    tickSpacing: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const calculatedTick = Math.floor(Math.log(price / (Math.pow(10, decimal0) / Math.pow(10, decimal1))) / Math.log(CLPoolUtils.tickMultiplier));
    return CLPoolUtils.roundTick({ tick: calculatedTick, tickSpacing });
  };

  public static getPriceFromTick = ({ tick, decimal0, decimal1 }: { tick: number; decimal0: number; decimal1: number }) => {
    return new Decimal(CLPoolUtils.tickMultiplier).pow(tick).mul(new Decimal(10).pow(decimal0)).div(new Decimal(10).pow(decimal1)).toNumber();
  };

  public static getPriceFromSqrtRatio = ({ sqrtPriceX96, decimal0, decimal1 }: { sqrtPriceX96: bigint; decimal0: number; decimal1: number }) => {
    return new Decimal(sqrtPriceX96.toString())
      .div(new Decimal(CLPoolUtils.Q96))
      .pow(2)
      .mul(new Decimal(10).pow(decimal0))
      .div(new Decimal(10).pow(decimal1))
      .toNumber();
  };

  public static getSqrtPriceX96FromTick = ({ tick }: { tick: number }) => {
    return new Decimal(CLPoolUtils.tickMultiplier)
      .pow(tick / 2)
      .mul(CLPoolUtils.Q96)
      .toFixed(0);
  };

  public static calculateTokenSwapDistribution = ({
    token0,
    token1,
    zapInToken,
    zapInAmount,
    token1ToToken0,
  }: {
    token0: {
      decimals: number;
      price: string | number;
    };
    zapInToken: {
      decimals: number;
      price: string | number;
    };
    token1: {
      decimals: number;
      price: string | number;
    };
    token1ToToken0: number | string;
    zapInAmount: string | number;
  }) => {
    const token1ToToken0USD = Number(token1ToToken0) * Number(token1.price);

    const totalUSD = Number(token0.price) + token1ToToken0USD;

    const token0Multiplier = Number(token0.price) / totalUSD;
    const token1Multiplier = Number(token1ToToken0USD) / totalUSD;

    const zapInAmountUSD = Number(zapInAmount) * Number(zapInToken.price);

    const swapAmountForToken0USD = Number(zapInAmountUSD) * token0Multiplier;
    const swapAmountForToken1USD = Number(zapInAmountUSD) * token1Multiplier;

    const swapAmountForToken0 = Number(swapAmountForToken0USD) / Number(token0.price) || 0;
    const swapAmountForToken1 = Number(swapAmountForToken1USD) / Number(token1.price) || 0;

    const swapAmountForToken0InWei = parseUnits(swapAmountForToken0.toFixed(token0.decimals), token0.decimals);
    const swapAmountForToken1InWei = parseUnits(swapAmountForToken1.toFixed(token1.decimals), token1.decimals);

    return {
      amount0InWei: swapAmountForToken0InWei.toString(),
      amount1InWei: swapAmountForToken1InWei.toString(),
      amount0: swapAmountForToken0.toString(),
      amount1: swapAmountForToken1.toString(),
    };
  };

  public static getLiquidityOfToken0 = ({
    formattedToken0Amount,
    currentPrice,
    upperTick,
    decimal0,
    decimal1,
  }: {
    formattedToken0Amount: number;
    currentPrice: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const maxPrice = CLPoolUtils.getPriceFromTick({ tick: upperTick, decimal0, decimal1 });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMaxPrice = Math.sqrt(maxPrice);
    return (formattedToken0Amount * sqrtCurrentPrice * sqrtMaxPrice) / (sqrtMaxPrice - sqrtCurrentPrice);
  };

  public static getLiquidityOfToken1 = ({
    formattedToken1Amount,
    currentPrice,
    lowerTick,
    decimal0,
    decimal1,
  }: {
    formattedToken1Amount: number;
    currentPrice: number;
    lowerTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const minPrice = CLPoolUtils.getPriceFromTick({ tick: lowerTick, decimal0, decimal1 });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMinPrice = Math.sqrt(minPrice);
    return formattedToken1Amount / (sqrtCurrentPrice - sqrtMinPrice);
  };

  public static getToken1Amount = ({
    formattedToken0Amount,
    sqrtPriceX96,
    lowerTick,
    upperTick,
    decimal0,
    decimal1,
  }: {
    formattedToken0Amount: number;
    sqrtPriceX96: bigint;
    lowerTick: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const currentPrice = CLPoolUtils.getPriceFromSqrtRatio({
      sqrtPriceX96,
      decimal0,
      decimal1,
    });
    const liquidityOfToken0 = CLPoolUtils.getLiquidityOfToken0({
      formattedToken0Amount,
      currentPrice,
      upperTick,
      decimal0,
      decimal1,
    });
    const minPrice = CLPoolUtils.getPriceFromTick({ tick: lowerTick, decimal0, decimal1 });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMinPrice = Math.sqrt(minPrice);
    return liquidityOfToken0 * (sqrtCurrentPrice - sqrtMinPrice);
  };

  public static getToken0Amount = ({
    formattedToken1Amount,
    sqrtPriceX96,
    lowerTick,
    upperTick,
    decimal0,
    decimal1,
  }: {
    formattedToken1Amount: number;
    sqrtPriceX96: bigint;
    lowerTick: number;
    upperTick: number;
    decimal0: number;
    decimal1: number;
  }) => {
    const currentPrice = CLPoolUtils.getPriceFromSqrtRatio({
      sqrtPriceX96,
      decimal0,
      decimal1,
    });
    const liquidityOfToken1 = CLPoolUtils.getLiquidityOfToken1({
      formattedToken1Amount,
      currentPrice,
      lowerTick,
      decimal0,
      decimal1,
    });
    const maxPrice = CLPoolUtils.getPriceFromTick({ tick: upperTick, decimal0, decimal1 });
    const sqrtCurrentPrice = Math.sqrt(currentPrice);
    const sqrtMaxPrice = Math.sqrt(maxPrice);
    return liquidityOfToken1 * (1 / sqrtCurrentPrice - 1 / sqrtMaxPrice);
  };

  public static getTickAtSqrtPrice = ({ sqrtPriceX96 }: { sqrtPriceX96: string }) => {
    const sqrtPrice = new Decimal(sqrtPriceX96).div(CLPoolUtils.Q96);
    const price = sqrtPrice.pow(2);
    const tick = new Decimal(Math.log(price.toNumber())).div(Math.log(CLPoolUtils.tickMultiplier));
    return Math.floor(tick.toNumber());
  };

  public static getTokenAmountsForLiquidity = ({
    liquidity,
    sqrtPriceX96,
    lowerTick,
    upperTick,
  }: {
    liquidity: string;
    sqrtPriceX96: string;
    lowerTick: number;
    upperTick: number;
  }) => {
    const sqrtRatioA = new Decimal(Math.sqrt(Math.pow(CLPoolUtils.tickMultiplier, lowerTick)));
    const sqrtRatioB = new Decimal(Math.sqrt(Math.pow(CLPoolUtils.tickMultiplier, upperTick)));

    const sqrtPrice = new Decimal(sqrtPriceX96).div(CLPoolUtils.Q96);
    const currentTick = CLPoolUtils.getTickAtSqrtPrice({ sqrtPriceX96 });
    let amount0InWei = new Decimal(0);
    let amount1InWei = new Decimal(0);
    if (currentTick < lowerTick) {
      amount0InWei = new Decimal(liquidity).mul(sqrtRatioB.minus(sqrtRatioA).div(sqrtRatioA.mul(sqrtRatioB)));
    } else if (currentTick >= upperTick) {
      amount1InWei = new Decimal(liquidity).mul(sqrtRatioB.minus(sqrtRatioA));
    } else if (currentTick >= lowerTick && currentTick < upperTick) {
      amount0InWei = new Decimal(liquidity).mul(sqrtRatioB.minus(sqrtPrice).div(new Decimal(sqrtPrice).mul(sqrtRatioB)));
      amount1InWei = new Decimal(liquidity).mul(new Decimal(sqrtPrice).minus(sqrtRatioA));
    }

    return { amount0InWei: amount0InWei.toFixed(0), amount1InWei: amount1InWei.toFixed(0) };
  };

  public static calculateAprByRange = ({
    poolApr,
    lowerTick,
    upperTick,
    tickSpacing,
  }: {
    poolApr: number;
    lowerTick: number;
    upperTick: number;
    tickSpacing: number;
  }) => {
    const bin = Math.abs((upperTick - lowerTick) / tickSpacing);
    return Number((poolApr / bin).toFixed(2));
  };

  public static calculateAPY = ({ apr }: { apr: string }) => {
    const dpr = new Decimal(apr).div(365).div(100);
    const apy = new Decimal(1).plus(dpr).pow(365).minus(1).mul(100).toFixed(2);
    return apy;
  };
}
