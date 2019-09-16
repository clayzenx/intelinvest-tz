import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {EmptyPortfolioStub} from "../components/emptyPortfolioStub";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup, LineChartItem} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {Overview, OverviewPeriod, Portfolio} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {DateUtils} from "../utils/dateUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="portfolio" class="h100pc">
            <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
            <base-portfolio-page v-else :overview="overview" :portfolio-name="portfolio.portfolioParams.name"
                                 :portfolio-id="String(portfolio.portfolioParams.id)"
                                 :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :index-line-chart-data="indexLineChartData"
                                 :view-currency="portfolio.portfolioParams.viewCurrency"
                                 :state-key-prefix="StoreKeys.PORTFOLIO_CHART" :side-bar-opened="sideBarOpened" :share-notes="portfolio.portfolioParams.shareNotes"
                                 :professional-mode="portfolio.portfolioParams.professionalMode"
                                 :current-money-remainder="currentMoneyRemainder"
                                 @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable>
                <template v-if="false" #afterDashboard>
                    <v-layout align-center>
                        <v-btn-toggle v-model="selectedPeriod" @change="onPeriodChange" mandatory>
                            <v-btn v-for="period in periods" :value="period" :key="period.code" depressed class="btn-item">
                                {{ period.description }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-tooltip content-class="custom-tooltip-wrap" max-width="340px" bottom>
                            <sup class="custom-tooltip" slot="activator">
                                <v-icon>fas fa-info-circle</v-icon>
                            </sup>
                            <span>Будут отображены данные за выбранный период, начиная с даты первой сделки портфеля.</span>
                        </v-tooltip>
                    </v-layout>
                </template>
            </base-portfolio-page>
        </div>
    `,
    components: {BasePortfolioPage, EmptyPortfolioStub}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private exportService: ExportService;
    /** Данные графика стоимости портфеля */
    private lineChartData: LineChartItem[] = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** События для графика стоимости портфеля */
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Текущий объект с данными */
    private overview: Overview = null;
    /** Доступные периоды */
    private periods: Period[] = [];
    /** Выбранный период */
    private selectedPeriod: Period = null;
    /** Текущий остаток денег в портфеле */
    private currentMoneyRemainder: string = null;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.overview = this.portfolio.overview;
        await this.loadPortfolioLineChart();
        if (this.$tours["intro"] && this.$tours["intro"].currentStep === 5) {
            this.$tours["intro"].nextStep();
        }
        await this.getCurrentMoneyRemainder();
        const firstTradeYear = DateUtils.getYearDate(this.overview.firstTradeDate);
        const currentYear = dayjs().year();

        if (firstTradeYear < currentYear) {
            for (let year = firstTradeYear; year < currentYear; year++) {
                this.periods.push({code: String(year), description: String(year)});
            }
        }
        this.periods.push(...OverviewPeriod.values().map(value => {
            return {code: value.code, description: value.description} as Period;
        }));
        // по умолчанию выбран за весь период
        this.selectedPeriod = this.periods[this.periods.length - 1];
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.lineChartData = null;
        this.lineChartEvents = null;
        this.overview = this.portfolio.overview;
        await this.loadPortfolioLineChart();
        await this.getCurrentMoneyRemainder();
    }

    /**
     * Загружает текущие остатки по деньгам
     */
    @ShowProgress
    private async getCurrentMoneyRemainder(): Promise<void> {
        this.currentMoneyRemainder = await this.overviewService.getCurrentMoney(Number(this.portfolio.id));
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            this.lineChartData = await this.overviewService.getCostChart(this.portfolio.id);
            // TODO сделать независимую загрузку по признаку в localStorage
            if (this.portfolio.overview.firstTradeDate) {
                this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.portfolio.overview.firstTradeDate).format("DD.MM.YYYY"));
            }
            this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
        }
    }

    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }

    @ShowProgress
    private async onPeriodChange(): Promise<void> {
        this.loadOverview(this.selectedPeriod.code);
    }

    private async loadOverview(period: string): Promise<void> {
        this.overview = await this.overviewService.getPortfolioOverviewByPeriod(this.portfolio.id, period);
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }
}

export interface Period {
    code: string;
    description: string;
}
