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

          <v-card>
            <v-card-title><h4>Сумма по категориям</h4></v-card-title>
            <v-divider></v-divider>
            <v-list dense>
              <div v-if="selectedEventsData.length">
                <v-list-tile v-for="(value, key) in amountByCategory">
                  <v-list-tile-content>{{key}}</v-list-tile-content>
                  <v-list-tile-content class="align-end">{{value}}</v-list-tile-content>
                </v-list-tile>
              </div>
              <v-list-tile v-else>
                <v-list-tile-content>Не выбрана ни одна категория</v-list-tile-content>
              </v-list-tile>

            </v-list>
          </v-card>

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

  get amountByCategory() {
    return this.selectedEventsData.reduce((categories, { type, totalAmount }) => {
      if (!categories[type]) categories[type] = 0
      categories[type] += parseFloat(totalAmount.split(' ')[1])
      return categories
    }, {})
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
      }))
  }
}
