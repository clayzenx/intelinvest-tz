import { Component, UI } from "../app/ui";
import { TableData } from "../components/tableData";
import { AmountData } from "../components/amountData";
import axios from "axios";

@Component({
  // language=Vue
  template: `
    <v-container fluid class="selectable">
      <table-data v-if="tableData.length" v-model="tableData" />
      <amount-data :tableData="tableData" />
    </v-container>
  `,
  components: { TableData, AmountData }
})
export class MainPage extends UI {

  private events: Array<TableDataType> = [];
  private eventsData: Array<TableDataType> = []

  get tableData() {
    return this.eventsData
  }

  set tableData(tableData) {
    this.eventsData = tableData
  }

  async created(): Promise<void> {
    this.events = (await axios.get('http://localhost:3004/events')).data

    this.eventsData = this.events.map(({
      date,
      totalAmount,
      quantity,
      label,
      comment,
      period,
      type }, idx) => ({
        date,
        totalAmount,
        quantity,
        label,
        comment,
        period,
        type,
        selected: false,
        id: idx
      })
    )
  }
}
