import {BigMoney} from "../../types/bigMoney";
import {Decimal} from 'decimal.js';

const DEFAULT_SCALE = 2;
const MAX_SCALE = 3;
const DF = new Intl.NumberFormat('ru', {minimumFractionDigits: DEFAULT_SCALE, maximumFractionDigits: DEFAULT_SCALE});
const DF_NO_SCALE = new Intl.NumberFormat('ru', {maximumFractionDigits: MAX_SCALE});

export class Filters {

    static formatMoneyAmount(value: string, needRound?: boolean, scale?: number) {
        if (!value) {
            return "0.00";
        }
        const amount = new BigMoney(value);
        if (needRound) {
            return DF.format(amount.amount.toDP(DEFAULT_SCALE, Decimal.ROUND_HALF_UP).toNumber());
        } else {
            return DF_NO_SCALE.format(scale ? amount.amount.toDP(scale, Decimal.ROUND_HALF_UP).toNumber() : amount.amount.toNumber());
        }
    }

    static formatNumber(value: string) {
        if (!value) {
            return "0.00";
        }
        return DF.format(new Decimal(value).toDP(DEFAULT_SCALE, Decimal.ROUND_HALF_UP).toNumber());

    }
}