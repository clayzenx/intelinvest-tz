import { Component, UI } from "../app/ui";
import { TableData } from "../components/tableData";
import axios from "axios";

@Component({
  // language=Vue
  template: `
        <v-container fluid class="selectable">
          main page
          events size: {{ events.length }}

          <table-data 
            v-if="tableData.length"
            :data="tableData"
          />

          <!-- todo вывести таблицу с событиями, колонки: Дата (date), Сумма (totalAmount), Количество (quantity), Название (label), Комментарий (comment), Период (period) -->
        </v-container>
    `,
  components: { TableData }
})
export class MainPage extends UI {

  private events: Array<TableData> = [];

  get tableData() {
    return this.events.map(({ 
      date, 
      totalAmount, 
      quantity, 
      label,
      comment, 
      period }) => ({
        date, 
        totalAmount, 
        quantity, 
        label, 
        comment, 
        period
      }))
  } 

  async created(): Promise<void> {
    this.events = (await axios.get('http://localhost:3004/events')).data;
  }
}
