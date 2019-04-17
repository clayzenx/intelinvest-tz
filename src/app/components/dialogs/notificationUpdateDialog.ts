import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap update-service-dialog">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="pb-0">
                    <span class="dialog-header-text pl-3">Обновления сервиса</span>
                </v-card-title>

                <v-card-text>
                    <div class="pl-3 py-0 update-service-dialog__content">
                        <div>
                            Исправили ошибки с расчетом графика стоимости и поработали
                            над замечаниями от вас из саппорта.
                            <br>
                            <br>
                            Сервисом удобно пользоваться не только в web-версии, также
                            и с мобильных устройств. Мы поддерживаем как ios, так и android. Скачать приложения вы можете по указанным ссылкам.
                        </div>
                        <div class="mt-3 mb-4">
                            <a href="https://itunes.apple.com/ru/app/intelinvest-%D1%83%D1%87%D0%B5%D1%82-%D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%B8%D1%86%D0%B8%D0%B9
                               /id1422478197?mt=8" title="Загрузите приложение в App Store" target="_blank" class="mr-1">
                                <img src="./img/help/app-store-badge2.svg" alt="pic">
                            </a>
                            <a href="https://play.google.com/store/apps/details?id=ru.intelinvest.portfolio" title="Загрузите приложение в Google Play"
                               target="_blank" class="ml-2">
                                <img src="./img/help/google-play-badge2.svg" alt="pic">
                            </a>
                        </div>
                        <div>
                            Желаем вам доходных инвестиций, команда Intelinvest
                            Все вопросы и предложения, как всегда, через форму обратной связи.
                            <br>
                            <br>
                            Почитать о всех обновлениях сервиса более подробно вы можете в нашем блоге
                            <a href="http://blog.intelinvest.ru/" target="_blank" class="decorationNone">blog.intelinvest.ru</a>
                            Оперативно получить поддержку можно в группе <a href="https://vk.com/intelinvest" target="_blank" class="decorationNone">VK</a>
                            или <a href="https://www.facebook.com/intelinvest.ru/" target="_blank" class="decorationNone">facebook</a>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions class="pr-3 pb-3">
                    <v-spacer></v-spacer>
                    <div class="pr-3 pb-3">
                        <v-btn color="primary" @click.native="acceptAndClose" dark>
                            Спасибо. Закрыть
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class NotificationUpdateDialog extends CustomDialog<void, BtnReturn> {

    static readonly DATE: string = "2018-10-05";

    private acceptAndClose(): void {
        this.close(BtnReturn.YES);
    }

    private openFeedBackDialog(): void {
        this.close(BtnReturn.SHOW_FEEDBACK);
    }
}
