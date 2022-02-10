declare module "*";

declare interface UseDeskWidget {
  toggle: (toggle: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  open: (type?: string) => void;
  sendMessage: (message: WidgetMessage) => void;
  userIdentify: (user: WidgetUserInfo) => void;
  identify: (user: WidgetUserInfo) => void;
  openCallback: () => void;
  closeCallback: () => void;
}

declare interface WidgetUserInfo {
  name?: string;
  email?: string;
  phone?: string;
}

declare interface WidgetMessage {
  message?: string;
  topic?: string;
}

declare interface TableDataType {
  date: string;
  amountPerShare: string;
  cleanAmountPerShare?: string;
  quantity: string;
  portfolioId?: number;
  executed: boolean;
  comment: string;
  tax?: string;
  cleanAmount: string;
  totalAmount: string;
  totalAmountOriginal: string;
  label: string;
  period: string;
  type: string;
}


interface Window {
  usedeskMessenger: UseDeskWidget;
  __widgetInitCallback: (widget: UseDeskWidget) => void;
}
