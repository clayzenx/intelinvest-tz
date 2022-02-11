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
            v-model="tableData"
          />

          <pre>
            {{selectedEventsData}}
          </pre>


          <!-- todo вывести таблицу с событиями, колонки: Дата (date), Сумма (totalAmount), Количество (quantity), Название (label), Комментарий (comment), Период (period) -->
        </v-container>
    `,
  components: { TableData }
})
export class MainPage extends UI {

  private events: Array<TableDataType> = [];

  private eventsData: Array<TableDataType> = []
  private selectedEventsData: Array<TableDataType> = [];

  get tableData() {
    return this.eventsData
  }

  set tableData(tableData) {
    this.eventsData = tableData
    this.selectedEventsData = tableData.filter(({ selected }) => selected)
  }

  async created(): Promise<void> {
    this.events = (await axios.get('http://localhost:3004/events')).data
    this.eventsData = this.events.map(({
      date,
      totalAmount,
      quantity,
      label,
      comment,
      period }, idx) => ({
        date,
        totalAmount,
        quantity,
        label,
        comment,
        period,
        selected: false,
        id: idx
      }))
  }
}
