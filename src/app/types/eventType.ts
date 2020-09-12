export enum EventType {
    PORTFOLIO_CREATED = "PORTFOLIO_CREATED",
    PORTFOLIO_UPDATED = "PORTFOLIO_UPDATED",
    PORTFOLIO_LIST_UPDATED = "PORTFOLIO_LIST_UPDATED",
    PORTFOLIO_RELOAD = "PORTFOLIO_RELOAD",
    SET_PORTFOLIO = "SET_PORTFOLIO",
    HANDLE_ERROR = "HANDLE_ERROR",
    PRINT = "print",
    EXPORT = "exportTo",
    TRADE_CREATED = "DEAL_CREATED",
    TRADE_UPDATED = "DEAL_UPDATED",
    ASSET_CREATED = "ASSET_CREATED",
    ASSET_UPDATED = "ASSET_UPDATED",
    TOUR_EVENT = "TOUR_EVENT",
}

export interface AddTradeEvent {
    portfolioId?: number;
}
