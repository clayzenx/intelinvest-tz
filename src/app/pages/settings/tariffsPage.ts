import Decimal from "decimal.js";
import moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ApplyPromoCodeDialog} from "../../components/dialogs/applyPromoCodeDialog";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../services/clientService";
import {TariffService} from "../../services/tariffService";
import {Permission} from "../../types/permission";
import {Tariff} from "../../types/tariff";
import {Portfolio} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <div class="section-title">Тарифы</div>
            <v-card class="overflowXA">
                <div class="tariff">
                    <div class="tariff__header">
                        <div>
                            Выберите подходящий вам тарифный план
                            <div>
                                <v-radio-group v-model="monthly" class="radio-horizontal">
                                    <v-radio label="На месяц" :value="true"></v-radio>
                                    <v-radio label="На год" :value="false"></v-radio>
                                    <b>&nbsp;{{isDiscountApplied() ? '' : '-20%'}}</b>
                                </v-radio-group>
                            </div>
                        </div>
                        <div class="promo-code-component">
                            <span @click="applyPromoCode">Применить промо-код</span>
                            <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" bottom>
                                <div v-if="clientInfo.user.promoCode" slot="activator" class="promo-code-component__icon"></div>
                                <span>
                                    <div>Активирован промо-код</div>
                                    <div>Скидка составляет {{ clientInfo.user.promoCode.discount }}%</div>
                                    <div v-if="clientInfo.user.promoCode.expired">Срок действия до {{ clientInfo.user.promoCode.expired | date }}</div>
                                </span>
                            </v-tooltip>
                        </div>
                    </div>

                    <div class="tariff__info">
                        <p>
                            У вас подключен план {{ clientInfo.user.tariff.description }} до
                            <b>
                                <span>{{ clientInfo.user.paidTill | date }}</span>
                                <span v-if="isSubscriptionExpired()">(срок подписки истек)</span>
                            </b>

                            <span id="payment-loader" style="display: none">
                                <span id="check_payment"/>
                            </span>
                        </p>
                        <p>
                            Создано портфелей: <b>{{ clientInfo.user.portfoliosCount }}</b>, добавлено ценных бумаг: <b>{{ clientInfo.user.sharesCount }}</b>
                        </p>
                        <p v-if="clientInfo.user.foreignShares">
                            В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам
                        </p>
                    </div>

                    <p v-if="isDiscountApplied()" class="promotion">
                        Совершите покупку с вашей персональной скидкой <b>{{ clientInfo.user.nextPurchaseDiscount }}%</b>! (срок действия скидки до {{
                        clientInfo.user.nextPurchaseDiscountExpired | date }})
                    </p>

                    <div class="tariff__plans">
                        <table>
                            <tr>
                                <td class="no-borders"></td>
                                <td colspan="3">
                                    Получите бесплатный месяц подписки.
                                    <a @click="$router.push({name: 'promo-codes'})">Подробнее</a>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>
                                    <div class="tariff__plan_name">Бесплатный</div>
                                    <div class="tariff__plan_price">{{ getPriceLabel(Tariff.FREE) }}</div>
                                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                        <!-- TODO верстка либо переделать на кнопки, либо правильно дизйблить ссылки (кнопки лучше) -->
                                        <a slot="activator" @click="makePayment(Tariff.FREE)"
                                           :class="{'tariff__plan_btn': true, 'selected': isSelected(Tariff.FREE)}"
                                           :disabled="!isAvailable(Tariff.FREE) || isSelected(Tariff.FREE) || isProgress">
                                            <span v-if="!busyState[Tariff.FREE.name]">{{ getButtonLabel(Tariff.FREE) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.FREE.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </a>
                                        <span>
                                        Переход на Бесплатный тарифный план <br/> возможен только если не превышены лимиты.
                                    </span>
                                    </v-tooltip>
                                    <div class="tariff__plan_expires" v-if="isSelected(Tariff.FREE)">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                                <td>
                                    <div class="tariff__plan_name">Стандарт</div>
                                    <div v-if="isDiscountApplied()" class="tariff__plan_old-price">
                                        {{ getNoDiscountPriceLabel(Tariff.STANDARD) }}
                                    </div>
                                    <div class="tariff__plan_price">{{ getPriceLabel(Tariff.STANDARD) }}</div>
                                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                        <a slot="activator" @click="makePayment(Tariff.STANDARD)"
                                           :class="{'tariff__plan_btn': true, 'selected': isSelected(Tariff.STANDARD)}"
                                           :disabled="!isAvailable(Tariff.STANDARD) || isProgress">
                                            <span v-if="!busyState[Tariff.STANDARD.name]">{{ getButtonLabel(Tariff.STANDARD) }}</span>
                                            <v-progress-circular v-if="busyState[Tariff.STANDARD.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                        </a>
                                        <span>
                                        Переход на Стандарт тарифный план <br/> возможен только если не превышены лимиты.
                                    </span>
                                    </v-tooltip>
                                    <div v-if="isSelected(Tariff.STANDARD)" class="tariff__plan_expires">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                                <td>
                                    <div class="tariff__plan_name">Профессионал</div>
                                    <div v-if="isDiscountApplied()" class="tariff__plan_old-price">
                                        {{ getNoDiscountPriceLabel(Tariff.PRO) }}
                                    </div>
                                    <div class="tariff__plan_price">{{ getPriceLabel(Tariff.PRO) }}</div>
                                    <a @click="makePayment(Tariff.PRO)"
                                       :class="{'tariff__plan_btn': true, 'selected': isSelected(Tariff.PRO)}"
                                       :disabled="!isAvailable(Tariff.PRO) || isProgress">
                                        <span v-if="!busyState[Tariff.PRO.name]">{{ getButtonLabel(Tariff.PRO) }}</span>
                                        <v-progress-circular v-if="busyState[Tariff.PRO.name]" indeterminate color="primary" :size="20"></v-progress-circular>
                                    </a>
                                    <div v-if="isSelected(Tariff.PRO)" class="tariff__plan_expires">
                                        {{ getExpirationDescription() }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>Объем портфеля</td>
                                <td class="fs13">
                                    <span>7 ценных бумаг<br>1 портфель</span>
                                </td>
                                <td class="fs13">
                                    <span>Неограниченное кол-во бумаг<br/>2 портфеля</span>
                                </td>
                                <td class="fs13">
                                    <span>Неограниченное кол-во бумаг и портфелей</span>
                                </td>
                            </tr>
                            <tr>
                                <td>Базовый функционал</td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Доступ к разделу "Инвестиции"</td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Составной портфель</td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Доступ к функционалу "Стандарт"</td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Мобильное приложение</td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Учет зарубежных акций</td>
                                <td></td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Учет коротких позиций</td>
                                <td></td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                            <tr>
                                <td>Ранний доступ<br>к новому функционалу</td>
                                <td></td>
                                <td></td>
                                <td><div class="tariff__plans_check"></div></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </v-card>
        </v-container>`
})
export class TariffsPage extends UI {

    @Inject
    private clientService: ClientService;
    @Inject
    private tariffService: TariffService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;

    private Tariff = Tariff;

    /** Признак оплаты за месяц. */
    private monthly = true;

    private busyState: { [key: string]: boolean } = {
        FREE: false, STANDARD: false, PRO: false
    };

    private isProgress = false;

    /**
     * Открывает диалог для ввода промо-кода пользователя
     */
    private async applyPromoCode(): Promise<void> {
        await new ApplyPromoCodeDialog().show();
    }

    /**
     * Сделать платеж
     * @param tariff выбранный тариф
     */
    @ShowProgress
    @CatchErrors
    private async makePayment(tariff: Tariff): Promise<void> {
        if (this.isProgress) {
            return;
        }
        this.isProgress = true;
        this.busyState[tariff.name] = true;
        try {
            const orderData = await this.tariffService.makePayment(tariff, this.monthly);
            // если оплата не завершена, открываем фрэйм для оплаты
            if (!orderData.paymentOrder.done) {
                await this.tariffService.openPaymentFrame(orderData, this.clientInfo);
            } else {
                this.clientService.resetClientInfo();
                const client = await this.clientService.getClientInfo();
                await this.loadUser({token: this.clientInfo.token, user: client});
                this.$snotify.info("Оплата заказа успешно завершена");
            }
        } finally {
            this.busyState[tariff.name] = false;
            this.isProgress = false;
        }
    }

    private getPriceLabel(tariff: Tariff): string {
        return `${this.getPrice(tariff)} ${this.monthly ? " / месяц" : " / год"}`;
    }

    private getNoDiscountPriceLabel(tariff: Tariff): string {
        let price;
        if (this.monthly) {
            price = tariff.monthlyPrice;
        } else {
            price = new Decimal(tariff.monthlyPrice).mul(new Decimal(12));
        }
        return `${price.toFixed(2)} ${this.monthly ? " / месяц" : " / год"}`;
    }

    /**
     * Возвращает признак истекшей подписки
     */
    private isSubscriptionExpired(): boolean {
        return moment().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    /**
     * Возвращает признак того что для пользователя действует скидка. При соблюдении условий:
     * <ul>
     *     <il>Дата истечения скидки равна {@code null} или больше текущей даты</il>
     *     <il>скидка больше 0</il>
     * </ul>
     * @return признак того что для пользователя действует скидка
     */
    private isDiscountApplied(): boolean {
        const nextPurchaseDiscountExpired = DateUtils.parseDate(this.clientInfo.user.nextPurchaseDiscountExpired);
        return (nextPurchaseDiscountExpired == null || moment().isBefore(nextPurchaseDiscountExpired)) && this.clientInfo.user.nextPurchaseDiscount > 0;
    }

    private isSelected(tariff: Tariff): boolean {
        let userTariff = this.clientInfo.user.tariff;
        if (userTariff === Tariff.TRIAL) {
            userTariff = Tariff.PRO;
        }
        return userTariff === tariff;
    }

    private getButtonLabel(tariff: Tariff): string {
        if (!this.isAvailable(tariff)) {
            return "Недоступно";
        }
        if (this.isSelected(tariff)) {
            return tariff === Tariff.FREE ? "Подключен" : "Продлить";
        }
        return "Подключить";
    }

    private isAvailable(tariff: Tariff): boolean {
        return tariff.maxSharesCount >= this.clientInfo.user.sharesCount &&
            tariff.maxPortfoliosCount >= this.clientInfo.user.portfoliosCount &&
            (tariff.hasPermission(Permission.FOREIGN_SHARES) || !this.clientInfo.user.foreignShares);
    }

    private getExpirationDescription(): string {
        const paidTill = DateUtils.parseDate(this.clientInfo.user.paidTill);
        return (paidTill.isAfter(moment()) ? "Действует до " : "Истек ") + this.getExpirationDate();
    }

    private getExpirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }

    /**
     * Возвращает цену для тарифа с учетом скидки, если она действует
     * @param tariff тариф
     * @return цена для тарифа
     */
    private getPrice(tariff: Tariff): string {
        const isDiscountApplied = this.isDiscountApplied();
        const price = this.monthly ? tariff.monthlyPrice : isDiscountApplied ? tariff.yearFullPrice : tariff.yearPrice;
        const nextPurchaseDiscount = isDiscountApplied ? this.clientInfo.user.nextPurchaseDiscount : 0;
        return new Decimal(price).mul(new Decimal(100 - nextPurchaseDiscount)).div(new Decimal("100")).toFixed(0);
    }
}
